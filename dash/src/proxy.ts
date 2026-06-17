import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = ["/connexion", "/inscription"];
const protectedRoutes = ["/dashboard"];

// Filtrage UX uniquement : présence + expiration du token (userId.expiresAt.sig),
// SANS vérifier la signature (le secret reste sur l'API, qui fait la vraie validation).
function hasValidSession(token: string | undefined): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const expiresAt = Number(parts[1]);
  return Number.isFinite(expiresAt) && Date.now() < expiresAt;
}

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  // Doit correspondre à SESSION_COOKIE côté serveur.
  const token = request.cookies.get("session")?.value;
  const authed = hasValidSession(token);

  if (protectedRoutes.some((r) => path.startsWith(r)) && !authed) {
    return NextResponse.redirect(new URL("/connexion", request.url));
  }

  if (publicRoutes.includes(path) && authed) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/connexion", "/inscription", "/dashboard/:path*"],
};
