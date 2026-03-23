import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
const GOOGLE_REDIRECT_URI = BASE_URL + "/api/auth/customer/google";

function redirectToAuth(error: string) {
  return NextResponse.redirect(new URL(`/auth?error=${error}`, BASE_URL));
}

// GET: Handle Google OAuth callback
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const errorParam = searchParams.get("error");

  if (errorParam) {
    return redirectToAuth("google_denied");
  }

  if (!code) {
    // Step 1: Redirect to Google OAuth consent screen
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: GOOGLE_REDIRECT_URI,
      response_type: "code",
      scope: "openid email profile",
      access_type: "offline",
      prompt: "select_account",
    });
    return NextResponse.redirect(
      `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
    );
  }

  try {
    // Step 2: Exchange code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      cache: "no-store",
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });

    const tokens = await tokenRes.json();
    if (!tokens.access_token) {
      console.error("[Google OAuth] Token exchange failed:", tokens);
      return redirectToAuth("google_token");
    }

    // Step 3: Get user info from Google
    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
      cache: "no-store",
    });

    const googleUser = await userRes.json();
    if (!googleUser.email) {
      console.error("[Google OAuth] No email in user info:", googleUser);
      return redirectToAuth("google_email");
    }

    // Step 4: Find or create customer
    let customer = await prisma.customer.findUnique({
      where: { email: googleUser.email },
    });

    if (customer) {
      // Update provider info if not already set
      if (!customer.providerId || customer.provider !== "google") {
        customer = await prisma.customer.update({
          where: { id: customer.id },
          data: {
            provider: "google",
            providerId: googleUser.id,
            avatar: googleUser.picture || customer.avatar,
          },
        });
      }
    } else {
      // Create new customer from Google profile
      customer = await prisma.customer.create({
        data: {
          email: googleUser.email,
          firstName: googleUser.given_name || googleUser.name?.split(" ")[0] || "Client",
          lastName: googleUser.family_name || googleUser.name?.split(" ").slice(1).join(" ") || "",
          provider: "google",
          providerId: googleUser.id,
          avatar: googleUser.picture || null,
        },
      });
    }

    if (!customer.active) {
      return redirectToAuth("account_disabled");
    }

    // Step 5: Generate JWT and redirect
    const token = generateToken({
      userId: customer.id,
      email: customer.email,
      role: "customer",
    });

    // Redirect to auth callback page that will store the token client-side
    const redirectUrl = new URL("/auth/callback", BASE_URL);
    redirectUrl.searchParams.set("token", token);
    redirectUrl.searchParams.set("customer", JSON.stringify({
      id: customer.id,
      email: customer.email,
      firstName: customer.firstName,
      lastName: customer.lastName,
      phone: customer.phone,
      avatar: customer.avatar,
    }));

    const response = NextResponse.redirect(redirectUrl);
    // Set cookie server-side so middleware sees it immediately
    response.cookies.set("customer-token", token, {
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
      sameSite: "lax",
      httpOnly: false,
    });
    return response;
  } catch (error) {
    console.error("[Google OAuth] Unexpected error:", error);
    return redirectToAuth("google_error");
  }
}
