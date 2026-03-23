import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser, unauthorized } from "@/lib/auth/api-guard";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!getAdminUser(_req)) return unauthorized();
  try {
    const id = parseInt(params.id);
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        orders: {
          include: { items: { include: { product: { select: { id: true, name: true } } } } },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    return NextResponse.json(customer);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!getAdminUser(req)) return unauthorized();
  try {
    const id = parseInt(params.id);
    const data = await req.json();
    const customer = await prisma.customer.update({ where: { id }, data });
    return NextResponse.json(customer);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!getAdminUser(_req)) return unauthorized();
  try {
    const id = parseInt(params.id);
    await prisma.customer.delete({ where: { id } });
    return NextResponse.json({ message: "Customer deleted" });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
