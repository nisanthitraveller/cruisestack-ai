"use client";

import { useMemo, useState } from "react";

type Context = {
  cruiseLine: string;
  cruiseLineId: string;
  packageId: string;
  trackingToken: string;
  fareCode: string;
  categoryCode: string;
  cabinNumber: string;
  pastPaxNumber: string;
  reservationId: string;
  cruiseReservationId: string;
  confirmationNumber: string;
  supplierToken: string;
  supplierSessionId: string;
  supplierLastSyncOn: string;
  cardToken: string;
  paymentAmount: string;
};

type Step = {
  id: string;
  title: string;
  group: "Availability" | "Reservation" | "Payment";
  endpoint: string;
  description: string;
  transactional?: boolean;
  template: Record<string, unknown>;
};

type RunResult = {
  ok: boolean;
  providerStatus: number;
  durationMs: number;
  endpoint: string;
  request: unknown;
  response: unknown;
  requestId: string | null;
  completedAt: string;
};

const bookingCustomers = [
  {
    rph: 1,
    firstName: "FRIEDRICH",
    lastName: "KULHAVY",
    dateOfBirth: "18-Aug-1949",
    age: 77,
    pastPaxNumber: "{{pastPaxNumber}}",
    address: {
      country: { id: "US" },
      state: { id: "IL" },
      city: { name: "Chicago" },
    },
    contactInfo: {
      email: "john@domain.com",
      phone1: { countryCode: "1", number: "416-555-4566" },
    },
  },
  {
    rph: 2,
    firstName: "Maria",
    lastName: "Doe",
    dateOfBirth: "01-Jan-1965",
    age: 58,
    address: { country: { id: "US" } },
    contactInfo: {
      email: "maria@domain.com",
      phone1: { countryCode: "1", number: "416-555-4566" },
    },
  },
];

const availabilityCustomers = bookingCustomers.map(({ rph, age, address }) => ({
  rph,
  age,
  ...(rph === 1 ? { address: { country: address.country } } : {}),
}));

const pricingCustomers = bookingCustomers.map(
  ({ contactInfo: _contactInfo, ...customer }) => customer,
);

const cruise = { packageId: "{{packageId}}" };
const category = {
  code: "{{categoryCode}}",
  fare: { fareCode: { code: "{{fareCode}}" } },
};
const trackingInfo = { token: "{{trackingToken}}" };

