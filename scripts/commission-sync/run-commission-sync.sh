#!/usr/bin/env bash

set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SQL_FILE="${SCRIPT_DIR}/sync-discount-from-gmc.sql"
MODE="${1:-preview}"

MYSQL_DATABASE_VALUE="${MYSQL_DB:-${MYSQL_DATABASE:-saas_db}}"
MYSQL_PORT_VALUE="${DB_PORT:-${MYSQL_PORT:-3306}}"
BACKUP_DIR_VALUE="${BACKUP_DIR:-${SCRIPT_DIR}/backups}"

required_variables=(MYSQL_HOST MYSQL_USER MYSQL_PASSWORD)
for variable_name in "${required_variables[@]}"; do
  if [[ -z "${!variable_name:-}" ]]; then
    echo "Missing required environment variable: ${variable_name}" >&2
    exit 1
  fi
done

if [[ ! -f "${SQL_FILE}" ]]; then
  echo "SQL file not found: ${SQL_FILE}" >&2
  exit 1
fi

for command_name in mysql mysqldump gzip; do
  if ! command -v "${command_name}" >/dev/null 2>&1; then
    echo "Required command is not installed: ${command_name}" >&2
    exit 1
  fi
done

case "${MODE}" in
  preview|apply|backup|verify) ;;
  *)
    echo "Usage: $0 {preview|apply|backup|verify}" >&2
    exit 1
    ;;
esac

credentials_file="$(mktemp "${TMPDIR:-/tmp}/cruisestack-mysql-client.XXXXXX")"
chmod 600 "${credentials_file}"
procedure_installed=0

cleanup() {
  if [[ "${procedure_installed}" -eq 1 && -s "${credentials_file}" ]]; then
    mysql "--defaults-extra-file=${credentials_file}" \
      --execute="DROP PROCEDURE IF EXISTS sync_discount_from_gmc;" \
      >/dev/null 2>&1 || true
  fi
  rm -f "${credentials_file}"
}
trap cleanup EXIT

{
  echo "[client]"
  echo "host=${MYSQL_HOST}"
  echo "port=${MYSQL_PORT_VALUE}"
  echo "user=${MYSQL_USER}"
  echo "password=${MYSQL_PASSWORD}"
  echo "database=${MYSQL_DATABASE_VALUE}"
  echo "default-character-set=utf8mb4"
} > "${credentials_file}"

mysql_client=(mysql "--defaults-extra-file=${credentials_file}" --batch --raw)
dump_client=(mysqldump "--defaults-extra-file=${credentials_file}")

check_connection() {
  "${mysql_client[@]}" --execute="SELECT DATABASE() AS selected_database, NOW() AS server_time;"
}

install_procedure() {
  "${mysql_client[@]}" < "${SQL_FILE}"
  procedure_installed=1
}

drop_procedure() {
  "${mysql_client[@]}" --execute="DROP PROCEDURE IF EXISTS sync_discount_from_gmc;"
  procedure_installed=0
}

run_preview() {
  install_procedure
  "${mysql_client[@]}" --execute="CALL sync_discount_from_gmc(FALSE);"
  drop_procedure
}

create_backup() {
  mkdir -p "${BACKUP_DIR_VALUE}"
  chmod 700 "${BACKUP_DIR_VALUE}"

  timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
  backup_file="${BACKUP_DIR_VALUE}/${MYSQL_DATABASE_VALUE}-before-commission-sync-${timestamp}.sql.gz"

  "${dump_client[@]}" \
    --single-transaction \
    --quick \
    --routines \
    --triggers \
    --events \
    --hex-blob \
    "${MYSQL_DATABASE_VALUE}" | gzip -9 > "${backup_file}"

  if [[ ! -s "${backup_file}" ]]; then
    echo "Backup failed or produced an empty file: ${backup_file}" >&2
    exit 1
  fi

  chmod 600 "${backup_file}"
  gzip -t "${backup_file}"
  echo "Backup created and verified: ${backup_file}"
}

run_verify() {
  echo "Master rows where discount does not match gmc_discount:"
  "${mysql_client[@]}" --execute="
    SELECT COUNT(*) AS master_mismatch_count
    FROM cruisestack_master_commission
    WHERE gmc_discount IS NOT NULL
      AND NOT (discount <=> gmc_discount);
  "

  echo "A preview after a successful apply should report zero updated rows:"
  run_preview
}

check_connection

case "${MODE}" in
  preview)
    echo "Preview mode: every data change will be rolled back."
    run_preview
    ;;
  backup)
    create_backup
    ;;
  verify)
    run_verify
    ;;
  apply)
    if [[ "${CONFIRM_SYNC:-}" != "YES" ]]; then
      echo "Apply refused. Run with CONFIRM_SYNC=YES after reviewing preview mode." >&2
      exit 1
    fi

    create_backup
    echo "Running a final rollback-only preview before apply."
    run_preview

    install_procedure
    "${mysql_client[@]}" --execute="CALL sync_discount_from_gmc(TRUE);"
    drop_procedure

    echo "Apply completed. Running verification."
    run_verify
    ;;
esac
