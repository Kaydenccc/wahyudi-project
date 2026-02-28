import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "bclub-dev-secret-key"
);

const COOKIE_NAME = "bclub-session";

type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

/**
 * Get authenticated user from request cookie.
 * Returns null if no valid session.
 */
export async function getAuthUser(
  req: NextRequest
): Promise<SessionUser | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionUser;
  } catch {
    return null;
  }
}

/**
 * Require authentication. Returns 401 if not authenticated.
 */
export async function requireAuth(
  req: NextRequest
): Promise<{ user: SessionUser } | NextResponse> {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return { user };
}

/**
 * Require specific roles. Returns 403 if role not allowed.
 */
export async function requireRole(
  req: NextRequest,
  allowedRoles: string[]
): Promise<{ user: SessionUser } | NextResponse> {
  const result = await requireAuth(req);
  if (result instanceof NextResponse) return result;

  if (!allowedRoles.includes(result.user.role)) {
    return NextResponse.json(
      { error: "Forbidden: insufficient permissions" },
      { status: 403 }
    );
  }
  return result;
}
