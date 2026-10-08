import crypto from "crypto";
import { NextResponse } from "next/server";
import { getAdminMasterFromSession } from "@/lib/adminMasterAuth";

const BASE_URL = "https://uat.cordeliacruises.com/api/agent";
const TIMEOUT_MS = 60000;
const PREPARATION_LIFETIME_MS = 10 * 60 * 1000;

function clean(value) {
  return String(value || "").trim();
}

function fail(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  throw error;
}

function required(value, label, maxLength = 200) {
  const result = clean(value);
  if (!result) fail(`${label} is required`);
  if (result.length > maxLength) fail(`${label} is too long`);
  return result;
}

function numberOrNull(value) {
  const result = Number(value);
  return Number.isFinite(result) ? result : null;
}

function signingKey() {
  const secret = clean(process.env.INTEGRATION_CREDENTIAL_ENCRYPTION_KEY);
  if (!secret) fail("Integration credential encryption key is not configured", 500);
  return crypto.createHash("sha256").update(secret).digest();
}

function signPreparation(payload) {
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", signingKey())
    .update(encoded)
    .digest("base64url");
  return `${encoded}.${signature}`;
}

function verifyPreparation(value) {
  const [encoded, signature] = clean(value).split(".");
  if (!encoded || !signature) fail("Invalid booking preparation", 400);

  const expected = crypto
    .createHmac("sha256", signingKey())
    .update(encoded)
    .digest("base64url");
  const suppliedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (
    suppliedBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(suppliedBuffer, expectedBuffer)
  ) {
    fail("Booking preparation signature is invalid", 400);
  }

  let payload;
  try {
    payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
  } catch {
    fail("Booking preparation could not be read", 400);
  }

  if (!payload?.expiresAt || Date.now() > Number(payload.expiresAt)) {
    fail("Booking preparation expired. Prepare the booking again.", 409);
  }

  return payload;
}

async function providerFetch(path, options) {
  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (error) {
    if (error?.name === "TimeoutError") {
      fail(`Cordelia UAT did not respond to ${path} within 60 seconds`, 504);
    }
    fail(`Unable to connect to Cordelia UAT ${path}`, 502);
  }

  const text = await response.text();
  let data = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text.slice(0, 500) };
    }
  }

  if (!response.ok) {
    fail(
      clean(data.message) ||
        clean(data.error) ||
        `Cordelia returned HTTP ${response.status}`,
      response.status === 410 ? 409 : 502,
    );
  }
  return data;
}

function requestCredentials(body) {
  return {
    X_AGENT_ID: required(body.agentId, "UAT Agent ID"),
    X_AGENT_KEY: required(body.agentKey, "UAT Agent Key", 500),
  };
}

function credentialFingerprint(credentials) {
  return crypto
    .createHash("sha256")
    .update(`${credentials.X_AGENT_ID}:${credentials.X_AGENT_KEY}`)
    .digest("hex");
}

async function authenticate(credentials) {
  const result = await providerFetch("/get_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "X-AGENT-ID": credentials.X_AGENT_ID,
      "X-AGENT-KEY": credentials.X_AGENT_KEY,
    },
  });
  const token = clean(result.token);
  if (!token) fail("Cordelia did not return an authentication token", 502);
  return token;
}

function authHeaders(credentials, token) {
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-AGENT-ID": credentials.X_AGENT_ID,
    "X-AGENT-TOKEN": token,
  };
}

