import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, newPassword, token, uid } = body;

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

      // In production, send email with the reset link
      // For now, token is stored server-side only
      return NextResponse.json({
        message: "Si cet email existe, un lien de réinitialisation a été envoyé.",
      });
    }

    // Step 2: Reset password with token
    if (token && newPassword) {
      if (newPassword.length < 8) {
        return NextResponse.json(
          { error: "Le mot de passe doit contenir au moins 8 caractères" },
          { status: 400 }
        );
      }

      const userId = uid;

      if (!userId) {
        return NextResponse.json({ error: "Lien invalide" }, { status: 400 });
      }

      const stored = await prisma.setting.findUnique({ where: { key: `reset_${userId}` } });
      if (!stored) {
        return NextResponse.json({ error: "Lien expiré ou invalide" }, { status: 400 });
      }

      const data = JSON.parse(stored.value);
      const tokenMatch = crypto.timingSafeEqual(
        Buffer.from(data.token, "utf8"),
        Buffer.from(token, "utf8")
      );
      if (!tokenMatch || new Date(data.expiry) < new Date()) {
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
