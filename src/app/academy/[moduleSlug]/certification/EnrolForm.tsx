"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../../academy.module.css";
import { ArrowRight } from "../../icons";
import {
  getAcademyViewerProfile,
  saveAcademyViewerProfile,
  splitAcademyViewerPhone,
} from "../../viewerProfile";

const phoneCodes = [
  { code: "+91", label: "🇮🇳 +91" },
  { code: "+1", label: "🇺🇸 +1" },
  { code: "+44", label: "🇬🇧 +44" },
  { code: "+971", label: "🇦🇪 +971" },
  { code: "+65", label: "🇸🇬 +65" },
  { code: "+61", label: "🇦🇺 +61" },
  { code: "+49", label: "🇩🇪 +49" },
];

const countries = [
  "India",
  "United States",
  "United Kingdom",
  "United Arab Emirates",
  "Singapore",
  "Australia",
  "Canada",
  "Germany",
  "Other",
];

const roles = [
  "Travel agent",
  "Agency owner / manager",
  "Tour operator",
  "OTA / online travel company",
  "Corporate travel",
  "Other",
];

export default function EnrolForm({ moduleSlug }: { moduleSlug: string }) {
  const router = useRouter();
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const firstNameField = useRef<HTMLInputElement>(null);
  const lastNameField = useRef<HTMLInputElement>(null);
  const emailField = useRef<HTMLInputElement>(null);
  const phoneCodeField = useRef<HTMLSelectElement>(null);
  const phoneField = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const viewer = getAcademyViewerProfile();
    if (!viewer) return;

    const [firstName = "", ...lastNameParts] = viewer.name.trim().split(/\s+/);
    const phone = splitAcademyViewerPhone(viewer.mobile);
    if (firstNameField.current) firstNameField.current.value = firstName;
    if (lastNameField.current) {
      lastNameField.current.value = lastNameParts.join(" ");
    }
    if (emailField.current) emailField.current.value = viewer.email;
    if (phoneCodeField.current) phoneCodeField.current.value = phone.code;
    if (phoneField.current) phoneField.current.value = phone.number;
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sending) return;

    setError("");
    setSending(true);
    const formData = new FormData(e.currentTarget);
    const name = [
      String(formData.get("firstName") || "").trim(),
      String(formData.get("lastName") || "").trim(),
    ]
      .filter(Boolean)
      .join(" ");
    const viewer = {
      name,
      email: String(formData.get("email") || "").trim().toLowerCase(),
      mobile: `${String(formData.get("phoneCode") || "").trim()} ${String(
        formData.get("phone") || "",
      ).trim()}`.trim(),
    };

    try {
      const response = await fetch("/api/academy/viewer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...viewer,
          type: "certification",
          company: formData.get("company"),
          country: formData.get("country"),
          role: formData.get("role"),
          moduleSlug,
        }),
      });
      const result = await response.json();

      if (!response.ok || result.status !== "success") {
        throw new Error(result.message || "Unable to save your enrolment");
      }

      saveAcademyViewerProfile(result.viewer);
      router.push(
        `/academy/${moduleSlug}?certification=success#certification`,
      );
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to save your enrolment. Please try again.",
      );
      setSending(false);
    }
  }

  return (
    <form className={styles.enrolForm} onSubmit={handleSubmit}>
      <h2>Your details</h2>

      <div className={styles.enrolField}>
        <label htmlFor="firstName">
          First name <span aria-hidden="true">*</span>
        </label>
        <input
          ref={firstNameField}
          id="firstName"
          name="firstName"
          type="text"
          placeholder="Enter your first name"
          autoComplete="given-name"
          required
        />
      </div>
      <div className={styles.enrolField}>
        <label htmlFor="lastName">
          Last name <span aria-hidden="true">*</span>
        </label>
        <input
          ref={lastNameField}
          id="lastName"
          name="lastName"
          type="text"
          placeholder="Enter your last name"
          autoComplete="family-name"
          required
        />
      </div>

      <div className={`${styles.enrolField} ${styles.enrolFull}`}>
        <label htmlFor="email">
          Email address <span aria-hidden="true">*</span>
        </label>
        <input
          ref={emailField}
          id="email"
          name="email"
          type="email"
          placeholder="Enter your email address"
          autoComplete="email"
          required
        />
      </div>

      <div className={`${styles.enrolField} ${styles.enrolFull}`}>
        <label htmlFor="phone">
          Phone number <span aria-hidden="true">*</span>
        </label>
        <div className={styles.enrolPhone}>
          <select
            ref={phoneCodeField}
            name="phoneCode"
            aria-label="Country code"
            defaultValue="+91"
          >
            {phoneCodes.map((p) => (
              <option key={p.code} value={p.code}>
                {p.label}
              </option>
            ))}
          </select>
          <input
            ref={phoneField}
            id="phone"
            name="phone"
            type="tel"
            placeholder="Enter your phone number"
            autoComplete="tel-national"
            required
          />
        </div>
      </div>

      <div className={`${styles.enrolField} ${styles.enrolFull}`}>
        <label htmlFor="company">
          Company / Agency name <span aria-hidden="true">*</span>
        </label>
        <input
          id="company"
          name="company"
          type="text"
          placeholder="Enter your company or agency name"
          autoComplete="organization"
          required
        />
      </div>

      <div className={styles.enrolField}>
        <label htmlFor="country">
          Country <span aria-hidden="true">*</span>
        </label>
        <select id="country" name="country" required defaultValue="">
          <option value="" disabled>
            Select country
          </option>
          {countries.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>
      <div className={styles.enrolField}>
        <label htmlFor="role">
          Your role <span aria-hidden="true">*</span>
        </label>
        <select id="role" name="role" required defaultValue="">
          <option value="" disabled>
            Select your role
          </option>
          {roles.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
      </div>

      <label className={`${styles.enrolTerms} ${styles.enrolFull}`}>
        <input type="checkbox" name="terms" required />
        <span>
          I agree to the <a href="#">Terms and Conditions</a> and{" "}
          <a href="#">Privacy Policy</a>.
        </span>
      </label>

      {error && (
        <p className={`${styles.gateError} ${styles.enrolFull}`} role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        className={`${styles.btnPrimary} ${styles.enrolSubmit}`}
        disabled={sending}
      >
        {sending ? "Please wait..." : "Continue to payment"}
        {!sending && <ArrowRight size={18} />}
      </button>
    </form>
  );
}
