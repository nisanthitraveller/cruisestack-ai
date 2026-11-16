"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../../academy.module.css";
import { ArrowRight } from "../../icons";

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

// Static for now: the enrolment and payment step will be added by the development team.
export default function EnrolForm({ moduleSlug }: { moduleSlug: string }) {
  const router = useRouter();
  const [sending, setSending] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);
    // TODO: save the enrolment and take payment here, then redirect on success.
    router.push(`/academy/${moduleSlug}?certification=success#certification`);
  }

  return (
    <form className={styles.enrolForm} onSubmit={handleSubmit}>
      <h2>Your details</h2>

      <div className={styles.enrolField}>
        <label htmlFor="firstName">
          First name <span aria-hidden="true">*</span>
        </label>
        <input id="firstName" name="firstName" type="text" placeholder="Enter your first name" autoComplete="given-name" required />
      </div>
      <div className={styles.enrolField}>
        <label htmlFor="lastName">
          Last name <span aria-hidden="true">*</span>
        </label>
        <input id="lastName" name="lastName" type="text" placeholder="Enter your last name" autoComplete="family-name" required />
      </div>

      <div className={`${styles.enrolField} ${styles.enrolFull}`}>
        <label htmlFor="email">
          Email address <span aria-hidden="true">*</span>
        </label>
        <input id="email" name="email" type="email" placeholder="Enter your email address" autoComplete="email" required />
      </div>

      <div className={`${styles.enrolField} ${styles.enrolFull}`}>
        <label htmlFor="phone">
          Phone number <span aria-hidden="true">*</span>
        </label>
        <div className={styles.enrolPhone}>
          <select name="phoneCode" aria-label="Country code" defaultValue="+91">
            {phoneCodes.map((p) => (
              <option key={p.code} value={p.code}>
                {p.label}
              </option>
            ))}
          </select>
          <input id="phone" name="phone" type="tel" placeholder="Enter your phone number" autoComplete="tel-national" required />
        </div>
      </div>

      <div className={`${styles.enrolField} ${styles.enrolFull}`}>
        <label htmlFor="company">
          Company / Agency name <span aria-hidden="true">*</span>
        </label>
        <input id="company" name="company" type="text" placeholder="Enter your company or agency name" autoComplete="organization" required />
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
          I agree to the <a href="#">Terms and Conditions</a> and <a href="#">Privacy Policy</a>.
        </span>
      </label>

      <button type="submit" className={`${styles.btnPrimary} ${styles.enrolSubmit}`} disabled={sending}>
        {sending ? "Please wait..." : "Continue to payment"}
        {!sending && <ArrowRight size={18} />}
      </button>
    </form>
  );
}
