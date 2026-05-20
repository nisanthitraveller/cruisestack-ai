"use client";
import { FormEvent, Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import '../style.css'; 
import logoMain from "../../assets/logo.png";
import logoft from "../../assets/logo-white.png";
import loginImg from "../../assets/pana.svg";
import Image from 'next/image';
import Link from "next/link";

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
        window.location.href = data.redirectUrl;
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
      <nav>
        <div className='container-nav'>
          <Link href="/" className="nav-logo">
            
              <Image src={logoMain} alt="CruiseEngine" width={190}/>
           
           
        </Link>
        <ul className="nav-links">
          <li><a href="#">Product</a></li>
          <li><a href="#">Solutions </a></li>
          <li><a href="#">Resources </a></li>
          <li><a href="#">Company </a></li>
        </ul>
        
        <div className="nav-actions">
        <Link href="/login" className="btn-ghost">
         Login
        </Link>

        <Link href="/signup" className="btn-ghost">
         Sign Up
        </Link>

        <Link href="/bookdemo" className="btn-primary">
         Book a Demo
        </Link>
        </div>
        </div>
      </nav>
      <div className="login-page ">
      <section className="login-intro">
        <p className="eyebrow">Company Agent Sign In</p>
        <h1>Your Cruise Business, Connected</h1>
        <p style={{ marginBottom: "24px" }}>
          Enter your credentials to access your company portal and continue managing your cruise business seamlessly.
        </p>
        <Image src={loginImg} alt="CruiseEngine" width={330}/>
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
      <footer>
        <div className="footer-top">
          <div className="footer-brand">
            <a href="#" className="nav-logo" style={{ textDecoration: 'none' }}>
             <Image src={logoft} alt="CruiseEngine" width={190}/>
            </a>
            <p>The most complete cruise booking engine for travel companies worldwide.</p>
            <div className="social-links">
              <a href="#" className="social-link">in</a>
              <a href="#" className="social-link">f</a>
              <a href="#" className="social-link">▶</a>
            </div>
          </div>

          <div className="footer-col">
            <h4>Product</h4>
            <ul>
              <li><a href="#">Features</a></li>
              <li><a href="#">Integrations</a></li>
              <li><a href="#">Pricing</a></li>
              <li><a href="#">API</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Solutions</h4>
            <ul>
              <li><a href="#">Travel Agencies</a></li>
              <li><a href="#">OTAs</a></li>
              <li><a href="#">Enterprises</a></li>
              <li><a href="#">Host Agencies</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Resources</h4>
            <ul>
              <li><a href="#">Documentation</a></li>
              <li><a href="#">Help Center</a></li>
              <li><a href="#">Blog</a></li>
              <li><a href="#">Case Studies</a></li>
            </ul>
          </div>

          <div className="footer-col footer-contact">
            <h4>Have Questions? Let&apos;s Talk.</h4>
            <p>Our experts are ready to help you choose the right plan and grow your cruise business.</p>
            <div className="footer-contact-btns">
              <button className="btn-primary">Book a Demo</button>
              <button className="btn-outline-white">Contact Sales</button>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 CruiseEngine. All rights reserved.</span>
          <div className="footer-bottom-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </footer>
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
