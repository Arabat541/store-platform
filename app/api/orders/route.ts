import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/utils";
import { getAdminUser, unauthorized } from "@/lib/auth/api-guard";

export async function GET(req: NextRequest) {
  if (!getAdminUser(req)) return unauthorized();
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { orderNumber: { contains: search } },
        { customer: { firstName: { contains: search } } },
        { customer: { lastName: { contains: search } } },
        { customer: { email: { contains: search } } },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          customer: true,
          items: { include: { product: { select: { id: true, name: true, images: true } } } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      orders,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    let customer = await prisma.customer.findUnique({
      where: { email: data.customer.email },
    });

    if (!customer) {
      customer = await prisma.customer.create({ data: data.customer });
    }

    const itemsData = data.items as Array<{
      productId: number;
      quantity: number;
    }>;

    // Validate quantities
    for (const item of itemsData) {
      if (!item.productId || !item.quantity || item.quantity <= 0 || !Number.isInteger(item.quantity)) {
        return NextResponse.json(
          { error: "Quantité invalide" },
          { status: 400 }
        );
      }
    }

    const products = await prisma.product.findMany({
      where: { id: { in: itemsData.map((i) => i.productId) } },
    });

    const orderItems = itemsData.map((item) => {
      const product = products.find((p: { id: number }) => p.id === item.productId);
      if (!product) throw new Error(`Product ${item.productId} not found`);
      const price = Number(product.price);
      return {
        productId: item.productId,
        quantity: item.quantity,
        price,
        total: price * item.quantity,
      };
    });

    const subtotal = orderItems.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0;
    const shipping = data.shipping || 0;
    const total = subtotal + tax + shipping;

    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        customerId: customer.id,
        subtotal,
        tax,
        shipping,
        total,
        paymentMethod: data.paymentMethod,
        notes: data.notes,
        items: { create: orderItems },
      },
      include: {
        customer: true,
        items: { include: { product: true } },
      },
    });

    // Decrease stock and create stock movements
    for (const item of orderItems) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
      await prisma.stockMovement.create({
        data: {
          productId: item.productId,
          type: "sale",
          quantity: -item.quantity,
          reference: order.orderNumber,
        },
      });
    }

    return NextResponse.json(order, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
