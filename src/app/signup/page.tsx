"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import '../style.css'; 
import logoMain from "../../assets/logo.png";
import logoft from "../../assets/logo-white.png";
import signImg from "../../assets/pana-l.svg";
import Image from 'next/image';
import Link from "next/link";

type FormState = {
  companyName: string;
  domain: string;
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  supportEmail: string;
  adminPassword: string;
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
  adminPassword: "",
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
    <main className="cruise-page-body">
       {/* ───── NAV ───── */}
      <nav>
        <div className='container-nav'>
          <a href="/" className="nav-logo">
            
              <Image src={logoMain} alt="CruiseEngine" width={190}/>
           
           
        </a>
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
      <div className="login-page">
      <section className="login-intro">
        <p className="eyebrow">Company Signup</p>
        <h1>Get Started with CruiseStack</h1>
        <p style={{marginBottom:'28px'}}>
         Register your workspace and start managing your cruise business with a secure, centralized system.
        </p>
        <Image src={signImg} alt="CruiseEngine" width={340}/>
      </section>

      <section className="signup-panel" aria-label="Company signup form">
        <div className="signup-panel-header">
          <div>
           
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
            <span>Admin password</span>
            <input
              required
              minLength={8}
              type="password"
              value={form.adminPassword}
              onChange={(event) => updateField("adminPassword", event.target.value)}
              placeholder="Minimum 8 characters"
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

          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? "Creating company..." : "Create company"}
          </button>
        </form>
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
