import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateSaleNumber } from "@/lib/utils";
import { getAdminUser, unauthorized } from "@/lib/auth/api-guard";

export async function GET(req: NextRequest) {
  if (!getAdminUser(req)) return unauthorized();
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { saleNumber: { contains: search } },
        { customerName: { contains: search } },
        { customerPhone: { contains: search } },
      ];
    }
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) (where.createdAt as Record<string, unknown>).gte = new Date(dateFrom);
      if (dateTo) (where.createdAt as Record<string, unknown>).lte = new Date(dateTo + "T23:59:59");
    }

    const [sales, total] = await Promise.all([
      prisma.sale.findMany({
        where,
        include: {
          items: { include: { product: { select: { id: true, name: true, images: true } } } },
          seller: { select: { id: true, name: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.sale.count({ where }),
    ]);

    return NextResponse.json({
      sales,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const admin = getAdminUser(req);
  if (!admin) return unauthorized();
  try {
    const data = await req.json();

    const itemsData = data.items as Array<{ productId: number; quantity: number }>;

    for (const item of itemsData) {
      if (!item.productId || !item.quantity || item.quantity <= 0 || !Number.isInteger(item.quantity)) {
        return NextResponse.json({ error: "Quantité invalide" }, { status: 400 });
      }
    }

    const products = await prisma.product.findMany({
      where: { id: { in: itemsData.map((i) => i.productId) } },
    });

    const saleItems = itemsData.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) throw new Error(`Product ${item.productId} not found`);
      const price = Number(product.price);
      return {
        productId: item.productId,
        quantity: item.quantity,
        price,
        total: price * item.quantity,
      };
    });

    const subtotal = saleItems.reduce((sum, item) => sum + item.total, 0);
    const total = subtotal;

    const sale = await prisma.sale.create({
      data: {
        saleNumber: generateSaleNumber(),
        customerName: data.customerName || null,
        customerPhone: data.customerPhone || null,
        subtotal,
        total,
        paymentMethod: data.paymentMethod || "cash",
        sellerId: admin.id,
        notes: data.notes || null,
        items: { create: saleItems },
      },
      include: {
        items: { include: { product: true } },
        seller: { select: { id: true, name: true } },
      },
    });

    // Decrease stock and create stock movements
    for (const item of saleItems) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
      await prisma.stockMovement.create({
        data: {
          productId: item.productId,
          type: "sale",
          quantity: -item.quantity,
          reference: sale.saleNumber,
        },
      });
    }

    return NextResponse.json(sale, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
