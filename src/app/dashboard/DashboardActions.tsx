"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import agentImg from "../../assets/pana.svg";

type DashboardActionsProps = {
  b2bUrl: string;
  b2cUrl: string;
};

export default function DashboardActions({ b2bUrl, b2cUrl }: DashboardActionsProps) {
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
  const [isIntegrationModalOpen, setIsIntegrationModalOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function openAgentModal() {
    setSubmitted(false);
    setIsAgentModalOpen(true);
  }

  function closeAgentModal() {
    setIsAgentModalOpen(false);
  }

  function openIntegrationModal() {
    setIsIntegrationModalOpen(true);
  }

  function closeIntegrationModal() {
    setIsIntegrationModalOpen(false);
  }

  function handleAgentSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <>
      <nav className="dashboard-nav" aria-label="Dashboard sections">
        <span className="active">Dashboard</span>
        <button type="button" onClick={openAgentModal}>
          Add agent
        </button>
        <a href={b2bUrl}>Create trip summary</a>
        <button type="button" onClick={openIntegrationModal}>
          Integrate cruisestack.ai
        </button>
        <a href="#subscription">Subscription</a>
        <a href="#commissions">Commissions</a>
        <a href="#billing">Billing</a>
      </nav>

      {isAgentModalOpen ? (
        <div className="dashboard-modal-backdrop">
          <section
            aria-labelledby="add-agent-title"
            aria-modal="true"
            className="dashboard-modal"
            role="dialog"
          >
            <div className="dashboard-modal-header">
              <div>
                <p className="panel-kicker">Agent</p>
                <h2 id="add-agent-title">Add agent</h2>
                <small>Add agent details to invite them into your workspace.</small>
              </div>
              <button
                aria-label="Close add agent popup"
                className="dashboard-modal-close"
                onClick={closeAgentModal}
                type="button"
              >
                Close
              </button>
            </div>

            {submitted ? (
              <div className="form-alert success">
                Agent details captured.
              </div>
            ) : null}

            <form autoComplete="off" className="dashboard-agent-form" onSubmit={handleAgentSubmit}>
              <div className="dashboard-agent-modal-grid">
                <div className="dashboard-agent-illustration">
                  <Image src={agentImg} alt="" width={230} />
                </div>

                <div className="dashboard-agent-fields">
                  <label>
                    <span>Agent name</span>
                    <input name="agentName" placeholder="Eg: John Doe" required />
                  </label>

                  <label>
                    <span>Email ID</span>
                    <input name="email" placeholder="yourname@example.com" required type="email" />
                  </label>

                  <label>
                    <span>Phone number</span>
                    <input
                      inputMode="numeric"
                      maxLength={15}
                      minLength={10}
                      name="phone"
                      onChange={(event) => {
                        event.currentTarget.value = event.currentTarget.value.replace(/\D/g, "");
                      }}
                      placeholder="Enter mobile number"
                      required
                      type="tel"
                    />
                  </label>

                  <div className="dashboard-modal-actions">
                    <button className="btn-primary" type="submit">
                      Submit
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </section>
        </div>
      ) : null}

      {isIntegrationModalOpen ? (
        <div className="dashboard-modal-backdrop">
          <section
            aria-labelledby="integration-title"
            aria-modal="true"
            className="dashboard-modal integration-modal"
            role="dialog"
          >
            <div className="dashboard-modal-header">
              <div>
                <p className="panel-kicker">Integration</p>
                <h2 id="integration-title">Integrate cruisestack.ai</h2>
                <small>Use these URLs to connect your cruisestack workspace.</small>
              </div>
              <button
                aria-label="Close integration popup"
                className="dashboard-modal-close"
                onClick={closeIntegrationModal}
                type="button"
              >
                Close
              </button>
            </div>

            <div className="integration-info-grid">
              <article className="integration-info-card">
                <span>B2B</span>
                <h3>This is your B2B URL</h3>
                <code>{b2bUrl}</code>
                <p>If you want to login contact abc@gmail.com.</p>
                <p>If you want to integrate payment gateway contact abc@gmail.com.</p>
              </article>

              <article className="integration-info-card">
                <span>B2C</span>
                <h3>This is your B2C URL</h3>
                <code>{b2cUrl}</code>
                <p>Integrate this URL in an iframe on your website.</p>
                <pre>{`<iframe src="${b2cUrl}" width="100%" height="800"></iframe>`}</pre>
              </article>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