const STEPS: Step[] = [
  {
    id: "fare-code-availability",
    title: "Fare Code Availability",
    group: "Availability",
    endpoint: "/v2/reservation/cruise/listfarecodes",
    description: "Returns supplier fare codes for the package and passengers.",
    template: {
      cruiseReservation: { cruise },
      customers: availabilityCustomers,
      trackingInfo,
    },
  },
  {
    id: "category-availability",
    title: "Category Availability",
    group: "Availability",
    endpoint: "/v2/reservation/cruise/ListCategories",
    description: "Returns bookable categories and fares for the sailing.",
    template: {
      cruiseReservation: { cruise },
      customers: availabilityCustomers,
      trackingInfo,
    },
  },
  {
    id: "cabin-availability",
    title: "Cabin Availability",
    group: "Availability",
    endpoint: "/v2/reservation/cruise/listcabins",
    description: "Lists available cabins for the selected category and fare.",
    template: {
      cruiseReservation: { cruise, categories: [category] },
      customers: availabilityCustomers,
      trackingInfo,
    },
  },
  {
    id: "cabin-hold",
    title: "Cabin Hold",
    group: "Reservation",
    endpoint: "/v2/reservation/cruise/holdcabin",
    description: "Places a temporary hold on the selected cabin.",
    transactional: true,
    template: {
      cruiseReservation: {
        cruise,
        categories: [{ ...category, cabins: [{ number: "{{cabinNumber}}" }] }],
      },
      customers: availabilityCustomers,
      trackingInfo,
    },
  },
  {
    id: "past-passenger-lookup",
    title: "Past Passenger Lookup",
    group: "Availability",
    endpoint: "/v2/reservation/cruise/listpastpassengers",
    description: "Looks up a Silversea past-passenger number from guest details.",
    template: {
      cruiseReservation: {
        cruise: { cruiseLine: { id: "{{cruiseLineId}}" } },
      },
      customers: [
        {
          rph: 1,
          firstName: "FRIEDRICH",
          lastName: "KULHAVY",
          dateOfBirth: "19-Aug-1949",
        },
      ],
      trackingInfo,
    },
  },
  {
    id: "list-prices",
    title: "Price Reservation",
    group: "Reservation",
    endpoint: "/v2/reservation/cruise/listprices",
    description: "Returns final pricing, rules and supplier payment schedules.",
    template: {
      cruiseReservation: { cruise, categories: [category] },
      customers: pricingCustomers,
      trackingInfo,
    },
  },
  {
    id: "create-without-payment",
    title: "Create Reservation Without Payment",
    group: "Reservation",
    endpoint: "/v2/reservation/cruise/create",
    description: "Creates the held reservation without charging a card.",
    transactional: true,
    template: {
      cruiseReservation: {
        cruise,
        categories: [{ ...category, cabins: [{ number: "{{cabinNumber}}" }] }],
      },
      customers: bookingCustomers,
      trackingInfo,
    },
  },
  {
    id: "read-supplier-pay",
    title: "Read Reservation From Supplier — Pay Mode",
    group: "Reservation",
    endpoint: "/v2/reservation/cruise/readfromsupplier",
    description: "Reads the live supplier reservation in Pay mode by confirmation number.",
    template: {
      cruiseReservation: {
        reservationReferences: {
          confirmationNumber: "{{confirmationNumber}}",
        },
        cruise: { cruiseline: { id: "{{cruiseLineId}}" } },
        ReadPreferences: { Mode: "Pay" },
      },
    },
  },
  {
    id: "tokenization",
    title: "Tokenization",
    group: "Payment",
    endpoint: "/v2/payment/TokenizeCard",
    description: "Tokenizes sandbox card data. Confirm the vendor-approved request before use.",
    transactional: true,
    template: {
      number: "",
      cvv: "",
      type: "VI",
      expiration: "12/26",
      cardHolderName: "John Doe",
      billingDetails: {
        address: {
          addressline1: "NE 4th Avenue",
          country: { id: "US" },
          state: { id: "FL" },
          city: { name: "MIAMI" },
          postalCode: "33101",
        },
      },
    },
  },
  {
    id: "pay-to-supplier",
    title: "Apply Payment — Pay To Supplier",
    group: "Payment",
    endpoint: "/v2/reservation/cruise/paytosupplier",
    description: "Pays the supplier using the tokenized sandbox card.",
    transactional: true,
    template: {
      id: "{{reservationId}}",
      cruiseReservation: {
        id: "{{cruiseReservationId}}",
        syncInfo: {
          apiSyncInfo: {
            token: "{{supplierToken}}",
            sessionId: "{{supplierSessionId}}",
            lastSyncOn: "{{supplierLastSyncOn}}",
          },
        },
      },
      paymentToProcess: {
        cardToken: "{{cardToken}}",
        amount: "{{paymentAmount}}",
        currency: "USD",
      },
    },
  },
  {
    id: "read-supplier-view",
    title: "Read Reservation From Supplier — View Mode",
    group: "Reservation",
    endpoint: "/v2/reservation/cruise/readfromsupplier",
    description: "Reads the live supplier reservation in View mode by confirmation number.",
    template: {
      cruiseReservation: {
        reservationReferences: {
          confirmationNumber: "{{confirmationNumber}}",
        },
        cruise: { cruiseline: { id: "{{cruiseLineId}}" } },
        ReadPreferences: { Mode: "View" },
      },
    },
  },
  {
    id: "cancel-reservation",
    title: "Cancel Reservation",
    group: "Reservation",
    endpoint: "/v2/reservation/cruise/cancel",
    description: "Cancels the created sandbox reservation.",
    transactional: true,
    template: {
      id: "{{reservationId}}",
      cruiseReservation: { id: "{{cruiseReservationId}}" },
      trackingInfo,
    },
  },
];

const INITIAL_CONTEXT: Context = {
  cruiseLine: "Silversea",
  cruiseLineId: "8115",
  packageId: "1477685",
  trackingToken: "GMC-1773196-a4562s6s-51k3-4594-66whl",
  fareCode: "S3_29",
  categoryCode: "SV",
  cabinNumber: "707",
  pastPaxNumber: "8528073",
  reservationId: "",
  cruiseReservationId: "",
  confirmationNumber: "",
  supplierToken: "",
  supplierSessionId: "",
  supplierLastSyncOn: "",
  cardToken: "",
  paymentAmount: "11800",
};

