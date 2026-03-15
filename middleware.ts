import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect admin routes - check for auth token in cookies or headers
  if (pathname.startsWith("/admin")) {
    const token =
      request.cookies.get("auth-token")?.value ||
      request.headers.get("authorization")?.replace("Bearer ", "");

    // For now, allow access (implement full auth check via API in production)
    // In production, verify the JWT token here
    if (!token) {
      // Allow access in development; redirect to login in production
      // Uncomment the following for production:
      // return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
