"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type CommissionRow = {
  commission: string;
  cruiseline_id: number;
  discount: string;
  gmc_discount: string | null;
  id: number;
  markup: string;
  status: number;
  subscription_plan_id: number;
};

type CruiseOption = {
  id: number;
  name: string;
};

type PlanOption = {
  id: number;
  plan_name: string;
};

type CommissionControlClientProps = {
  cruises: CruiseOption[];
  plans: PlanOption[];
  rows: CommissionRow[];
};

type BusyAction = string | null;

type ImportItem = {
  commission?: number;
  cruiseName: string;
  rowNumber: number;
};

type ImportSummary = {
  inserted: ImportItem[];
  skippedExisting: ImportItem[];
  skippedInvalidCommission: Array<ImportItem & { commission?: string }>;
  skippedUnmatchedCruise: ImportItem[];
  tenantTablesUpdated: number;
};

type ImportPreviewRow = {
  inputCommission: string;
  inputCruiseName: string;
  matchedCruiseId: number | null;
  matchedCruiseName: string;
  parsedCommission: number | null;
  rowNumber: number;
  status: "existing" | "invalid" | "ready" | "unmatched";
  suggestions: Array<{ id: number; name: string }>;
};

function normalizeSpreadsheetHeader(value: unknown) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function extractCommissionRows(sheetRows: unknown[][]) {
  const headerRowIndex = sheetRows.findIndex((row) => {
    const headers = row.map(normalizeSpreadsheetHeader);
    return (
      headers.some((header) =>
        ["cruiseline", "cruiselines", "cruisename"].includes(header),
      ) && headers.includes("commission")
    );
  });

  if (headerRowIndex < 0) {
    throw new Error(
      "Could not find Cruiselines and Commission headers in the workbook",
    );
  }

  const headers = sheetRows[headerRowIndex].map(normalizeSpreadsheetHeader);
  const cruiseColumnIndex = headers.findIndex((header) =>
    ["cruiseline", "cruiselines", "cruisename"].includes(header),
  );
  const commissionColumnIndex = headers.indexOf("commission");

  return sheetRows
    .slice(headerRowIndex + 1)
    .map((row) => ({
      Commission: row[commissionColumnIndex] ?? "",
      Cruiselines: row[cruiseColumnIndex] ?? "",
    }))
    .filter(
      (row) =>
        String(row.Cruiselines || "").trim() ||
        String(row.Commission || "").trim(),
    );
}

const emptyForm = {
  commission: "0",
  cruiseline_id: "",
  discount: "0",
  gmc_discount: "0",
  markup: "0",
  status: "1",
  subscription_plan_id: "",
};

async function postCommissionAction(body: Record<string, unknown>) {
  const response = await fetch("/api/adminmaster/commission-control", {
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.message || "Unable to update commission");
  }

  return response.json();
}

