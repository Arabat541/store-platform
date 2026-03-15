import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { email, newPassword, token } = await req.json();

    // Step 1: Request reset - generate token
    if (email && !newPassword) {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        // Don't reveal if email exists
        return NextResponse.json({ message: "Si cet email existe, un lien de réinitialisation a été envoyé." });
      }

      const resetToken = crypto.randomBytes(32).toString("hex");
      const expiry = new Date(Date.now() + 3600000); // 1 hour

      await prisma.setting.upsert({
        where: { key: `reset_${user.id}` },
        update: { value: JSON.stringify({ token: resetToken, expiry }) },
        create: { key: `reset_${user.id}`, value: JSON.stringify({ token: resetToken, expiry }) },
      });

      // In production, send email. For now, return the token for admin use.
      return NextResponse.json({
        message: "Si cet email existe, un lien de réinitialisation a été envoyé.",
        // In dev mode only:
        resetToken,
        resetUrl: `/login?reset=${resetToken}&uid=${user.id}`,
      });
    }

    // Step 2: Reset password with token
    if (token && newPassword) {
      const { uid } = await req.json().catch(() => ({ uid: null }));
      const searchParams = new URL(req.url).searchParams;
      const userId = uid || searchParams.get("uid");

      if (!userId) {
        return NextResponse.json({ error: "Lien invalide" }, { status: 400 });
      }

      const stored = await prisma.setting.findUnique({ where: { key: `reset_${userId}` } });
      if (!stored) {
        return NextResponse.json({ error: "Lien expiré ou invalide" }, { status: 400 });
      }

      const data = JSON.parse(stored.value);
      if (data.token !== token || new Date(data.expiry) < new Date()) {
        return NextResponse.json({ error: "Lien expiré ou invalide" }, { status: 400 });
      }

      const hashedPassword = await hashPassword(newPassword);
      await prisma.user.update({
        where: { id: parseInt(userId) },
        data: { password: hashedPassword },
      });

      await prisma.setting.delete({ where: { key: `reset_${userId}` } });

      return NextResponse.json({ message: "Mot de passe réinitialisé avec succès" });
    }

    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
