import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";

function getKey(): Buffer {
  const hex = process.env.SOCIAL_TOKEN_ENCRYPTION_KEY;
  if (!hex) throw new Error("SOCIAL_TOKEN_ENCRYPTION_KEY env var is not set");
  const key = Buffer.from(hex, "hex");
  if (key.length !== 32) throw new Error("SOCIAL_TOKEN_ENCRYPTION_KEY must be 32 bytes (64 hex chars)");
  return key;
}

/**
 * Encrypts a plaintext string using AES-256-GCM.
 * Returns a single string: iv:authTag:ciphertext (all hex-encoded).
 */
export function encryptToken(plaintext: string): string {
  const key    = getKey();
  const iv     = randomBytes(12); // 96-bit IV recommended for GCM
  const cipher = createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag   = cipher.getAuthTag();

  return [iv.toString("hex"), authTag.toString("hex"), encrypted.toString("hex")].join(":");
}

/**
 * Decrypts a token encrypted with encryptToken().
 */
export function decryptToken(ciphertext: string): string {
  const key    = getKey();
  const parts  = ciphertext.split(":");
  if (parts.length !== 3) throw new Error("Invalid encrypted token format");

  const [ivHex, authTagHex, dataHex] = parts;
  const iv       = Buffer.from(ivHex,      "hex");
  const authTag  = Buffer.from(authTagHex, "hex");
  const data     = Buffer.from(dataHex,    "hex");

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
}
