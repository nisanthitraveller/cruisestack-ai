import crypto from "crypto";
import pool from "./db_mysql";

export const ADMINMASTER_SESSION_COOKIE = "cruisestack_adminmaster_session";

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 12;

function getCookieValue(source, name) {
  if (!source) return null;

  if (typeof source.get === "function") {
    const cookie = source.get(name);
    if (typeof cookie === "string") return cookie;
    return cookie?.value || null;
  }

  if (typeof source.cookies?.get === "function") {
    const cookie = source.cookies.get(name);
    if (typeof cookie === "string") return cookie;
    return cookie?.value || null;
  }

  return null;
}

function getSecret() {
  return (
    process.env.ADMINMASTER_SESSION_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    process.env.STRIPE_SECRET_KEY ||
    "cruisestack-adminmaster-dev-secret"
  );
}

function sign(value) {
  return crypto.createHmac("sha256", getSecret()).update(value).digest("hex");
}

function encodeSession(agent) {
  const payload = Buffer.from(
    JSON.stringify({
      agentId: agent.id,
      email: agent.email || "",
      exp: Date.now() + SESSION_MAX_AGE_SECONDS * 1000,
    }),
  ).toString("base64url");

  return `${payload}.${sign(payload)}`;
}

function decodeSession(value) {
  if (!value || typeof value !== "string") return null;

  const [payload, signature] = value.split(".");

  if (!payload || !signature || sign(payload) !== signature) return null;

  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));

    if (!session?.agentId || !session?.exp || Date.now() > Number(session.exp)) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

export function getAdminMasterCookieOptions() {
  return {
    httpOnly: true,
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  };
}

export async function findAdminMasterByCredentials(connection, identifier, password) {
  const normalizedIdentifier = String(identifier || "").trim().toLowerCase();

  if (!normalizedIdentifier || !password) return null;

  const [agents] = await connection.query(
    `
    SELECT id, name, email, user_id, type, status
    FROM agents
    WHERE status = 1
      AND type = 'Admin'
      AND (LOWER(email) = ? OR LOWER(user_id) = ?)
      AND password = ?
    LIMIT 1
    `,
    [normalizedIdentifier, normalizedIdentifier, password],
  );

  return agents[0] || null;
}

export function createAdminMasterSessionCookie(agent) {
  return encodeSession(agent);
}

export async function getAdminMasterFromSession(source) {
  const session = decodeSession(
    getCookieValue(source, ADMINMASTER_SESSION_COOKIE),
  );

  if (!session) return null;

  const connection = await pool.getConnection();

  try {
    const [agents] = await connection.query(
      `
      SELECT id, name, email, user_id, type, status
      FROM agents
      WHERE id = ?
        AND status = 1
        AND type = 'Admin'
      LIMIT 1
      `,
      [session.agentId],
    );

    return agents[0] || null;
  } finally {
    connection.release();
  }
}
