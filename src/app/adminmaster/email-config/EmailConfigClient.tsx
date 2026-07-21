"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export type CompanyEmailConfig = {
  companyId: number;
  companyName: string;
  fromEmail: string;
  fromName: string;
  hasPassword: boolean;
  isEnabled: boolean;
  replyToEmail: string;
  slug: string;
  smtpHost: string;
  smtpPort: string;
  smtpUsername: string;
  updatedAt: string | null;
};

type FormState = CompanyEmailConfig & { smtpPassword: string };

function createForm(company: CompanyEmailConfig): FormState {
  return { ...company, smtpPassword: "" };
}

export default function EmailConfigClient({
  companies,
}: {
  companies: CompanyEmailConfig[];
}) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(companies[0]?.companyId || 0);
  const selectedCompany = useMemo(
    () => companies.find((company) => company.companyId === selectedId) || companies[0],
    [companies, selectedId],
  );
  const [form, setForm] = useState<FormState | null>(
    selectedCompany ? createForm(selectedCompany) : null,
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function selectCompany(companyId: number) {
    const company = companies.find((item) => item.companyId === companyId);
    setSelectedId(companyId);
    setForm(company ? createForm(company) : null);
    setMessage("");
    setError("");
  }

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => (current ? { ...current, [key]: value } : current));
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form) return;

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/adminmaster/email-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || "Unable to save SMTP configuration");
      }

      setMessage("SMTP configuration saved successfully.");
      setForm((current) =>
        current
          ? {
              ...current,
              hasPassword: current.hasPassword || Boolean(current.smtpPassword),
              smtpPassword: "",
            }
          : current,
      );
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save configuration");
    } finally {
      setSaving(false);
    }
  }

  if (!form) {
    return <div className="adminmaster-empty">No companies are available.</div>;
  }

  return (
    <div className="email-config-layout">
      <aside className="email-company-list" aria-label="Companies">
        {companies.map((company) => (
          <button
            className={company.companyId === selectedId ? "selected" : ""}
            key={company.companyId}
            onClick={() => selectCompany(company.companyId)}
            type="button"
          >
            <span>
              <strong>{company.companyName || company.slug}</strong>
              <small>{company.slug}</small>
            </span>
            <i className={company.isEnabled ? "enabled" : "disabled"}>
              {company.isEnabled ? "Enabled" : "Default"}
            </i>
          </button>
        ))}
      </aside>

      <form className="email-config-form" onSubmit={save}>
        <div className="email-config-heading">
          <div>
            <p className="adminmaster-kicker">{form.slug}</p>
            <h2>{form.companyName || form.slug}</h2>
          </div>
          <label className="email-config-toggle">
            <input
              checked={form.isEnabled}
              onChange={(event) => update("isEnabled", event.target.checked)}
              type="checkbox"
            />
            <span>Use tenant SMTP</span>
          </label>
        </div>

        <p className="email-config-note">
          When disabled, this tenant continues using the current AWS SES email flow.
        </p>

        <div className="email-config-grid">
          <label>
            <span>SMTP host *</span>
            <input
              onChange={(event) => update("smtpHost", event.target.value)}
              placeholder="smtp.example.com"
              value={form.smtpHost}
            />
          </label>
          <label>
            <span>SMTP port *</span>
            <input
              max="65535"
              min="1"
              onChange={(event) => update("smtpPort", event.target.value)}
              placeholder="587"
              type="number"
              value={form.smtpPort}
            />
          </label>
          <label>
            <span>SMTP username *</span>
            <input
              autoComplete="off"
              onChange={(event) => update("smtpUsername", event.target.value)}
              value={form.smtpUsername}
            />
          </label>
          <label>
            <span>SMTP password {form.hasPassword ? "(saved)" : "*"}</span>
            <input
              autoComplete="new-password"
              onChange={(event) => update("smtpPassword", event.target.value)}
              placeholder={form.hasPassword ? "Leave blank to keep existing password" : "Enter password"}
              type="password"
              value={form.smtpPassword}
            />
          </label>
          <label>
            <span>From email *</span>
            <input
              onChange={(event) => update("fromEmail", event.target.value)}
              placeholder="bookings@example.com"
              type="email"
              value={form.fromEmail}
            />
          </label>
          <label>
            <span>From name</span>
            <input
              onChange={(event) => update("fromName", event.target.value)}
              placeholder="Company name"
              value={form.fromName}
            />
          </label>
          <label className="email-config-full">
            <span>Reply-to email</span>
            <input
              onChange={(event) => update("replyToEmail", event.target.value)}
              placeholder="support@example.com"
              type="email"
              value={form.replyToEmail}
            />
          </label>
        </div>

        {error ? <p className="email-config-message error">{error}</p> : null}
        {message ? <p className="email-config-message success">{message}</p> : null}

        <div className="email-config-footer">
          <span>
            {form.updatedAt
              ? `Last updated ${new Date(form.updatedAt).toLocaleString()}`
              : "No SMTP configuration saved yet"}
          </span>
          <button disabled={saving} type="submit">
            {saving ? "Saving..." : "Save SMTP configuration"}
          </button>
        </div>
      </form>
    </div>
  );
}