async function prepareBooking(body, credentials, token) {
  const itinerary = required(body.itinerary, "Itinerary ID");
  const roomType = required(body.roomType, "Room type");
  const pricing = await providerFetch("/itineraries/pricing.json", {
    method: "POST",
    headers: authHeaders(credentials, token),
    body: JSON.stringify({
      itinerary,
      addons: [],
      rooms: [
        {
          room_type: roomType,
          adults: 1,
          children: 0,
          infants: 0,
        },
      ],
    }),
  });
  const room = Array.isArray(pricing.rooms) ? pricing.rooms[0] : null;

  if (!pricing.available || !room?.available) {
    fail("The selected UAT room is unavailable", 409);
  }

  const payload = {
    credentialFingerprint: credentialFingerprint(credentials),
    itinerary,
    roomType: clean(room.room_type) || roomType,
    priceKey: required(room.price_key, "Price key", 2000),
    sequenceNumber: Number(room.seq_no),
    totalPrice: numberOrNull(pricing.total_price),
    partialPayableAmount: numberOrNull(pricing.partial_payable_amount),
    paymentOptionId: clean(pricing.payment_option_id),
    expiresAt: Date.now() + PREPARATION_LIFETIME_MS,
    nonce: crypto.randomUUID(),
  };

  if (!Number.isInteger(payload.sequenceNumber)) {
    fail("Cordelia did not return a valid sequence number", 502);
  }
  if (payload.totalPrice == null) {
    fail("Cordelia did not return a valid total price", 502);
  }

  return {
    preparationToken: signPreparation(payload),
    expiresAt: new Date(payload.expiresAt).toISOString(),
    itinerary: payload.itinerary,
    roomType: payload.roomType,
    totalPrice: payload.totalPrice,
    partialPayableAmount: payload.partialPayableAmount,
    partialPaymentAvailable: Boolean(payload.paymentOptionId),
    paymentOptionId: payload.paymentOptionId || null,
    dueDate: pricing.due_date ?? null,
  };
}

async function runDiagnostic(action, credentials, token) {
  if (action === "connection") {
    return {
      authenticated: true,
      agentId: credentials.X_AGENT_ID,
      environment: "UAT",
      message: "Cordelia UAT authentication succeeded",
    };
  }
  if (action === "wallet") {
    const wallet = await providerFetch("/wallet/balance", {
      method: "GET",
      headers: authHeaders(credentials, token),
    });
    return {
      walletBalance: numberOrNull(wallet?.balance),
      message: "Agency wallet retrieved separately from booking balance",
    };
  }
  if (action === "rooms") {
    return null;
  }
  return null;
}

function extractRoomTypes(value, results = new Set()) {
  if (Array.isArray(value)) {
    for (const item of value) extractRoomTypes(item, results);
    return results;
  }
  if (!value || typeof value !== "object") return results;

  for (const [key, item] of Object.entries(value)) {
    if (key === "room_type" && typeof item === "string" && clean(item)) {
      results.add(clean(item));
    } else {
      extractRoomTypes(item, results);
    }
  }
  return results;
}

async function getRoomTypes(body, credentials, token) {
  const itinerary = required(body.itinerary, "Itinerary ID");
  const response = await providerFetch(
    `/itineraries/rooms?itinerary=${encodeURIComponent(itinerary)}`,
    {
      method: "GET",
      headers: authHeaders(credentials, token),
    },
  );
  const roomTypes = [...extractRoomTypes(response)].sort();
  if (!roomTypes.length) {
    fail("Cordelia did not return any room types for this itinerary", 404);
  }
  return { itinerary, roomTypes };
}

function passenger(body) {
  const gender = required(body.gender, "Gender");
  const mealType = required(body.mealType, "Meal type");
  const dob = required(body.dob, "Date of birth", 10);
  const email = required(body.email, "Email").toLowerCase();

  if (!["Male", "Female"].includes(gender)) fail("Select a valid gender");
  if (!["Vegetarian", "Non - Vegetarian", "Jain"].includes(mealType)) {
    fail("Select a valid meal type");
  }
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dob)) {
    fail("Date of birth must use DD/MM/YYYY");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fail("Enter a valid email address");
  }

  return {
    first_name: required(body.firstName, "First name"),
    last_name: required(body.lastName, "Last name"),
    gender,
    dob,
    meal_type: mealType,
    country: required(body.country, "Country"),
    state: required(body.state, "State"),
    phone_number: required(body.phoneNumber, "Phone number", 30),
    email,
  };
}

