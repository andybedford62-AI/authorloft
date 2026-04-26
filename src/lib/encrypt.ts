import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";

function getKey(): Buffer {
  const hex = process.env.ENCRYPTION_KEY;
  if (!hex || hex.length !== 64) throw new Error("ENCRYPTION_KEY env var is missing or invalid");
  return Buffer.from(hex, "hex");
}

/** Returns `iv:authTag:ciphertext` (all hex). */
export function encrypt(plaintext: string): string {
  const iv         = randomBytes(12);
  const cipher     = createCipheriv(ALGORITHM, getKey(), iv);
  const encrypted  = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag    = cipher.getAuthTag();
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
}

/**
 * Decrypts a value produced by `encrypt()`.
 * If the value doesn't match the expected format (legacy plaintext), returns it as-is
 * so existing stored keys keep working until the author re-saves.
 */
export function decrypt(stored: string): string {
  const parts = stored.split(":");
  if (parts.length !== 3) return stored; // legacy plaintext — pass through

  try {
    const [ivHex, authTagHex, ciphertextHex] = parts;
    const iv         = Buffer.from(ivHex, "hex");
    const authTag    = Buffer.from(authTagHex, "hex");
    const ciphertext = Buffer.from(ciphertextHex, "hex");
    const decipher   = createDecipheriv(ALGORITHM, getKey(), iv);
    decipher.setAuthTag(authTag);
    return decipher.update(ciphertext).toString("utf8") + decipher.final("utf8");
  } catch {
    return stored; // decryption failed — return as-is rather than crashing
  }
}
