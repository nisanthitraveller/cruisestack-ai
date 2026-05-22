"use client";
import { FormEvent, Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import '../style.css'; 
import logoMain from "../../assets/logo.png";
import logoft from "../../assets/logo-white.png";
import loginImg from "../../assets/pana.svg";
import Image from 'next/image';
import Link from "next/link";
import Header from "@/components/Header/header";
import Footer from "@/components/Footer/footer";

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

      if (data.redirectUrl) {
        router.push(data.redirectUrl);
        return;
      }

      router.push("/dashboard");
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Unable to log in");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="cruise-page-body">
       {/* ───── NAV ───── */}
   <Header />

       {/* ───── LOGIN CONTENT ───── */}
      <div className="login-page ">
      <section className="login-intro">
        <p className="eyebrow">Company Agent Sign In</p>
        <h1>Your cruise business, connected</h1>
        <p style={{ marginBottom: "24px" }}>
          Enter your credentials to access your company portal and continue managing your cruise business seamlessly.
        </p>
        <Image src={loginImg} alt="cruisestack" width={330}/>
      </section>

      <section className="signup-panel login-panel" aria-label="Agent login form">
        <div className="signup-panel-header">
          <div>
            
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
              placeholder="Company name"
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

          <button className="btn-primary" type="submit" disabled={loading}>
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
      </div>
       {/* ───── FOOTER ───── */}
     <Footer/>
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
