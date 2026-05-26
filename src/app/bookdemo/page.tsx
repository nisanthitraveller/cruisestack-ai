"use client";

import { FormEvent, useState } from "react";
import styles from "./BookDemo.module.css";
import Header from "@/components/Header/header";
import Footer from "@/components/Footer/footer";
import mission from '../../assets/book.webp';
export default function BookDemoPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.name || !form.email) return;

    setError("");
    setSending(true);

    try {
      const response = await fetch("/api/demo-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });
      const data = await response.json();

      if (!response.ok || data.status !== "success") {
        throw new Error(data.message || "Unable to schedule demo");
      }

      setSubmitted(true);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to schedule demo",
      );
    } finally {
      setSending(false);
    }
  }

 const heroImagePlaceholder = {
    backgroundImage: `url(${mission.src})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    
  };

  return (
     <section>
        <Header />
    <div className={styles.page}>
        
       
      <div className={styles.hero} style={heroImagePlaceholder}>

        {/* Left — text content */}
        <div className={styles.heroLeft}>
          <span className={styles.eyebrow}>BOOK A DEMO</span>
          <h1 className={styles.heroTitle}>See cruisestack <br/>in action</h1>
          <p className={styles.heroDesc}>
            Schedule a personalized demo and see how cruisestack can help your business grow.
          </p>
        </div>

        {/* Right — form card */}
        <div className={styles.formCard}>
          {submitted ? (
            <div className={styles.successState}>
              <div className={styles.successIcon}>
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <circle cx="24" cy="24" r="22" fill="#eff6ff" stroke="#2563eb" strokeWidth="2"/>
                  <path d="M14 24 L21 31 L34 18" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2 className={styles.successTitle}>You&apos;re all set!</h2>
              <p className={styles.successDesc}>
                Thanks {form.name.split(" ")[0]}! Our team will reach out to {form.email} shortly to confirm your demo.
              </p>
            </div>
          ) : (
            <>
              <h2 className={styles.formTitle}>Let&apos;s get started</h2>
              <p className={styles.formSubtitle}>
                Fill out the form and our team will get in touch to schedule your demo.
              </p>

              <form onSubmit={handleSubmit}>
              <div className={styles.fields}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="name">Full Name</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter your full name"
                    className={styles.input}
                    required
                    value={form.name}
                    onChange={handleChange}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="email">Work Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your work email"
                    className={styles.input}
                    required
                    value={form.email}
                    onChange={handleChange}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="phone">Phone Number</label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    className={styles.input}
                    value={form.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {error ? <p className={styles.errorText}>{error}</p> : null}

              <button className={styles.submitBtn} disabled={sending} type="submit">
                {sending ? "Scheduling..." : "Schedule Demo"}
              </button>
              </form>
            </>
          )}
        </div>

      </div>
       
      
    </div>
    <Footer/>
    </section>   
  );
}
