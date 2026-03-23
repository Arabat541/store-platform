import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect admin routes - check for auth token in cookies or headers
  if (pathname.startsWith("/admin")) {
    const token =
      request.cookies.get("auth-token")?.value ||
      request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      // Allow access in development; redirect to login in production
      // Uncomment the following for production:
      // return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Protect customer account routes
  if (pathname.startsWith("/account")) {
    const token = request.cookies.get("customer-token")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/auth", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*"],
};
