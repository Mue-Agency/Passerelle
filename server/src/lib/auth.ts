import { createHmac } from "crypto";

const SECRET = process.env.SESSION_SECRET || "dev-secret-change-in-prod";

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

export function createToken(userId: string): string {
  const expiresAt = Date.now() + TOKEN_TTL_MS;
  const payload = `${userId}.${expiresAt}`;
  const sig = createHmac("sha256", SECRET).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export function verifyToken(token: string): string | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [userId, expiresAtStr, sig] = parts;

  const expiresAt = Number(expiresAtStr);
  if (!Number.isFinite(expiresAt)) return null;

  const payload = `${userId}.${expiresAtStr}`;
  const expected = createHmac("sha256", SECRET).update(payload).digest("hex");
  if (sig !== expected) return null;

  if (Date.now() >= expiresAt) return null;

  return userId;
}