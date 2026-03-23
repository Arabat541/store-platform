import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateToken } from "@/lib/auth";

const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID!;
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET!;
const FACEBOOK_REDIRECT_URI = process.env.NEXT_PUBLIC_BASE_URL + "/api/auth/customer/facebook";

// GET: Handle Facebook OAuth callback
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const errorParam = searchParams.get("error");

  if (errorParam) {
    return NextResponse.redirect(
      new URL("/auth?error=facebook_denied", req.url)
    );
  }

  if (!code) {
    // Step 1: Redirect to Facebook Login dialog
    const params = new URLSearchParams({
      client_id: FACEBOOK_APP_ID,
      redirect_uri: FACEBOOK_REDIRECT_URI,
      scope: "email,public_profile",
      response_type: "code",
    });
    return NextResponse.redirect(
      `https://www.facebook.com/v19.0/dialog/oauth?${params.toString()}`
    );
  }

  try {
    // Step 2: Exchange code for access token
    const tokenParams = new URLSearchParams({
      client_id: FACEBOOK_APP_ID,
      client_secret: FACEBOOK_APP_SECRET,
      redirect_uri: FACEBOOK_REDIRECT_URI,
      code,
    });

    const tokenRes = await fetch(
      `https://graph.facebook.com/v19.0/oauth/access_token?${tokenParams.toString()}`
    );

    const tokens = await tokenRes.json();
    if (!tokens.access_token) {
      return NextResponse.redirect(new URL("/auth?error=facebook_token", req.url));
    }

    // Step 3: Get user info from Facebook
    const userRes = await fetch(
      `https://graph.facebook.com/v19.0/me?fields=id,first_name,last_name,email,picture.type(large)&access_token=${tokens.access_token}`
    );

    const fbUser = await userRes.json();
    if (!fbUser.email) {
      return NextResponse.redirect(new URL("/auth?error=facebook_email", req.url));
    }

    // Step 4: Find or create customer
    let customer = await prisma.customer.findUnique({
      where: { email: fbUser.email },
    });

    if (customer) {
      if (!customer.providerId || customer.provider !== "facebook") {
        customer = await prisma.customer.update({
          where: { id: customer.id },
          data: {
            provider: "facebook",
            providerId: fbUser.id,
            avatar: fbUser.picture?.data?.url || customer.avatar,
          },
        });
      }
    } else {
      customer = await prisma.customer.create({
        data: {
          email: fbUser.email,
          firstName: fbUser.first_name || "Client",
          lastName: fbUser.last_name || "",
          provider: "facebook",
          providerId: fbUser.id,
          avatar: fbUser.picture?.data?.url || null,
        },
      });
    }

    if (!customer.active) {
      return NextResponse.redirect(new URL("/auth?error=account_disabled", req.url));
    }

    // Step 5: Generate JWT and redirect
    const token = generateToken({
      userId: customer.id,
      email: customer.email,
      role: "customer",
    });

    const redirectUrl = new URL("/auth/callback", req.url);
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
  } catch {
    return NextResponse.redirect(new URL("/auth?error=facebook_error", req.url));
  }
}
