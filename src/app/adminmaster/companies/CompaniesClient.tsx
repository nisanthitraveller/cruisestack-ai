"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export type CompanyRow = {
  chatbot: number | null;
  deals_enabled: number | null;
  company_name: string;
  company_type: string | null;
  created_at: string | null;
  currency: string | null;
  domain: string | null;
  id: number;
  logo: string | null;
  payment_method: string | null;
  payment_status: string | null;
  plan_type: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  slug: string;
  special_discount_enabled: number | null;
  special_discount_percentage: number | string | null;
  status: number;
  subscription_plan: string | null;
  subscription_status: number | null;
  support_email: string | null;
};

type CompanyForm = {
  chatbot: string;
  deals_enabled: string;
  company_name: string;
  company_type: string;
  currency: string;
  domain: string;
  plan_type: string;
  primary_color: string;
  secondary_color: string;
  special_discount_enabled: string;
  special_discount_percentage: string;
  status: string;
  support_email: string;
};

type AgentRow = {
  commission_count: number | string;
  email: string;
  id: number;
  mobile: string | null;
  name: string;
  status: number;
  type: string;
  user_id: string;
};

const emptyAgentForm = {
  email: "",
  mobile: "",
  name: "",
  password: "",
  source_agent_id: "",
  user_id: "",
};

function formFromCompany(company: CompanyRow): CompanyForm {
  return {
    chatbot: Number(company.chatbot) === 1 ? "1" : "0",
    deals_enabled: Number(company.deals_enabled) === 1 ? "1" : "0",
    company_name: company.company_name || "",
    company_type: company.company_type || "B2C",
    currency: company.currency || "USD",
    domain: company.domain || "",
    plan_type: company.plan_type || "Beginner",
    primary_color: company.primary_color || "#003366",
    secondary_color: company.secondary_color || "#ffffff",
    special_discount_enabled:
      Number(company.special_discount_enabled) === 1 ? "1" : "0",
    special_discount_percentage: String(
      company.special_discount_percentage ?? 30,
    ),
    status: Number(company.status) === 1 ? "1" : "0",
    support_email: company.support_email || "",
  };
}

function formatDate(value: string | null) {
  if (!value) return "Not set";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not set";

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function EditIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="16" viewBox="0 0 24 24" width="16">
      <path d="M4 20h4l10.5-10.5a2.12 2.12 0 0 0-3-3L5 17v3Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      <path d="m14 8 3 3" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="16" viewBox="0 0 24 24" width="16">
      <path d="M4 7h16M9 7V4h6v3m-8 0 1 13h8l1-13" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      <path d="M10 11v5m4-5v5" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}

async function postCompanyAction(body: Record<string, unknown>) {
  const response = await fetch("/api/adminmaster/companies", {
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "Unable to update company");
  }

  return data;
}

