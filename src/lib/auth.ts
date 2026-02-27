import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "bclub-secret-key-change-in-production"
);

const COOKIE_NAME = "bclub-session";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function createToken(user: SessionUser): Promise<string> {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .setIssuedAt()
    .sign(JWT_SECRET);
}

export async function verifyToken(
  token: string
): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionUser;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

// Role hierarchy for access control
export const ROLE_ACCESS: Record<string, string[]> = {
  Admin: [
    "/dashboard",
    "/data-atlet",
    "/program-latihan",
    "/absensi",
    "/monitoring-performa",
    "/prestasi",
    "/laporan",
    "/pengaturan",
  ],
  Pelatih: [
    "/dashboard",
    "/data-atlet",
    "/program-latihan",
    "/absensi",
    "/monitoring-performa",
    "/prestasi",
    "/laporan",
  ],
  "Ketua Klub": [
    "/dashboard",
    "/data-atlet",
    "/monitoring-performa",
    "/prestasi",
    "/laporan",
    "/pengaturan",
  ],
  Atlet: ["/dashboard", "/monitoring-performa", "/prestasi"],
};

export function canAccessRoute(role: string, pathname: string): boolean {
  const allowedRoutes = ROLE_ACCESS[role];
  if (!allowedRoutes) return false;
  return allowedRoutes.some((route) => pathname.startsWith(route));
}
