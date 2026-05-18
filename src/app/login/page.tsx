"use client";

import { FormEvent, Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [companySlug, setCompanySlug] = useState(searchParams?.get("company") || "");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const defaultUserId = useMemo(
    () => (companySlug.trim() ? `${companySlug.trim().toLowerCase()}_test` : ""),
    [companySlug]
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/agent/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          companySlug,
          identifier,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to log in");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Unable to log in");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-intro">
        <p className="eyebrow">Company Agent Sign In</p>
        <h1>Open your CruiseStack dashboard</h1>
        <p>
          Sign in with the agent created for your company workspace to view
          subscription, billing, and commission details.
        </p>
      </section>

      <section className="signup-panel login-panel" aria-label="Agent login form">
        <div className="signup-panel-header">
          <div>
            <p className="panel-kicker">Agent access</p>
            <h2>Sign in</h2>
          </div>
        </div>

        {error && <div className="form-alert error">{error}</div>}

        <form className="signup-form" onSubmit={handleSubmit}>
          <label>
            <span>Company slug</span>
            <input
              required
              value={companySlug}
              onChange={(event) => setCompanySlug(event.target.value)}
              placeholder="aerticket"
            />
          </label>

          <label>
            <span>Email or user ID</span>
            <input
              required
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              placeholder={defaultUserId || "support@company.com"}
            />
          </label>

          <label>
            <span>Password</span>
            <input
              required
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
            />
          </label>

          <button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="agent-login-hint">
          <span>Default admin pattern</span>
          <strong>{defaultUserId || "company-slug_test"}</strong>
          <p>
            During company signup, the default admin uses this value as user ID
            and password unless changed later.
          </p>
        </div>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}
