"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export type DirectBookingCompany = {
  id: number;
  name: string;
  slug: string;
};

export type DirectBookingCruiseline = {
  id: number;
  name: string;
  odId: number | null;
};

export type DirectBookingProvider = {
  id: number;
  providerCode: string;
  providerName: string;
  adapterCode: string;
  status: boolean;
};

export type DirectBookingIntegration = {
  id: number;
  companyId: number;
  cruiselineId: number;
  providerId: number;
  environment: "UAT" | "PRODUCTION";
  isEnabled: boolean;
  inrFlowEnabled: boolean;
  prePaymentBalanceCheckEnabled: boolean;
  postPaymentBookingEnabled: boolean;
  credentialKeys: string[];
  updatedAt: string | null;
};

type CredentialDraft = { key: string; value: string };

const emptyIntegration = {
  id: 0,
  companyId: 0,
  cruiselineId: 0,
  providerId: 0,
  environment: "UAT" as const,
  isEnabled: false,
  inrFlowEnabled: false,
  prePaymentBalanceCheckEnabled: false,
  postPaymentBookingEnabled: false,
  credentialKeys: [],
  updatedAt: null,
};

export default function DirectBookingClient({
  companies,
  cruiselines,
  providers,
  integrations,
}: {
  companies: DirectBookingCompany[];
  cruiselines: DirectBookingCruiseline[];
  providers: DirectBookingProvider[];
  integrations: DirectBookingIntegration[];
}) {
  const router = useRouter();
  const [form, setForm] =
    useState<DirectBookingIntegration>(emptyIntegration);
  const [credentials, setCredentials] = useState<CredentialDraft[]>([]);
  const [providerForm, setProviderForm] = useState({
    providerCode: "",
    providerName: "",
    adapterCode: "",
  });
  const [providerOpen, setProviderOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const activeProviders = useMemo(
    () => providers.filter((provider) => provider.status),
    [providers],
  );

  function selectIntegration(integration?: DirectBookingIntegration) {
    const selected = integration || {
      ...emptyIntegration,
      companyId: companies[0]?.id || 0,
      cruiselineId: cruiselines[0]?.id || 0,
      providerId: activeProviders[0]?.id || 0,
    };
    setForm(selected);
    setCredentials(
      selected.credentialKeys.map((key) => ({ key, value: "" })),
    );
    setMessage("");
    setError("");
  }

  function updateForm<K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateCredential(
    index: number,
    field: keyof CredentialDraft,
    value: string,
  ) {
    setCredentials((current) =>
      current.map((credential, position) =>
        position === index ? { ...credential, [field]: value } : credential,
      ),
    );
  }

  async function api(body: Record<string, unknown>) {
    const response = await fetch("/api/adminmaster/direct-booking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(data?.message || "Unable to save direct booking settings");
    }

    return data;
  }

  async function saveIntegration(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");

    try {
      await api({
        action: "save_integration",
        ...form,
        credentials,
      });
      setMessage("Direct booking integration saved successfully.");
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save");
    } finally {
      setBusy(false);
    }
  }

  async function saveProvider(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      await api({ action: "save_provider", ...providerForm });
      setProviderOpen(false);
      setProviderForm({
        providerCode: "",
        providerName: "",
        adapterCode: "",
      });
      setMessage("API provider added successfully.");
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="direct-booking-layout">
      <section className="direct-booking-list">
        <div className="direct-booking-list-heading">
          <div>
            <h2>Configured routes</h2>
            <span>{integrations.length} integration(s)</span>
          </div>
          <button onClick={() => selectIntegration()} type="button">
            + New integration
          </button>
        </div>

        {integrations.length ? (
          integrations.map((integration) => {
            const company = companies.find(
              (item) => item.id === integration.companyId,
            );
            const cruise = cruiselines.find(
              (item) => item.id === integration.cruiselineId,
            );
            const provider = providers.find(
              (item) => item.id === integration.providerId,
            );

            return (
              <button
                className={form.id === integration.id ? "selected" : ""}
                key={integration.id}
                onClick={() => selectIntegration(integration)}
                type="button"
              >
                <span>
                  <strong>{company?.name || `Company #${integration.companyId}`}</strong>
                  <small>
                    {cruise?.name || `Cruise line #${integration.cruiselineId}`}
                    {" · "}
                    {provider?.providerName || `Provider #${integration.providerId}`}
                  </small>
                </span>
                <i className={integration.isEnabled ? "enabled" : "disabled"}>
                  {integration.isEnabled ? "Enabled" : "Disabled"}
                </i>
              </button>
            );
          })
        ) : (
          <p className="direct-booking-empty">
            No direct booking integrations have been configured.
          </p>
        )}
      </section>

      <form className="direct-booking-form" onSubmit={saveIntegration}>
        <div className="direct-booking-form-heading">
          <div>
            <p className="adminmaster-kicker">Routing configuration</p>
            <h2>{form.id ? "Edit integration" : "New integration"}</h2>
          </div>
          <button
            className="direct-booking-secondary"
            onClick={() => setProviderOpen(true)}
            type="button"
          >
            Manage providers
          </button>
        </div>

        <div className="direct-booking-grid">
          <label>
            <span>Company *</span>
            <select
              onChange={(event) =>
                updateForm("companyId", Number(event.target.value))
              }
              required
              value={form.companyId}
            >
              <option value="">Select company</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name} ({company.slug})
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Cruise line *</span>
            <select
              onChange={(event) =>
                updateForm("cruiselineId", Number(event.target.value))
              }
              required
              value={form.cruiselineId}
            >
              <option value="">Select cruise line</option>
              {cruiselines.map((cruise) => (
                <option key={cruise.id} value={cruise.id}>
                  {cruise.name}
                  {cruise.odId ? ` (ODY ${cruise.odId})` : ""}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>API provider *</span>
            <select
              onChange={(event) =>
                updateForm("providerId", Number(event.target.value))
              }
              required
              value={form.providerId}
            >
              <option value="">Select provider</option>
              {activeProviders.map((provider) => (
                <option key={provider.id} value={provider.id}>
                  {provider.providerName} ({provider.adapterCode})
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Environment *</span>
            <select
              onChange={(event) =>
                updateForm(
                  "environment",
                  event.target.value as "UAT" | "PRODUCTION",
                )
              }
              value={form.environment}
            >
              <option value="UAT">UAT / Sandbox</option>
              <option value="PRODUCTION">Production</option>
            </select>
          </label>
        </div>

        <div className="direct-booking-flags">
          <label>
            <input
              checked={form.isEnabled}
              onChange={(event) => updateForm("isEnabled", event.target.checked)}
              type="checkbox"
            />
            <span>
              <strong>Enable integration</strong>
              <small>Allows this route to be selected by the booking service.</small>
            </span>
          </label>
          <label>
            <input
              checked={form.inrFlowEnabled}
              onChange={(event) =>
                updateForm("inrFlowEnabled", event.target.checked)
              }
              type="checkbox"
            />
            <span>
              <strong>Enable for INR flow</strong>
              <small>USD direct-to-cruise-line flow remains unchanged.</small>
            </span>
          </label>
          <label>
            <input
              checked={form.prePaymentBalanceCheckEnabled}
              onChange={(event) =>
                updateForm(
                  "prePaymentBalanceCheckEnabled",
                  event.target.checked,
                )
              }
              type="checkbox"
            />
            <span>
              <strong>Check balance before payment</strong>
              <small>Validate supplier wallet before opening customer payment.</small>
            </span>
          </label>
          <label>
            <input
              checked={form.postPaymentBookingEnabled}
              onChange={(event) =>
                updateForm("postPaymentBookingEnabled", event.target.checked)
              }
              type="checkbox"
            />
            <span>
              <strong>Book after verified payment</strong>
              <small>Create the supplier booking after payment verification.</small>
            </span>
          </label>
        </div>

        <div className="direct-booking-credentials">
          <div>
            <h3>Provider credentials</h3>
            <p>
              Existing values are never displayed. Leave a saved value blank to
              keep it unchanged.
            </p>
          </div>
          {credentials.map((credential, index) => (
            <div className="direct-booking-credential-row" key={`${index}-${credential.key}`}>
              <input
                aria-label="Credential key"
                disabled={form.credentialKeys.includes(credential.key)}
                onChange={(event) =>
                  updateCredential(index, "key", event.target.value)
                }
                placeholder="X_AGENT_ID"
                value={credential.key}
              />
              <input
                aria-label={`Value for ${credential.key || "credential"}`}
                autoComplete="new-password"
                onChange={(event) =>
                  updateCredential(index, "value", event.target.value)
                }
                placeholder={
                  form.credentialKeys.includes(credential.key)
                    ? "Saved — leave blank to keep"
                    : "Secret value"
                }
                type="password"
                value={credential.value}
              />
              <button
                aria-label="Remove credential"
                onClick={() =>
                  setCredentials((current) =>
                    current.filter((_, position) => position !== index),
                  )
                }
                type="button"
              >
                ×
              </button>
            </div>
          ))}
          <button
            className="direct-booking-add-credential"
            onClick={() =>
              setCredentials((current) => [...current, { key: "", value: "" }])
            }
            type="button"
          >
            + Add credential
          </button>
        </div>

        {error ? <p className="email-config-message error">{error}</p> : null}
        {message ? <p className="email-config-message success">{message}</p> : null}

        <div className="direct-booking-footer">
          <span>
            {form.updatedAt
              ? `Last updated ${new Date(form.updatedAt).toLocaleString()}`
              : "Not saved yet"}
          </span>
          <button disabled={busy} type="submit">
            {busy ? "Saving..." : "Save integration"}
          </button>
        </div>
      </form>

      {providerOpen ? (
        <div className="email-test-modal" role="presentation">
          <form
            aria-labelledby="provider-dialog-title"
            className="email-test-dialog direct-booking-provider-dialog"
            onSubmit={saveProvider}
            role="dialog"
          >
            <div className="email-test-header">
              <div>
                <p className="adminmaster-kicker">Provider registry</p>
                <h3 id="provider-dialog-title">Add API provider</h3>
              </div>
              <button
                aria-label="Close provider dialog"
                className="email-test-close"
                disabled={busy}
                onClick={() => setProviderOpen(false)}
                type="button"
              >
                ×
              </button>
            </div>
            <label>
              <span>Provider name *</span>
              <input
                onChange={(event) =>
                  setProviderForm((current) => ({
                    ...current,
                    providerName: event.target.value,
                  }))
                }
                placeholder="Cordelia Cruises"
                required
                value={providerForm.providerName}
              />
            </label>
            <label>
              <span>Provider code *</span>
              <input
                onChange={(event) =>
                  setProviderForm((current) => ({
                    ...current,
                    providerCode: event.target.value,
                  }))
                }
                placeholder="CORDELIA"
                required
                value={providerForm.providerCode}
              />
            </label>
            <label>
              <span>Adapter code *</span>
              <input
                onChange={(event) =>
                  setProviderForm((current) => ({
                    ...current,
                    adapterCode: event.target.value,
                  }))
                }
                placeholder="cordelia-agent-api"
                required
                value={providerForm.adapterCode}
              />
            </label>
            <div className="email-test-actions">
              <button onClick={() => setProviderOpen(false)} type="button">
                Cancel
              </button>
              <button className="primary" disabled={busy} type="submit">
                {busy ? "Saving..." : "Add provider"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
