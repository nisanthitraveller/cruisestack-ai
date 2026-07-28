import crypto from "crypto";

const VERSION = "v1";

function encryptionKey() {
  const secret = String(
    process.env.INTEGRATION_CREDENTIAL_ENCRYPTION_KEY || "",
  ).trim();

  if (!secret) {
    throw new Error(
      "INTEGRATION_CREDENTIAL_ENCRYPTION_KEY is not configured",
    );
  }

  return crypto.createHash("sha256").update(secret).digest();
}

export function encryptIntegrationCredential(value) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(String(value), "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return [
    VERSION,
    iv.toString("base64url"),
    tag.toString("base64url"),
    encrypted.toString("base64url"),
  ].join(":");
}

export function decryptIntegrationCredential(value) {
  const [version, encodedIv, encodedTag, encodedValue] =
    String(value || "").split(":");

  if (
    version !== VERSION ||
    !encodedIv ||
    !encodedTag ||
    !encodedValue
  ) {
    throw new Error("Unsupported integration credential format");
  }

  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    encryptionKey(),
    Buffer.from(encodedIv, "base64url"),
  );
  decipher.setAuthTag(Buffer.from(encodedTag, "base64url"));

  return Buffer.concat([
    decipher.update(Buffer.from(encodedValue, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}
