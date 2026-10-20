# Commission discount synchronization

This server-side utility copies `gmc_discount` into `discount` for:

- `cruisestack_master_commission`
- tenant tables named `<company_slug>_agent_commission`

It explicitly excludes `tour_agent_commission` and every
`*_tour_agent_commission` table. It never changes
`cruisestack_master_commission.gmc_discount`.

## Requirements

- MySQL client (`mysql`)
- MySQL dump client (`mysqldump`)
- `gzip`
- A database account with `SELECT`, `UPDATE`, `CREATE ROUTINE`, `ALTER ROUTINE`
  and backup permissions

Export the same database settings used by the application:

```bash
export MYSQL_HOST='database-host'
export MYSQL_USER='database-user'
export MYSQL_PASSWORD='database-password'
export MYSQL_DB='saas_db'
export MYSQL_PORT='3306'
```

If the application environment file is valid shell syntax, it can instead be
loaded on the server with:

```bash
set -a
source .env
set +a
```

## Commands

Make the runner executable once:

```bash
chmod +x scripts/commission-sync/run-commission-sync.sh
```

Preview and rollback all changes:

```bash
scripts/commission-sync/run-commission-sync.sh preview
```

Create and verify a compressed full-database backup only:

```bash
scripts/commission-sync/run-commission-sync.sh backup
```

Apply after checking preview output. A fresh backup is mandatory and is created
automatically before the update:

```bash
CONFIRM_SYNC=YES scripts/commission-sync/run-commission-sync.sh apply
```

Verify later:

```bash
scripts/commission-sync/run-commission-sync.sh verify
```

Backups are written by default to:

```text
scripts/commission-sync/backups/
```

Use a different protected directory if required:

```bash
BACKUP_DIR='/secure/database-backups' \
  CONFIRM_SYNC=YES \
  scripts/commission-sync/run-commission-sync.sh apply
```

The script uses a temporary MySQL option file with mode `600`, removes it on
exit and does not place the password in the process command line.

