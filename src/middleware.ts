import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "bclub-secret-key-change-in-production"
);

const COOKIE_NAME = "bclub-session";

const PUBLIC_PATHS = ["/login", "/register", "/api/auth/login", "/api/auth/register"];

const ROLE_ACCESS: Record<string, string[]> = {
  Admin: [
    "/dashboard",
    "/data-atlet",
    "/program-latihan",
    "/absensi",
    "/monitoring-performa",
    "/laporan",
    "/pengaturan",
  ],
  Pelatih: [
    "/dashboard",
    "/data-atlet",
    "/program-latihan",
    "/absensi",
    "/monitoring-performa",
    "/laporan",
  ],
  "Ketua Klub": [
    "/dashboard",
    "/data-atlet",
    "/monitoring-performa",
    "/laporan",
    "/pengaturan",
  ],
  Atlet: ["/dashboard", "/monitoring-performa"],
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Allow API routes (they handle their own auth)
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Allow static files and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const role = payload.role as string;

    // Check role-based access for dashboard routes
    const allowedRoutes = ROLE_ACCESS[role];
    if (allowedRoutes) {
      const hasAccess = allowedRoutes.some((route) =>
        pathname.startsWith(route)
      );
      if (!hasAccess && pathname !== "/") {
        // Redirect to dashboard if not allowed
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    return NextResponse.next();
  } catch {
    // Invalid token, redirect to login
    const response = NextResponse.redirect(new URL("/login", req.url));
    response.cookies.delete(COOKIE_NAME);
    return response;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
