import { NextRequest, NextResponse } from "next/server";
import { verifyToken, TokenPayload } from "@/lib/auth";

/**
 * Extract and verify admin user from request cookie or Authorization header.
 * Returns decoded token payload or null if invalid/missing.
 */
export function getAdminUser(req: NextRequest): TokenPayload | null {
  const token =
    req.cookies.get("auth-token")?.value ||
    req.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) return null;

  try {
    const decoded = verifyToken(token);
    if (!decoded.role || !["admin", "seller"].includes(decoded.role)) {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Standard 401 response for unauthorized access.
 */
export function unauthorized() {
  return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
}
