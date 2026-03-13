/**
 * proxy.ts — Next.js 16 route protection (src/proxy.ts)
 *
 * Named export "proxy" is the Next.js 16 convention (renamed from middleware).
 *
 * Rules:
 *   /login         → public (redirect home if already logged in)
 *   /admin/*       → admin only
 *   /api/admin/*   → admin only
 *   everything else → must be authenticated
 */
import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secretKey = new TextEncoder().encode(
  process.env.JWT_SECRET || "default-dev-secret-key-change-in-prod"
);

async function verifySession(token: string) {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload as { id: string; username: string; role: string };
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get session from cookie
  const sessionCookie = request.cookies.get("session");
  let session: { id: string; username: string; role: string } | null = null;
  if (sessionCookie?.value) {
    session = await verifySession(sessionCookie.value);
  }

  const isLoggedIn = !!session;

  // /login: redirect away if already logged in
  if (pathname === "/login") {
    if (isLoggedIn) {
      const dest = session!.role === "admin" ? "/admin" : "/";
      return NextResponse.redirect(new URL(dest, request.url));
    }
    return NextResponse.next();
  }

  // Not logged in → send to /login
  if (!isLoggedIn) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // /admin → admin role only
  if (pathname.startsWith("/admin") && session!.role !== "admin") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // /api/admin → admin role only
  if (pathname.startsWith("/api/admin") && session!.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Protect all paths except auth APIs and static files
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg|.*\\.webp|.*\\.ico).*)",
  ],
};
