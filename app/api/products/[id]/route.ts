import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser, unauthorized } from "@/lib/auth/api-guard";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        supplier: { select: { id: true, name: true } },
        stockMovements: { orderBy: { createdAt: "desc" }, take: 10 },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
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

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        price: data.price,
        comparePrice: data.comparePrice,
        sku: data.sku,
        stock: data.stock,
        images: data.images,
        brand: data.brand,
        featured: data.featured,
        active: data.active,
        categoryId: data.categoryId,
        supplierId: data.supplierId,
      },
      include: { category: true },
    });

    return NextResponse.json(product);
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
    await prisma.product.update({
      where: { id },
      data: { active: false },
    });
    return NextResponse.json({ message: "Product deleted" });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
