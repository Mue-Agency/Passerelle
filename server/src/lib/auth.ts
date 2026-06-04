import { createHmac } from "crypto";

const SECRET = process.env.SESSION_SECRET || "dev-secret-change-in-prod";

export function createToken(userId: string): string {
  const sig = createHmac("sha256", SECRET).update(userId).digest("hex");
  return `${userId}.${sig}`;
}

export function verifyToken(token: string): string | null {
  const dotIndex = token.lastIndexOf(".");
  if (dotIndex === -1) return null;

  const userId = token.slice(0, dotIndex);
  const sig = token.slice(dotIndex + 1);

  const expected = createHmac("sha256", SECRET).update(userId).digest("hex");
  if (sig !== expected) return null;

  return userId;
}
