"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import "../adminmaster.css";

export default function AdminMasterLoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/adminmaster/login", {
        body: JSON.stringify({
          identifier,
          password,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to log in");
      }

      router.push(data.redirectUrl || "/adminmaster/subscriptions");
      router.refresh();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Unable to log in");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="adminmaster-page adminmaster-login-page">
      <section className="adminmaster-login-card">
        <div>
          <p className="adminmaster-kicker">CruiseStack Master Admin</p>
          <h1>Sign in</h1>
          <p>Use a global admin account from the agents table.</p>
        </div>

        {error ? <div className="adminmaster-login-error">{error}</div> : null}

        <form className="adminmaster-login-form" onSubmit={handleSubmit}>
          <label>
            <span>Email or user ID</span>
            <input
              onChange={(event) => setIdentifier(event.target.value)}
              placeholder="admin@cruisestack.ai"
              required
              value={identifier}
            />
          </label>

          <label>
            <span>Password</span>
            <input
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              required
              type="password"
              value={password}
            />
          </label>

          <button className="adminmaster-login-button" disabled={loading} type="submit">
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </section>
    </main>
  );
}
