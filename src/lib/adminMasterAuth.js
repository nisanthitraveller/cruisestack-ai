import crypto from "crypto";
import { createRequire } from "module";
import pool from "./db_mysql";

export const ADMINMASTER_SESSION_COOKIE = "cruisestack_adminmaster_session";

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 12;
const requireOptional = createRequire(import.meta.url);

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

async function getAgentsColumns(connection) {
  const [columns] = await connection.query(
    `
    SELECT COLUMN_NAME
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'agents'
    `,
  );

  return new Set(columns.map((column) => column.COLUMN_NAME));
}

function loadBcrypt() {
  try {
    return requireOptional("bcryptjs");
  } catch {
    try {
      return requireOptional("bcrypt");
    } catch {
      return null;
    }
  }
}

async function passwordMatches(inputPassword, storedPassword) {
  if (!storedPassword) return false;

  const storedValue = String(storedPassword);
  const isBcryptHash = /^\$2[aby]\$\d{2}\$/.test(storedValue);

  if (!isBcryptHash) {
    return storedValue === inputPassword;
  }

  const bcrypt = loadBcrypt();

  if (!bcrypt?.compare) {
    throw new Error(
      "bcrypt is required to verify master admin passwords. Install bcryptjs or bcrypt on the server.",
    );
  }

  return bcrypt.compare(inputPassword, storedValue);
}

export async function findAdminMasterByCredentials(connection, identifier, password) {
  const normalizedIdentifier = String(identifier || "").trim().toLowerCase();

  if (!normalizedIdentifier || !password) return null;

  const columns = await getAgentsColumns(connection);
  const selectUserId = columns.has("user_id") ? "user_id" : "NULL AS user_id";
  const selectStatus = columns.has("status") ? "status" : "1 AS status";
  const statusCondition = columns.has("status") ? "AND status = 1" : "";
  const userIdCondition = columns.has("user_id") ? "OR LOWER(user_id) = ?" : "";
  const params = columns.has("user_id")
    ? [normalizedIdentifier, normalizedIdentifier]
    : [normalizedIdentifier];

  const [agents] = await connection.query(
    `
    SELECT id, name, email, password, ${selectUserId}, type, ${selectStatus}
    FROM agents
    WHERE LOWER(type) = 'admin'
      ${statusCondition}
      AND (LOWER(email) = ? ${userIdCondition})
    LIMIT 1
    `,
    params.slice(0, columns.has("user_id") ? 2 : 1),
  );

  const agent = agents[0] || null;

  if (!agent || !(await passwordMatches(password, agent.password))) {
    return null;
  }

  delete agent.password;

  return agent;
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
    const columns = await getAgentsColumns(connection);
    const selectUserId = columns.has("user_id") ? "user_id" : "NULL AS user_id";
    const selectStatus = columns.has("status") ? "status" : "1 AS status";
    const statusCondition = columns.has("status") ? "AND status = 1" : "";

    const [agents] = await connection.query(
      `
      SELECT id, name, email, ${selectUserId}, type, ${selectStatus}
      FROM agents
      WHERE id = ?
        ${statusCondition}
        AND LOWER(type) = 'admin'
      LIMIT 1
      `,
      [session.agentId],
    );

    return agents[0] || null;
  } finally {
    connection.release();
  }
}