function resolveTemplate(template: unknown, context: Context): unknown {
  if (Array.isArray(template)) {
    return template.map((value) => resolveTemplate(value, context));
  }

  if (template && typeof template === "object") {
    return Object.fromEntries(
      Object.entries(template).map(([key, value]) => [
        key,
        resolveTemplate(value, context),
      ]),
    );
  }

  if (typeof template !== "string") return template;

  const exactMatch = template.match(/^\{\{(\w+)\}\}$/);
  if (exactMatch) {
    const key = exactMatch[1] as keyof Context;
    const value = context[key] ?? "";
    if (["packageId", "reservationId", "cruiseReservationId"].includes(key)) {
      return value && /^\d+$/.test(value) ? Number(value) : value;
    }
    return value;
  }

  return template.replace(/\{\{(\w+)\}\}/g, (_, rawKey: string) => {
    const key = rawKey as keyof Context;
    return String(context[key] ?? "");
  });
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function textValue(value: unknown): string {
  return typeof value === "string" || typeof value === "number"
    ? String(value)
    : "";
}

function updateContextFromResponse(current: Context, response: unknown): Context {
  const responseRecord = record(response);
  const data = record(responseRecord.data);
  const reservation = record(data.cruiseReservation);
  const categories = Array.isArray(reservation.categories)
    ? reservation.categories
    : [];
  const firstCategory = record(categories[0]);
  const fares = Array.isArray(firstCategory.fares) ? firstCategory.fares : [];
  const fareCode = record(record(fares[0]).fareCode);
  const cabins = Array.isArray(firstCategory.cabins) ? firstCategory.cabins : [];
  const firstCabin = record(cabins[0]);
  const syncInfo = record(record(reservation.syncInfo).apiSyncInfo);
  const reservationFareCode = record(reservation.fareCode);
  const reservationReferences = record(reservation.reservationReferences);
  const tracking = record(data.trackingInfo);

  return {
    ...current,
    trackingToken: textValue(tracking.token) || current.trackingToken,
    fareCode:
      textValue(reservationFareCode.code) ||
      textValue(fareCode.code) ||
      current.fareCode,
    categoryCode: textValue(firstCategory.code) || current.categoryCode,
    cabinNumber: textValue(firstCabin.number) || current.cabinNumber,
    reservationId: textValue(data.id) || current.reservationId,
    cruiseReservationId:
      textValue(reservation.id) || current.cruiseReservationId,
    confirmationNumber:
      textValue(reservationReferences.confirmationNumber) ||
      current.confirmationNumber,
    supplierToken: textValue(syncInfo.token) || current.supplierToken,
    supplierSessionId:
      textValue(syncInfo.sessionId) || current.supplierSessionId,
    cardToken:
      textValue(data.token) || textValue(responseRecord.token) || current.cardToken,
  };
}

function json(value: unknown) {
  return JSON.stringify(value, null, 2);
}

export default function OdysseusCertificationClient() {
  const [selectedId, setSelectedId] = useState(STEPS[0].id);
  const [context, setContext] = useState<Context>(INITIAL_CONTEXT);
  const [editors, setEditors] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      STEPS.map((step) => [step.id, json(step.template)]),
    ),
  );
  const [results, setResults] = useState<Record<string, RunResult>>({});
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [transactionConfirmed, setTransactionConfirmed] = useState(false);

  const selected = useMemo(
    () => STEPS.find((step) => step.id === selectedId) || STEPS[0],
    [selectedId],
  );

  function refreshTemplate(step: Step, nextContext = context) {
    setEditors((current) => ({
      ...current,
      [step.id]: json(resolveTemplate(step.template, nextContext)),
    }));
  }

  async function runStep(step: Step) {
    if (step.transactional && !transactionConfirmed) {
      setError("Confirm sandbox transaction actions before running this step.");
      return;
    }

    setBusyId(step.id);
    setError("");
    try {
      const requestTemplate = JSON.parse(editors[step.id]);
      const requestBody = resolveTemplate(requestTemplate, context);
      const response = await fetch("/api/adminmaster/odysseus-certification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stepId: step.id, requestBody }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.message || "Certification request failed");

      setResults((current) => ({ ...current, [step.id]: data }));
      const nextContext = updateContextFromResponse(context, data.response);
      setContext(nextContext);
    } catch (runError) {
      setError(runError instanceof Error ? runError.message : "Certification request failed");
    } finally {
      setBusyId("");
    }
  }

  function downloadEvidence() {
    const cruiseLineSlug = (context.cruiseLine || "cruise-line")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const payload = {
      generatedAt: new Date().toISOString(),
      environment: "Odysseus Sandbox",
      cruiseLine: context.cruiseLine,
      context: { ...context, cardToken: context.cardToken ? "[captured]" : "" },
      runs: STEPS.filter((step) => results[step.id]).map((step) => ({
        id: step.id,
        title: step.title,
        ...results[step.id],
      })),
    };
    const blob = new Blob([json(payload)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${cruiseLineSlug}-certification-${Date.now()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="ody-console">
      <section className="ody-context-panel">
        <div className="ody-section-heading">
          <div>
            <span>Shared workflow data</span>
            <h2>Certification context</h2>
          </div>
          <button onClick={downloadEvidence} type="button" disabled={!Object.keys(results).length}>
            Download evidence
          </button>
        </div>
        <div className="ody-context-grid">
          {(Object.keys(context) as Array<keyof Context>).map((key) => (
            <label key={key}>
              <span>{key.replace(/([A-Z])/g, " $1")}</span>
              <input
                type={key === "cardToken" || key === "supplierToken" ? "password" : "text"}
                value={context[key]}
                onChange={(event) =>
                  setContext((current) => ({ ...current, [key]: event.target.value }))
                }
              />
            </label>
          ))}
        </div>
        <label className="ody-confirmation">
          <input
            checked={transactionConfirmed}
            onChange={(event) => setTransactionConfirmed(event.target.checked)}
            type="checkbox"
          />
          <span>
            I confirm this is the Odysseus Sandbox and authorize hold,
            reservation and payment test actions for the selected cruise line.
          </span>
        </label>
      </section>

      <div className="ody-workbench">
        <aside className="ody-step-list" aria-label="Certification workflow">
          {STEPS.map((step, index) => {
            const result = results[step.id];
            return (
              <button
                className={selected.id === step.id ? "active" : ""}
                key={step.id}
                onClick={() => setSelectedId(step.id)}
                type="button"
              >
                <span className="ody-step-number">{index + 1}</span>
                <span>
                  <small>{step.group}</small>
                  <strong>{step.title}</strong>
                </span>
                <em className={result ? (result.ok ? "pass" : "fail") : "idle"}>
                  {result ? (result.ok ? "Pass" : "Fail") : "Not run"}
                </em>
              </button>
            );
          })}
        </aside>

        <section className="ody-run-panel">
          <header>
            <div>
              <p>{selected.group}</p>
              <h2>{selected.title}</h2>
              <span>{selected.description}</span>
            </div>
            <code>{selected.endpoint}</code>
          </header>

          {error && <div className="ody-alert">{error}</div>}

          <div className="ody-editor-actions">
            <button onClick={() => refreshTemplate(selected)} type="button">
              Rebuild from context
            </button>
            <button
              className="primary"
              disabled={Boolean(busyId)}
              onClick={() => runStep(selected)}
              type="button"
            >
              {busyId === selected.id ? "Running…" : "Run step"}
            </button>
          </div>

          <div className="ody-json-grid">
            <label>
              <span>Request JSON</span>
              <textarea
                spellCheck={false}
                value={editors[selected.id]}
                onChange={(event) =>
                  setEditors((current) => ({
                    ...current,
                    [selected.id]: event.target.value,
                  }))
                }
              />
            </label>
            <div className="ody-response-block">
              <div>
                <span>Response JSON</span>
                {results[selected.id] && (
                  <small>
                    HTTP {results[selected.id].providerStatus} · {results[selected.id].durationMs} ms
                  </small>
                )}
              </div>
              <pre>{results[selected.id] ? json(results[selected.id].response) : "Run this step to collect its response."}</pre>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
