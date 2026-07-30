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

type DiagnosticResult = {
  type: "authentication" | "wallet" | "pricing";
  data: Record<string, unknown>;
};

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
  const [diagnosticBusy, setDiagnosticBusy] = useState("");
  const [diagnosticError, setDiagnosticError] = useState("");
  const [diagnosticResult, setDiagnosticResult] =
    useState<DiagnosticResult | null>(null);
  const [pricingTest, setPricingTest] = useState({
    itinerary: "c165df80-be38-410a-b431-b11725173f94",
    roomType: "",
    adults: "2",
    children: "0",
    infants: "0",
    offerId: "",
    priceType: "",
  });
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
    setDiagnosticError("");
    setDiagnosticResult(null);
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

  async function runDiagnostic(
    testType: "authentication" | "wallet" | "pricing",
  ) {
    if (!form.id) {
      setDiagnosticError("Save the integration before running a UAT test.");
      return;
    }

    setDiagnosticBusy(testType);
    setDiagnosticError("");
    setDiagnosticResult(null);

    try {
      const response = await fetch(
        "/api/adminmaster/direct-booking/test",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            integrationId: form.id,
            testType,
            ...(testType === "pricing" ? pricingTest : {}),
          }),
        },
      );
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || "Unable to run UAT diagnostic");
      }

      setDiagnosticResult({ type: testType, data: data.result || {} });
    } catch (testError) {
      setDiagnosticError(
        testError instanceof Error
          ? testError.message
          : "Unable to run UAT diagnostic",
      );
    } finally {
      setDiagnosticBusy("");
    }
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

        <section className="direct-booking-diagnostics">
          <div className="direct-booking-diagnostics-heading">
            <div>
              <p className="adminmaster-kicker">UAT diagnostics</p>
              <h3>Test Cordelia connection</h3>
              <p>
                These tests do not create a booking or debit the supplier wallet.
              </p>
            </div>
            <span className={form.environment === "UAT" ? "uat" : "production"}>
              {form.environment}
            </span>
          </div>

          <div className="direct-booking-test-actions">
            <button
              disabled={
                Boolean(diagnosticBusy) ||
                !form.id ||
                form.environment !== "UAT"
              }
              onClick={() => runDiagnostic("authentication")}
              type="button"
            >
              {diagnosticBusy === "authentication"
                ? "Testing..."
                : "Test authentication"}
            </button>
            <button
              disabled={
                Boolean(diagnosticBusy) ||
                !form.id ||
                form.environment !== "UAT"
              }
              onClick={() => runDiagnostic("wallet")}
              type="button"
            >
              {diagnosticBusy === "wallet" ? "Checking..." : "Check wallet"}
            </button>
          </div>

          <div className="direct-booking-pricing-test">
            <h4>Pricing test</h4>
            <div className="direct-booking-grid">
              <label className="direct-booking-wide">
                <span>UAT itinerary ID *</span>
                <input
                  onChange={(event) =>
                    setPricingTest((current) => ({
                      ...current,
                      itinerary: event.target.value,
                    }))
                  }
                  value={pricingTest.itinerary}
                />
              </label>
              <label>
                <span>Room type *</span>
                <input
                  onChange={(event) =>
                    setPricingTest((current) => ({
                      ...current,
                      roomType: event.target.value,
                    }))
                  }
                  placeholder="INTERIORSTANDARD"
                  value={pricingTest.roomType}
                />
              </label>
              <label>
                <span>Price type</span>
                <input
                  onChange={(event) =>
                    setPricingTest((current) => ({
                      ...current,
                      priceType: event.target.value,
                    }))
                  }
                  placeholder="Optional"
                  value={pricingTest.priceType}
                />
              </label>
              <label>
                <span>Adults *</span>
                <input
                  min="0"
                  onChange={(event) =>
                    setPricingTest((current) => ({
                      ...current,
                      adults: event.target.value,
                    }))
                  }
                  type="number"
                  value={pricingTest.adults}
                />
              </label>
              <label>
                <span>Children</span>
                <input
                  min="0"
                  onChange={(event) =>
                    setPricingTest((current) => ({
                      ...current,
                      children: event.target.value,
                    }))
                  }
                  type="number"
                  value={pricingTest.children}
                />
              </label>
              <label>
                <span>Infants</span>
                <input
                  min="0"
                  onChange={(event) =>
                    setPricingTest((current) => ({
                      ...current,
                      infants: event.target.value,
                    }))
                  }
                  type="number"
                  value={pricingTest.infants}
                />
              </label>
              <label>
                <span>Offer ID</span>
                <input
                  onChange={(event) =>
                    setPricingTest((current) => ({
                      ...current,
                      offerId: event.target.value,
                    }))
                  }
                  placeholder="Optional"
                  value={pricingTest.offerId}
                />
              </label>
            </div>
            <button
              className="direct-booking-run-pricing"
              disabled={
                Boolean(diagnosticBusy) ||
                !form.id ||
                form.environment !== "UAT" ||
                !pricingTest.itinerary.trim() ||
                !pricingTest.roomType.trim()
              }
              onClick={() => runDiagnostic("pricing")}
              type="button"
            >
              {diagnosticBusy === "pricing"
                ? "Calling pricing API..."
                : "Test pricing"}
            </button>
          </div>

          {diagnosticError ? (
            <p className="email-config-message error">{diagnosticError}</p>
          ) : null}

          {diagnosticResult ? (
            <div className="direct-booking-test-result">
              <strong>
                {diagnosticResult.type === "authentication"
                  ? "Authentication successful"
                  : diagnosticResult.type === "wallet"
                    ? "Wallet response"
                    : "Pricing response"}
              </strong>
              <pre>{JSON.stringify(diagnosticResult.data, null, 2)}</pre>
            </div>
          ) : null}
        </section>

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
