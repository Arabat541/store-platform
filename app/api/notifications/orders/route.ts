import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser, unauthorized } from "@/lib/auth/api-guard";

export async function GET(req: NextRequest) {
  if (!getAdminUser(req)) return unauthorized();

  try {
    const { searchParams } = new URL(req.url);
    const since = searchParams.get("since");

    const where: Record<string, unknown> = {};
    if (since) {
      where.createdAt = { gt: new Date(since) };
    }

    const [count, orders] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        include: {
          customer: { select: { firstName: true, lastName: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

    return NextResponse.json({ count, orders });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
