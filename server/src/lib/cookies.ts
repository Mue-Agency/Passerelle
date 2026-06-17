import type { CookieOptions } from "express";
import { TOKEN_TTL_MS } from "./auth";

export const SESSION_COOKIE = "session";

const isProd = process.env.NODE_ENV === "production";
// En prod : Domain=alouette.mue.agency (partagé api/app/admin). En dev : omis (host-only localhost).
const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || undefined;

export function sessionCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    domain: COOKIE_DOMAIN,
    path: "/",
    maxAge: TOKEN_TTL_MS,
  };
}

// Mêmes attributs (hors maxAge) pour que clearCookie matche le cookie posé.
export function clearSessionCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    domain: COOKIE_DOMAIN,
    path: "/",
  };
}
