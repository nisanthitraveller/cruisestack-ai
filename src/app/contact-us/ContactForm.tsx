"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import styles from "./ContactUs.module.css";

// Keep in sync with CATEGORIES in src/pages/api/contact-email.js
const categories = [
  "General Enquiry",
  "Sales & Pricing",
  "Product Demo",
  "Partnerships",
  "Technical Support",
  "Other",
];

const emptyForm = { name: "", email: "", phone: "", category: "", message: "" };

export default function ContactForm() {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function handleChange(
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSending(true);

    try {
      const response = await fetch("/api/contact-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();

      if (!response.ok || data.status !== "success") {
        throw new Error(data.message || "Unable to send your message");
      }

      setSubmitted(true);
      setForm(emptyForm);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to send your message",
      );
    } finally {
      setSending(false);
    }
  }

  if (submitted) {
    return (
      <div className={styles.success} role="status">
        <span className={styles.successIcon}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
            <path d="m5 12.5 4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <h3>Thanks, your message is on its way!</h3>
        <p>Our team will get back to you within 1 business day.</p>
        <button type="button" className={styles.linkBtn} onClick={() => setSubmitted(false)}>
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.field}>
        <label htmlFor="name">Full Name *</label>
        <input id="name" name="name" type="text" placeholder="John Doe" autoComplete="name" required value={form.name} onChange={handleChange} />
      </div>
      <div className={styles.field}>
        <label htmlFor="email">Business Email *</label>
        <input id="email" name="email" type="email" placeholder="you@company.com" autoComplete="email" required value={form.email} onChange={handleChange} />
      </div>
      <div className={styles.field}>
        <label htmlFor="phone">Mobile Number (Optional)</label>
        <input id="phone" name="phone" type="tel" placeholder="+91 98765 43210" autoComplete="tel" value={form.phone} onChange={handleChange} />
      </div>
      <div className={styles.field}>
        <label htmlFor="category">Message Category *</label>
        <select id="category" name="category" required value={form.category} onChange={handleChange} className={form.category ? "" : styles.placeholder}>
          <option value="" disabled>Select a category</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      <div className={`${styles.field} ${styles.full}`}>
        <label htmlFor="message">Message *</label>
        <textarea id="message" name="message" rows={5} placeholder="Tell us how we can help..." required maxLength={5000} value={form.message} onChange={handleChange} />
      </div>

      {error && (
        <p className={`${styles.full} ${styles.error}`} role="alert">
          {error}
        </p>
      )}

      <div className={styles.full}>
        <button type="submit" className={styles.btnPrimary} disabled={sending}>
          {sending ? "Sending..." : "Send Message"}
          {!sending && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
      </div>
    </form>
  );
}
