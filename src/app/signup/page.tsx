"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type FormState = {
  companyName: string;
  domain: string;
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  supportEmail: string;
  currency: string;
  planType: "Beginner" | "Professional" | "Enterprise";
};

const initialForm: FormState = {
  companyName: "",
  domain: "",
  logo: "",
  primaryColor: "#003366",
  secondaryColor: "#ffffff",
  supportEmail: "",
  currency: "USD",
  planType: "Beginner",
};

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function CompanySignupPage() {
  const router = useRouter();

  const [form, setForm] = useState<FormState>(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const slugPreview = useMemo(() => slugify(form.companyName), [form.companyName]);

  function updateField<Key extends keyof FormState>(key: Key, value: FormState[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/company-signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to create company");
      }

      router.push(`/pricing?company=${data.company.slug}`);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to create company"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="signup-page">
      <section className="signup-intro">
        <p className="eyebrow">Company Signup</p>
        <h1>CruiseStack AI onboarding</h1>
        <p>
          Register a cruise company workspace for partners like Aerticket,
          GetMyCruise, and new white-label travel brands.
        </p>
      </section>

      <section className="signup-panel" aria-label="Company signup form">
        <div className="signup-panel-header">
          <div>
            <p className="panel-kicker">Workspace details</p>
            <h2>Create company</h2>
          </div>
        </div>

        {error && <div className="form-alert error">{error}</div>}

        <form className="signup-form" onSubmit={handleSubmit}>
          <label>
            <span>Company name</span>
            <input
              required
              value={form.companyName}
              onChange={(event) => updateField("companyName", event.target.value)}
              placeholder="Aerticket"
            />
          </label>

          <label>
            <span>Support email</span>
            <input
              required
              type="email"
              value={form.supportEmail}
              onChange={(event) => updateField("supportEmail", event.target.value)}
              placeholder="support@company.com"
            />
          </label>

          <label>
            <span>Domain</span>
            <input
              value={form.domain}
              onChange={(event) => updateField("domain", event.target.value)}
              placeholder="company.com"
            />
          </label>

          <label>
            <span>Logo URL</span>
            <input
              value={form.logo}
              onChange={(event) => updateField("logo", event.target.value)}
              placeholder="https://company.com/logo.png"
            />
          </label>

          <div className="form-row">
            <label>
              <span>Primary color</span>
              <input
                type="color"
                value={form.primaryColor}
                onChange={(event) => updateField("primaryColor", event.target.value)}
              />
            </label>

            <label>
              <span>Secondary color</span>
              <input
                type="color"
                value={form.secondaryColor}
                onChange={(event) => updateField("secondaryColor", event.target.value)}
              />
            </label>
          </div>

          <div className="form-row">
            <label>
              <span>Currency</span>
              <select
                value={form.currency}
                onChange={(event) => updateField("currency", event.target.value)}
              >
                <option value="USD">USD</option>
                <option value="INR">INR</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </label>
          </div>

          <div className="slug-preview">
            <span>Slug</span>
            <strong>{slugPreview || "company-slug"}</strong>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Creating company..." : "Create company"}
          </button>
        </form>
      </section>
    </main>
  );
}