async function confirmBooking(body, credentials, token) {
  if (clean(body.confirmation) !== "CREATE UAT BOOKING") {
    fail('Type "CREATE UAT BOOKING" to confirm');
  }

  const prepared = verifyPreparation(body.preparationToken);
  if (prepared.credentialFingerprint !== credentialFingerprint(credentials)) {
    fail("Prepared booking belongs to different UAT credentials", 409);
  }

  const usePartial = body.usePartialPayment === true;
  if (usePartial && !prepared.paymentOptionId) {
    fail("Partial payment is not available for this price", 409);
  }

  const pricingPayload = {
    itinerary: prepared.itinerary,
    addons: [],
    rooms: [
      {
        room_type: prepared.roomType,
        adults: 1,
        children: 0,
        infants: 0,
        seq_no: prepared.sequenceNumber,
        price_key: prepared.priceKey,
      },
    ],
  };
  if (usePartial) pricingPayload.payment_option_id = prepared.paymentOptionId;

  const latest = await providerFetch("/itineraries/pricing.json", {
    method: "POST",
    headers: authHeaders(credentials, token),
    body: JSON.stringify(pricingPayload),
  });
  const latestRoom = Array.isArray(latest.rooms) ? latest.rooms[0] : null;

  if (!latest.available || !latestRoom?.available) {
    fail("Cabin is no longer available. No booking was created.", 409);
  }

  const expectedAmount = usePartial
    ? numberOrNull(prepared.partialPayableAmount)
    : numberOrNull(prepared.totalPrice);
  const latestAmount = usePartial
    ? numberOrNull(latest.partial_payable_amount)
    : numberOrNull(latest.total_price);

  if (
    expectedAmount == null ||
    latestAmount == null ||
    expectedAmount !== latestAmount
  ) {
    fail(
      `Price changed from ${expectedAmount ?? "unknown"} to ${
        latestAmount ?? "unknown"
      }. Prepare the booking again.`,
      409,
    );
  }

  const guest = passenger(body);
  const panNumber = clean(body.panNumber);
  const latestPriceKey = required(latestRoom.price_key, "Latest price key", 2000);
  const latestSequenceNumber = Number(latestRoom.seq_no);
  if (!Number.isInteger(latestSequenceNumber)) {
    fail("Cordelia did not return a valid latest sequence number", 502);
  }

  const bookingPayload = {
    itinerary: prepared.itinerary,
    tcs_with_pan: Boolean(panNumber),
    tds_opted: false,
    expense_above_7l: false,
    tax_regime: "new_regime",
    addons: [],
    rooms: [
      {
        seq_no: latestSequenceNumber,
        price_key: latestPriceKey,
        room_type: prepared.roomType,
        adults: [guest],
        children: [],
        infants: [],
      },
    ],
    pan_no: panNumber,
    plan_enabled: false,
    variables: {
      input: {
        contact: {
          name: `${guest.first_name} ${guest.last_name}`,
          email: guest.email,
          phoneNumber: guest.phone_number,
          gstin: clean(body.gstin),
          pan: panNumber,
        },
      },
    },
  };
  if (usePartial) bookingPayload.payment_option_id = prepared.paymentOptionId;

  const booking = await providerFetch("/bookings.json", {
    method: "POST",
    headers: authHeaders(credentials, token),
    body: JSON.stringify(bookingPayload),
  });
  if (booking.success !== true) {
    fail(clean(booking.message) || "Cordelia did not confirm the booking", 502);
  }

  return {
    bookingReference: booking.booking_reference ?? null,
    bookingVoucher: booking.booking_voucher ?? null,
    totalPrice: numberOrNull(booking.total_price),
    dueBy: booking.due_by ?? null,
    customerName: booking.customer_name ?? null,
    paymentMode: usePartial ? "PARTIAL" : "FULL",
  };
}

export async function POST(request) {
  try {
    const admin = await getAdminMasterFromSession(request);
    if (!admin) fail("Master admin login required", 401);

    const body = await request.json();
    const credentials = requestCredentials(body);
    const token = await authenticate(credentials);
    const action = clean(body.action);

    const diagnostic = await runDiagnostic(action, credentials, token);
    const result = diagnostic
      ? diagnostic
      : action === "rooms"
        ? await getRoomTypes(body, credentials, token)
      : action === "prepare"
        ? await prepareBooking(body, credentials, token)
        : action === "confirm"
          ? await confirmBooking(body, credentials, token)
          : fail("Unsupported Booking Test action");

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Admin master isolated UAT booking test error:", {
      message: error?.message,
      statusCode: error?.statusCode,
    });
    return NextResponse.json(
      { message: error?.message || "Unable to run UAT Booking Test" },
      { status: error?.statusCode || 500 },
    );
  }
}
