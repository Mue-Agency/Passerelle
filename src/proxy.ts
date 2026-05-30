import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = ["/front", "/"];
const protectedRoutes = ["/front/discu", "/front/sorti"];

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const userId = request.cookies.get("userId")?.value;

  if (protectedRoutes.some((r) => path.startsWith(r)) && !userId) {
    return NextResponse.redirect(new URL("/front", request.url));
  }

  if (publicRoutes.includes(path) && userId) {
    return NextResponse.redirect(new URL("/front/discu", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/front", "/front/:path*"],
};
