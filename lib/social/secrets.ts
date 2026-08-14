import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

type EncryptedSecret = {
  ciphertext: string;
  iv: string;
  tag: string;
};

function getEncryptionKey() {
  const encodedKey = process.env.SOCIAL_TOKEN_ENCRYPTION_KEY;

  if (!encodedKey) {
    throw new Error("SOCIAL_TOKEN_ENCRYPTION_KEY fehlt.");
  }

  const key = Buffer.from(encodedKey, "base64");

  if (key.length !== 32) {
    throw new Error("SOCIAL_TOKEN_ENCRYPTION_KEY muss ein Base64-kodierter 32-Byte-Schlüssel sein.");
  }

  return key;
}

export function encryptSecret(value: string): EncryptedSecret {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);

  return {
    ciphertext: ciphertext.toString("base64"),
    iv: iv.toString("base64"),
    tag: cipher.getAuthTag().toString("base64"),
  };
}

export function decryptSecret(secret: EncryptedSecret) {
  const decipher = createDecipheriv(
    "aes-256-gcm",
    getEncryptionKey(),
    Buffer.from(secret.iv, "base64")
  );

  decipher.setAuthTag(Buffer.from(secret.tag, "base64"));

  return Buffer.concat([
    decipher.update(Buffer.from(secret.ciphertext, "base64")),
    decipher.final(),
  ]).toString("utf8");
}
