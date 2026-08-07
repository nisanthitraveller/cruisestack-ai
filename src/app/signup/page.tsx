"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import '../style.css'; 
import signImg from "../../assets/Company.webp";
import Image from 'next/image';
import Header from "@/components/Header/header";
import Footer from "@/components/Footer/footer";

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

export default function CompanySignupPage() {
  const router = useRouter();

  const [form, setForm] = useState<FormState>(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
     <Header />
      <div className="login-page">
      <section className="login-intro">
        <p className="eyebrow">Company Signup</p>
        <h1>Get started with cruisestack</h1>
        <p style={{marginBottom:'28px'}}>
         Register your company and start managing your cruise business with a secure, centralized system.
        </p>
        <Image src={signImg} alt="cruisestack" width={340}/>
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
              placeholder="Your company name"
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

          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? "Signing up..." : "Signup"}
          </button>
        </form>
      </section>
      </div>

       {/* ───── FOOTER ───── */}
    <Footer/>
    </main>
  );
}
