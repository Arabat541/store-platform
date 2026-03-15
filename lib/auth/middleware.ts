import { NextRequest, NextResponse } from "next/server";
import { verifyToken, getTokenFromHeader } from "@/lib/auth";

export function withAuth(
  handler: (req: NextRequest, context: { params: Record<string, string>; user: { userId: number; email: string; role: string } }) => Promise<NextResponse>,
  allowedRoles?: string[]
) {
  return async (req: NextRequest, context: { params: Record<string, string> }) => {
    try {
      const token = getTokenFromHeader(req.headers.get("authorization"));

      if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const decoded = verifyToken(token);

      if (allowedRoles && !allowedRoles.includes(decoded.role)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      return handler(req, { ...context, user: decoded });
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
  };
}