export default function CommissionControlClient({
  cruises,
  plans,
  rows,
}: CommissionControlClientProps) {
  const router = useRouter();
  const [form, setForm] = useState(emptyForm);
  const [busyAction, setBusyAction] = useState<BusyAction>(null);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPlan, setImportPlan] = useState(
    plans[0]?.id ? String(plans[0].id) : "",
  );
  const [importSummary, setImportSummary] = useState<ImportSummary | null>(null);
  const [importPreview, setImportPreview] = useState<ImportPreviewRow[]>([]);
  const [pendingImportRows, setPendingImportRows] = useState<Array<Record<string, unknown>>>([]);
  const [selectedPlan, setSelectedPlan] = useState(
    plans[0]?.id ? String(plans[0].id) : "all",
  );
  const cruiseMap = new Map(cruises.map((cruise) => [String(cruise.id), cruise.name]));
  const planMap = new Map(plans.map((plan) => [String(plan.id), plan.plan_name]));
  const visibleRows =
    selectedPlan === "all"
      ? rows
      : rows.filter((row) => String(row.subscription_plan_id) === selectedPlan);

  function updateForm(field: keyof typeof emptyForm, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusyAction("add");

    try {
      await postCommissionAction({
        action: "add",
        ...form,
        commission: form.commission || "0",
      });
      setForm(emptyForm);
      router.refresh();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Unable to add commission");
    } finally {
      setBusyAction(null);
    }
  }

  async function handleUpdate(formData: FormData) {
    const id = String(formData.get("id") || "");
    setBusyAction(`update-${id}`);

    try {
      await postCommissionAction({
        action: "update",
        commission: String(formData.get("commission") || "0"),
        cruiseline_id: String(formData.get("cruiseline_id") || "0"),
        discount: String(formData.get("discount") || "0"),
        gmc_discount: String(formData.get("gmc_discount") || "0"),
        id,
        markup: String(formData.get("markup") || "0"),
        status: String(formData.get("status") || "0"),
        subscription_plan_id: String(formData.get("subscription_plan_id") || "0"),
      });
      router.refresh();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Unable to update commission");
    } finally {
      setBusyAction(null);
    }
  }

  async function handleDelete(row: CommissionRow) {
    const confirmed = window.confirm(
      `Delete commission row ID ${row.id} from master and all tenant agent commission tables?`,
    );

    if (!confirmed) return;

    setBusyAction(`delete-${row.id}`);

    try {
      await postCommissionAction({
        action: "delete",
        id: row.id,
      });
      router.refresh();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Unable to delete commission");
    } finally {
      setBusyAction(null);
    }
  }

  async function handleSyncAll() {
    const confirmed = window.confirm(
      "Sync all master commission rows to companies that have commission sync enabled?",
    );

    if (!confirmed) return;

    setBusyAction("sync_all");

    try {
      await postCommissionAction({ action: "sync_all" });
      router.refresh();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Unable to sync tenants");
    } finally {
      setBusyAction(null);
    }
  }

  async function handleImport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!importPlan || !importFile) {
      window.alert("Select a plan and Excel file before uploading");
      return;
    }

    setBusyAction("preview_import");
    setImportSummary(null);
    setImportPreview([]);
    setPendingImportRows([]);

    try {
      const XLSX = await import("xlsx");
      const workbook = XLSX.read(await importFile.arrayBuffer(), {
        type: "array",
      });
      const firstSheetName = workbook.SheetNames[0];
      const firstSheet = firstSheetName
        ? workbook.Sheets[firstSheetName]
        : undefined;

      if (!firstSheet) {
        throw new Error("The workbook does not contain a worksheet");
      }

      const sheetRows = XLSX.utils.sheet_to_json<unknown[]>(firstSheet, {
        defval: "",
        header: 1,
        raw: true,
      });
      const spreadsheetRows = extractCommissionRows(sheetRows);
      const result = await postCommissionAction({
        action: "import",
        preview: true,
        rows: spreadsheetRows,
        subscription_plan_id: importPlan,
      });

      setImportPreview(result.previewRows as ImportPreviewRow[]);
      setPendingImportRows(spreadsheetRows);
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Unable to import commission Excel",
      );
    } finally {
      setBusyAction(null);
    }
  }

  async function handleConfirmImport() {
    if (!importPlan || pendingImportRows.length === 0) return;

    const readyCount = importPreview.filter((row) => row.status === "ready").length;
    if (!readyCount) {
      window.alert("There are no new matched rows to insert");
      return;
    }
    if (!window.confirm(`Insert ${readyCount} new commission rows?`)) return;

    setBusyAction("import");
    try {
      const result = await postCommissionAction({
        action: "import",
        rows: pendingImportRows,
        subscription_plan_id: importPlan,
      });
      setImportSummary(result.summary as ImportSummary);
      router.refresh();
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Unable to import commissions",
      );
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <section className="adminmaster-panel commission-control-panel">
      <div className="adminmaster-panel-header">
        <div>
          <h2>Master commission table</h2>
          <span>
            Showing {visibleRows.length} of {rows.length} rows
          </span>
        </div>
        <div className="commission-toolbar">
          <label>
            <span>Filter plan</span>
            <select
              onChange={(event) => setSelectedPlan(event.target.value)}
              value={selectedPlan}
            >
              <option value="all">All plans</option>
              {plans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.plan_name}
                </option>
              ))}
            </select>
          </label>
          <button
            className="adminmaster-button update"
            disabled={busyAction !== null}
            onClick={handleSyncAll}
            type="button"
          >
            {busyAction === "sync_all" ? "Syncing..." : "Sync enabled companies"}
          </button>
        </div>
      </div>

      <form className="commission-import-form" onSubmit={handleImport}>
        <div>
          <strong>Upload commission Excel</strong>
          <span>
            Existing plan/cruiseline rows and “In progress” values are skipped.
          </span>
        </div>
        <label>
          <span>Plan</span>
          <select
            onChange={(event) => {
              setImportPlan(event.target.value);
              setImportPreview([]);
              setPendingImportRows([]);
              setImportSummary(null);
            }}
            required
            value={importPlan}
          >
            <option value="">Select plan</option>
            {plans.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.plan_name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Excel file</span>
          <input
            accept=".xlsx,.xls"
            onChange={(event) => {
              setImportFile(event.target.files?.[0] || null);
              setImportPreview([]);
              setPendingImportRows([]);
              setImportSummary(null);
            }}
            required
            type="file"
          />
        </label>
        <button
          className="adminmaster-button activate"
          disabled={busyAction !== null}
          type="submit"
        >
          {busyAction === "preview_import" ? "Reading..." : "Preview Excel"}
        </button>
      </form>

      {importPreview.length > 0 ? (
        <section className="commission-import-preview">
          <div className="commission-import-preview-header">
            <div>
              <strong>Excel preview — nothing inserted yet</strong>
              <span>
                Review the matched database cruise name and ID before confirming.
              </span>
            </div>
            <button
              className="adminmaster-button activate"
              disabled={
                busyAction !== null ||
                !importPreview.some((row) => row.status === "ready")
              }
              onClick={handleConfirmImport}
              type="button"
            >
              {busyAction === "import" ? "Inserting..." : "Confirm insert"}
            </button>
          </div>
          <div className="adminmaster-table-wrap">
            <table className="adminmaster-table commission-import-preview-table">
              <thead>
                <tr>
                  <th>Excel row</th>
                  <th>Excel cruise name</th>
                  <th>DB cruise name</th>
                  <th>Cruise ID</th>
                  <th>Excel commission</th>
                  <th>Parsed %</th>
                  <th>Status / suggestions</th>
                </tr>
              </thead>
              <tbody>
                {importPreview.map((row) => (
                  <tr key={`${row.rowNumber}-${row.inputCruiseName}`}>
                    <td>{row.rowNumber}</td>
                    <td>{row.inputCruiseName || "—"}</td>
                    <td>{row.matchedCruiseName || "—"}</td>
                    <td>{row.matchedCruiseId ?? "—"}</td>
                    <td>{row.inputCommission || "—"}</td>
                    <td>{row.parsedCommission ?? "—"}</td>
                    <td>
                      <span className={`commission-import-status ${row.status}`}>
                        {row.status === "ready"
                          ? "Ready to insert"
                          : row.status === "existing"
                            ? "Already exists — skipped"
                            : row.status === "invalid"
                              ? "In progress/invalid — skipped"
                              : "No exact DB match"}
                      </span>
                      {row.suggestions.length > 0 ? (
                        <small>
                          Closest DB names: {row.suggestions
                            .map((suggestion) => `${suggestion.name} (ID ${suggestion.id})`)
                            .join(", ")}
                        </small>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {importSummary ? (
        <div className="commission-import-summary" role="status">
          <strong>Import completed</strong>
          <span>Added: {importSummary.inserted.length}</span>
          <span>Existing/duplicate skipped: {importSummary.skippedExisting.length}</span>
          <span>In progress/invalid skipped: {importSummary.skippedInvalidCommission.length}</span>
          <span>Unmatched cruise names: {importSummary.skippedUnmatchedCruise.length}</span>
          <span>Tenant table updates: {importSummary.tenantTablesUpdated}</span>
          {importSummary.skippedUnmatchedCruise.length > 0 ? (
            <small>
              Unmatched: {importSummary.skippedUnmatchedCruise
                .map((item) => item.cruiseName || `row ${item.rowNumber}`)
                .join(", ")}
            </small>
          ) : null}
        </div>
      ) : null}

      <form className="commission-add-form" onSubmit={handleAdd}>
        <label>
          <span>Plan</span>
          <select
            onChange={(event) => updateForm("subscription_plan_id", event.target.value)}
            required
            value={form.subscription_plan_id}
          >
            <option value="">Select plan</option>
            {plans.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.plan_name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Cruiseline</span>
          <select
            onChange={(event) => updateForm("cruiseline_id", event.target.value)}
            required
            value={form.cruiseline_id}
          >
            <option value="">Select cruiseline</option>
            {cruises.map((cruise) => (
              <option key={cruise.id} value={cruise.id}>
                {cruise.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Commission</span>
          <input
            onChange={(event) => updateForm("discount", event.target.value)}
            required
            value={form.discount}
          />
        </label>
        <label>
          <span>Markup</span>
          <input
            onChange={(event) => updateForm("markup", event.target.value)}
            required
            value={form.markup}
          />
        </label>
        <label>
          <span>GMC discount</span>
          <input
            onChange={(event) => updateForm("gmc_discount", event.target.value)}
            value={form.gmc_discount}
          />
        </label>
        <label>
          <span>Status</span>
          <select
            onChange={(event) => updateForm("status", event.target.value)}
            value={form.status}
          >
            <option value="1">Active</option>
            <option value="0">Inactive</option>
          </select>
        </label>
        <button
          className="adminmaster-button activate"
          disabled={busyAction !== null}
          type="submit"
        >
          {busyAction === "add" ? "Adding..." : "Add"}
        </button>
      </form>

      <div className="adminmaster-table-wrap">
        <table className="adminmaster-table commission-control-table">
          <thead>
            <tr>
              <th>Plan</th>
              <th>Cruiseline</th>
              <th>Commission</th>
              <th>Markup</th>
              <th>GMC</th>
              <th>Status</th>
              <th>Control</th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row) => (
              <tr key={row.id}>
                <td className="commission-hidden-field">{row.id}</td>
                <td>
                  <select name="subscription_plan_id" form={`commission-${row.id}`} defaultValue={String(row.subscription_plan_id)}>
                    {planMap.has(String(row.subscription_plan_id)) ? null : (
                      <option value={row.subscription_plan_id}>
                        Unknown plan ID {row.subscription_plan_id}
                      </option>
                    )}
                    {plans.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.plan_name}
                      </option>
                    ))}
                  </select>
                  <small className="commission-muted-id">ID {row.subscription_plan_id}</small>
                </td>
                <td>
                  <select name="cruiseline_id" form={`commission-${row.id}`} defaultValue={String(row.cruiseline_id)}>
                    {cruiseMap.has(String(row.cruiseline_id)) ? null : (
                      <option value={row.cruiseline_id}>
                        Unknown cruiseline ID {row.cruiseline_id}
                      </option>
                    )}
                    {cruises.map((cruise) => (
                      <option key={cruise.id} value={cruise.id}>
                        {cruise.name}
                      </option>
                    ))}
                  </select>
                  <small className="commission-muted-id">
                    ID {row.cruiseline_id}
                  </small>
                </td>
                <td className="commission-hidden-field">
                  <input name="commission" form={`commission-${row.id}`} defaultValue={row.commission} />
                </td>
                <td>
                  <input name="discount" form={`commission-${row.id}`} defaultValue={row.discount} />
                </td>
                <td>
                  <input name="markup" form={`commission-${row.id}`} defaultValue={row.markup} />
                </td>
                <td>
                  <input name="gmc_discount" form={`commission-${row.id}`} defaultValue={row.gmc_discount || "0"} />
                </td>
                <td>
                  <select name="status" form={`commission-${row.id}`} defaultValue={String(row.status)}>
                    <option value="1">Active</option>
                    <option value="0">Inactive</option>
                  </select>
                </td>
                <td>
                  <form
                    className="commission-row-actions"
                    id={`commission-${row.id}`}
                    action={handleUpdate}
                  >
                    <input name="id" type="hidden" value={row.id} />
                    <button
                      className="adminmaster-button update"
                      disabled={busyAction !== null}
                      type="submit"
                    >
                      {busyAction === `update-${row.id}` ? "Saving..." : "Update"}
                    </button>
                    <button
                      className="adminmaster-button delete"
                      disabled={busyAction !== null}
                      onClick={() => handleDelete(row)}
                      type="button"
                    >
                      {busyAction === `delete-${row.id}` ? "Deleting..." : "Delete"}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {visibleRows.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <div className="adminmaster-empty">
                    No commission rows found for {planMap.get(selectedPlan) || "this plan"}.
                  </div>
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