export default function CompaniesClient({ companies }: { companies: CompanyRow[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingCompany, setEditingCompany] = useState<CompanyRow | null>(null);
  const [form, setForm] = useState<CompanyForm | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [agentCompany, setAgentCompany] = useState<CompanyRow | null>(null);
  const [agents, setAgents] = useState<AgentRow[]>([]);
  const [agentForm, setAgentForm] = useState(emptyAgentForm);
  const [agentError, setAgentError] = useState("");

  useEffect(() => {
    return () => {
      if (logoPreview.startsWith("blob:")) URL.revokeObjectURL(logoPreview);
    };
  }, [logoPreview]);

  const visibleCompanies = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return companies.filter((company) => {
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && Number(company.status) === 1) ||
        (statusFilter === "inactive" && Number(company.status) !== 1);
      const searchText = [
        company.company_name,
        company.slug,
        company.domain,
        company.support_email,
        company.plan_type,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesStatus && (!normalizedQuery || searchText.includes(normalizedQuery));
    });
  }, [companies, query, statusFilter]);

  function openEdit(company: CompanyRow) {
    setEditingCompany(company);
    setForm(formFromCompany(company));
    setLogoFile(null);
    setLogoPreview(company.logo || "");
  }

  function closeEdit() {
    if (busyAction) return;
    setEditingCompany(null);
    setForm(null);
    setLogoFile(null);
    setLogoPreview("");
  }

  function updateField(field: keyof CompanyForm, value: string) {
    setForm((current) => (current ? { ...current, [field]: value } : current));
  }

  async function saveCompany(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingCompany || !form) return;

    setBusyAction(`update-${editingCompany.id}`);

    try {
      await postCompanyAction({
        action: "update",
        companyId: editingCompany.id,
        ...form,
      });

      if (logoFile) {
        const logoFormData = new FormData();
        logoFormData.set("companyId", String(editingCompany.id));
        logoFormData.set("logo", logoFile);
        const logoResponse = await fetch("/api/adminmaster/companies/logo", {
          body: logoFormData,
          method: "POST",
        });
        const logoResult = await logoResponse.json().catch(() => null);

        if (!logoResponse.ok) {
          throw new Error(logoResult?.message || "Unable to upload company logo");
        }
      }

      setEditingCompany(null);
      setForm(null);
      setLogoFile(null);
      setLogoPreview("");
      router.refresh();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Unable to update company");
    } finally {
      setBusyAction(null);
    }
  }

  function selectLogo(file: File | null) {
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      window.alert("Logo must be smaller than 2 MB");
      return;
    }

    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      window.alert("Upload a PNG, JPG or WEBP image");
      return;
    }

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  }

  async function toggleStatus(company: CompanyRow) {
    const nextStatus = Number(company.status) === 1 ? 0 : 1;
    const actionLabel = nextStatus === 1 ? "activate" : "deactivate";

    if (
      !window.confirm(
        `${actionLabel === "activate" ? "Activate" : "Deactivate"} ${company.company_name}?`,
      )
    ) {
      return;
    }

    setBusyAction(`status-${company.id}`);

    try {
      await postCompanyAction({
        action: "set_status",
        companyId: company.id,
        status: nextStatus,
      });
      router.refresh();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Unable to update company status");
    } finally {
      setBusyAction(null);
    }
  }

  async function deleteCompany(company: CompanyRow) {
    const confirmation = window.prompt(
      `Permanently delete ${company.company_name} and its tenant data? Type the company name exactly to continue.`,
    );

    if (confirmation !== company.company_name) {
      if (confirmation !== null) {
        window.alert("Company name did not match. Nothing was deleted.");
      }
      return;
    }

    setBusyAction(`delete-${company.id}`);

    try {
      await postCompanyAction({
        action: "delete",
        companyId: company.id,
        confirmation,
      });
      router.refresh();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Unable to delete company");
    } finally {
      setBusyAction(null);
    }
  }

  async function openAgents(company: CompanyRow) {
    setAgentCompany(company);
    setAgents([]);
    setAgentForm(emptyAgentForm);
    setAgentError("");
    setBusyAction(`agents-${company.id}`);

    try {
      const result = await postCompanyAction({
        action: "list_agents",
        companyId: company.id,
      });
      const loadedAgents = Array.isArray(result?.agents) ? result.agents : [];
      setAgents(loadedAgents);
      setAgentForm((current) => ({
        ...current,
        source_agent_id: loadedAgents[0]?.id
          ? String(loadedAgents[0].id)
          : "",
      }));
    } catch (error) {
      setAgentError(
        error instanceof Error ? error.message : "Unable to load agents",
      );
    } finally {
      setBusyAction(null);
    }
  }

  function closeAgents() {
    if (busyAction) return;
    setAgentCompany(null);
    setAgents([]);
    setAgentForm(emptyAgentForm);
    setAgentError("");
  }

  async function addAgent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!agentCompany) return;
    setBusyAction(`add-agent-${agentCompany.id}`);
    setAgentError("");

    try {
      await postCompanyAction({
        action: "add_agent",
        companyId: agentCompany.id,
        ...agentForm,
      });
      const result = await postCompanyAction({
        action: "list_agents",
        companyId: agentCompany.id,
      });
      setAgents(Array.isArray(result?.agents) ? result.agents : []);
      setAgentForm((current) => ({
        ...emptyAgentForm,
        source_agent_id: current.source_agent_id,
      }));
    } catch (error) {
      setAgentError(
        error instanceof Error ? error.message : "Unable to add agent",
      );
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <section className="adminmaster-panel companies-panel">
      <div className="adminmaster-panel-header companies-toolbar">
        <div>
          <h2>All companies</h2>
          <span>
            Showing {visibleCompanies.length} of {companies.length}
          </span>
        </div>
        <div className="companies-filters">
          <input
            aria-label="Search companies"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name, slug, domain or email"
            type="search"
            value={query}
          />
          <select
            aria-label="Filter company status"
            onChange={(event) => setStatusFilter(event.target.value)}
            value={statusFilter}
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {visibleCompanies.length ? (
        <div className="adminmaster-table-wrap">
          <table className="adminmaster-table companies-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Domain</th>
                <th>Plan</th>
                <th>Type</th>
                <th>Created</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleCompanies.map((company) => {
                const isActive = Number(company.status) === 1;
                const isBusy = Boolean(busyAction?.endsWith(`-${company.id}`));
                const paymentPillClass =
                  company.payment_method === "manual"
                    ? "manual"
                    : company.payment_method
                      ? "online"
                      : "neutral";

                return (
                  <tr key={company.id}>
                    <td>
                      <div className="companies-company-cell">
                        <div className="companies-logo-thumbnail">
                          {company.logo ? (
                            <img
                              alt={`${company.company_name} logo`}
                              src={company.logo}
                            />
                          ) : (
                            <span>
                              {(company.company_name || company.slug)
                                .charAt(0)
                                .toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="adminmaster-company">
                          <strong>{company.company_name || company.slug}</strong>
                          <span>{company.slug}</span>
                          <span>{company.support_email || "No support email"}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="adminmaster-company">
                        <strong>{company.domain || "No domain"}</strong>
                        <span>{company.currency || "No currency"}</span>
                      </div>
                    </td>
                    <td>
                      <strong>{company.plan_type || "Not selected"}</strong>
                      <br />
                      <span className={`adminmaster-pill ${paymentPillClass}`}>
                        {company.payment_method || "No subscription"}
                      </span>
                    </td>
                    <td>
                      <div className="adminmaster-company">
                        <strong>{company.company_type || "Not set"}</strong>
                        <span>
                          {Number(company.special_discount_enabled) === 1
                            ? `${company.special_discount_percentage ?? 30}% special discount`
                            : "Special discount off"}
                        </span>
                      </div>
                    </td>
                    <td>{formatDate(company.created_at)}</td>
                    <td>
                      <span className={`adminmaster-pill ${isActive ? "active" : "blocked"}`}>
                        {isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <div className="companies-row-actions">
                        <button
                          className="adminmaster-button update"
                          disabled={isBusy}
                          onClick={() => openAgents(company)}
                          type="button"
                        >
                          Agents
                        </button>
                        <button
                          aria-label={`Edit ${company.company_name}`}
                          className="companies-icon-button edit"
                          disabled={isBusy}
                          onClick={() => openEdit(company)}
                          title="Edit company"
                          type="button"
                        >
                          <EditIcon />
                        </button>
                        <button
                          className={`adminmaster-button ${isActive ? "block" : "activate"}`}
                          disabled={isBusy}
                          onClick={() => toggleStatus(company)}
                          type="button"
                        >
                          {isBusy && busyAction?.startsWith("status-")
                            ? "Saving..."
                            : isActive
                              ? "Deactivate"
                              : "Activate"}
                        </button>
                        <button
                          aria-label={`Delete ${company.company_name}`}
                          className="companies-icon-button delete"
                          disabled={isBusy}
                          onClick={() => deleteCompany(company)}
                          title="Permanently delete company"
                          type="button"
                        >
                          <DeleteIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="adminmaster-empty">No companies match the selected filters.</div>
      )}

      {editingCompany && form ? (
        <div className="companies-modal-backdrop" onMouseDown={closeEdit} role="presentation">
          <section
            aria-labelledby="company-edit-title"
            aria-modal="true"
            className="companies-modal"
            onMouseDown={(event) => event.stopPropagation()}
            role="dialog"
          >
            <div className="companies-modal-header">
              <div>
                <p className="adminmaster-kicker">Company details</p>
                <h2 id="company-edit-title">Edit {editingCompany.company_name}</h2>
                <span>Slug: {editingCompany.slug}</span>
              </div>
              <button aria-label="Close edit company" disabled={Boolean(busyAction)} onClick={closeEdit} type="button">
                ×
              </button>
            </div>

            <form className="companies-edit-form" onSubmit={saveCompany}>
              <div className="companies-logo-editor">
                <div className="companies-logo-preview">
                  {logoPreview ? (
                    <img
                      alt={`${editingCompany.company_name} logo preview`}
                      src={logoPreview}
                    />
                  ) : (
                    <span>No logo</span>
                  )}
                </div>
                <div>
                  <strong>Company logo</strong>
                  <p>PNG, JPG or WEBP. Maximum size 2 MB.</p>
                  <label className="companies-logo-upload">
                    <span>{logoFile ? "Choose another logo" : "Choose logo"}</span>
                    <input
                      accept="image/png,image/jpeg,image/webp"
                      onChange={(event) =>
                        selectLogo(event.target.files?.[0] || null)
                      }
                      type="file"
                    />
                  </label>
                </div>
              </div>
              <label>
                <span>Company name</span>
                <input required maxLength={150} onChange={(event) => updateField("company_name", event.target.value)} value={form.company_name} />
              </label>
              <label>
                <span>Domain</span>
                <input maxLength={255} onChange={(event) => updateField("domain", event.target.value)} placeholder="example.com" value={form.domain} />
              </label>
              <label>
                <span>Support email</span>
                <input maxLength={255} onChange={(event) => updateField("support_email", event.target.value)} type="email" value={form.support_email} />
              </label>
              <label>
                <span>Currency</span>
                <input maxLength={3} onChange={(event) => updateField("currency", event.target.value.toUpperCase())} required value={form.currency} />
              </label>
              <label>
                <span>Plan</span>
                <select onChange={(event) => updateField("plan_type", event.target.value)} value={form.plan_type}>
                  <option value="Beginner">Beginner</option>
                  <option value="Professional">Professional</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
              </label>
              <label>
                <span>Company type</span>
                <select
                  onChange={(event) => {
                    const companyType = event.target.value;
                    updateField("company_type", companyType);
                    if (companyType !== "B2C") {
                      updateField("special_discount_enabled", "0");
                    }
                  }}
                  value={form.company_type}
                >
                  <option value="B2C">B2C</option>
                  <option value="B2B">B2B</option>
                </select>
              </label>
              <label>
                <span>Special discount</span>
                <select
                  disabled={form.company_type !== "B2C"}
                  onChange={(event) =>
                    updateField("special_discount_enabled", event.target.value)
                  }
                  value={form.special_discount_enabled}
                >
                  <option value="0">Disabled</option>
                  <option value="1">Enabled</option>
                </select>
              </label>
              <label>
                <span>Special discount percentage</span>
                <input
                  disabled={
                    form.company_type !== "B2C" ||
                    form.special_discount_enabled !== "1"
                  }
                  max={100}
                  min={0}
                  onChange={(event) =>
                    updateField(
                      "special_discount_percentage",
                      event.target.value,
                    )
                  }
                  required
                  step="0.01"
                  type="number"
                  value={form.special_discount_percentage}
                />
              </label>
              <label>
                <span>Primary colour</span>
                <div className="companies-color-field">
                  <input onChange={(event) => updateField("primary_color", event.target.value)} type="color" value={form.primary_color} />
                  <input maxLength={7} onChange={(event) => updateField("primary_color", event.target.value)} value={form.primary_color} />
                </div>
              </label>
              <label>
                <span>Secondary colour</span>
                <div className="companies-color-field">
                  <input onChange={(event) => updateField("secondary_color", event.target.value)} type="color" value={form.secondary_color} />
                  <input maxLength={7} onChange={(event) => updateField("secondary_color", event.target.value)} value={form.secondary_color} />
                </div>
              </label>
              <label>
                <span>Status</span>
                <select onChange={(event) => updateField("status", event.target.value)} value={form.status}>
                  <option value="1">Active</option>
                  <option value="0">Inactive</option>
                </select>
              </label>
              <label>
                <span>Chatbot</span>
                <select onChange={(event) => updateField("chatbot", event.target.value)} value={form.chatbot}>
                  <option value="1">Enabled</option>
                  <option value="0">Disabled</option>
                </select>
              </label>
              <label>
                <span>Best cruise deals</span>
                <select onChange={(event) => updateField("deals_enabled", event.target.value)} value={form.deals_enabled}>
                  <option value="1">Enabled</option>
                  <option value="0">Disabled</option>
                </select>
              </label>

              <div className="companies-readonly-details">
                <span>Company ID: {editingCompany.id}</span>
                <span>Created: {formatDate(editingCompany.created_at)}</span>
                <span>Slug is read-only because it identifies tenant tables.</span>
              </div>

              <div className="companies-modal-actions">
                <button className="adminmaster-refresh" disabled={Boolean(busyAction)} onClick={closeEdit} type="button">
                  Cancel
                </button>
                <button className="adminmaster-button update" disabled={Boolean(busyAction)} type="submit">
                  {busyAction?.startsWith("update-") ? "Saving..." : "Save changes"}
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}

      {agentCompany ? (
        <div className="companies-modal-backdrop" onMouseDown={closeAgents} role="presentation">
          <section
            aria-labelledby="company-agents-title"
            aria-modal="true"
            className="companies-modal"
            onMouseDown={(event) => event.stopPropagation()}
            role="dialog"
          >
            <div className="companies-modal-header">
              <div>
                <p className="adminmaster-kicker">Company agents</p>
                <h2 id="company-agents-title">Agents — {agentCompany.company_name}</h2>
                <span>Tenant table: {agentCompany.slug}_agent</span>
              </div>
              <button aria-label="Close agents" disabled={Boolean(busyAction)} onClick={closeAgents} type="button">×</button>
            </div>

            {agentError ? <div className="adminmaster-login-error">{agentError}</div> : null}

            <div className="adminmaster-table-wrap">
              <table className="adminmaster-table">
                <thead>
                  <tr><th>Name</th><th>Login</th><th>Type</th><th>Commissions</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {agents.map((agent) => (
                    <tr key={agent.id}>
                      <td><strong>{agent.name}</strong><br /><span>{agent.mobile || "No mobile"}</span></td>
                      <td>{agent.email}<br /><span>{agent.user_id}</span></td>
                      <td>{agent.type}</td>
                      <td>{Number(agent.commission_count || 0)}</td>
                      <td>{Number(agent.status) === 1 ? "Active" : "Inactive"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <form className="companies-edit-form" onSubmit={addAgent}>
              <label>
                <span>Agent name</span>
                <input required maxLength={150} value={agentForm.name} onChange={(event) => setAgentForm((current) => ({ ...current, name: event.target.value }))} />
              </label>
              <label>
                <span>Email</span>
                <input required type="email" value={agentForm.email} onChange={(event) => setAgentForm((current) => ({ ...current, email: event.target.value }))} />
              </label>
              <label>
                <span>User ID</span>
                <input required maxLength={100} value={agentForm.user_id} onChange={(event) => setAgentForm((current) => ({ ...current, user_id: event.target.value }))} />
              </label>
              <label>
                <span>Mobile</span>
                <input maxLength={30} value={agentForm.mobile} onChange={(event) => setAgentForm((current) => ({ ...current, mobile: event.target.value }))} />
              </label>
              <label>
                <span>Temporary password</span>
                <input required minLength={8} type="password" value={agentForm.password} onChange={(event) => setAgentForm((current) => ({ ...current, password: event.target.value }))} />
              </label>
              <label>
                <span>Copy commission from</span>
                <select required value={agentForm.source_agent_id} onChange={(event) => setAgentForm((current) => ({ ...current, source_agent_id: event.target.value }))}>
                  <option value="">Select an existing agent</option>
                  {agents.map((agent) => (
                    <option key={agent.id} value={agent.id}>{agent.name} — {agent.email} ({Number(agent.commission_count || 0)} rows)</option>
                  ))}
                </select>
              </label>
              <div className="companies-modal-actions">
                <button className="adminmaster-refresh" disabled={Boolean(busyAction)} onClick={closeAgents} type="button">Close</button>
                <button className="adminmaster-button update" disabled={Boolean(busyAction) || agents.length === 0} type="submit">
                  {busyAction?.startsWith("add-agent-") ? "Adding agent..." : "Add agent and copy commission"}
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </section>
  );
}
