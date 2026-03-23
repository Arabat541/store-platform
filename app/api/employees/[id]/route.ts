import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { getAdminUser, unauthorized } from "@/lib/auth/api-guard";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!getAdminUser(req)) return unauthorized();
  try {
    const id = parseInt(params.id);
    const body = await req.json();

    const data: Record<string, unknown> = {};
    if (body.name !== undefined) data.name = body.name;
    if (body.email !== undefined) data.email = body.email;
    if (body.role !== undefined) {
      const allowedRoles = ["seller", "admin"];
      if (!allowedRoles.includes(body.role)) {
        return NextResponse.json({ error: "Rôle invalide" }, { status: 400 });
      }
      data.role = body.role;
    }
    if (body.active !== undefined) data.active = body.active;
    if (body.password) {
      if (body.password.length < 8) {
        return NextResponse.json({ error: "Le mot de passe doit contenir au moins 8 caractères" }, { status: 400 });
      }
      data.password = await hashPassword(body.password);
    }

    const user = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, email: true, name: true, role: true, active: true, createdAt: true },
    });

    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!getAdminUser(_req)) return unauthorized();
  try {
    const id = parseInt(params.id);
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
