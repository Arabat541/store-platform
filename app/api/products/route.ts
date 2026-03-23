import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser, unauthorized } from "@/lib/auth/api-guard";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const featured = searchParams.get("featured");
    const sort = searchParams.get("sort") || "createdAt";
    const order = searchParams.get("order") || "desc";

    const where: Record<string, unknown> = { active: true };

    if (category) {
      where.category = { slug: category };
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { brand: { contains: search } },
      ];
    }
    if (featured === "true") {
      where.featured = true;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: { select: { id: true, name: true, slug: true } } },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sort]: order },
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  if (!getAdminUser(req)) return unauthorized();
  try {
    const data = await req.json();

    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        price: data.price,
        comparePrice: data.comparePrice,
        sku: data.sku,
        stock: data.stock || 0,
        images: data.images || [],
        brand: data.brand,
        featured: data.featured || false,
        active: data.active !== false,
        categoryId: data.categoryId,
        supplierId: data.supplierId,
      },
      include: { category: true },
    });

    if (data.stock && data.stock > 0) {
      await prisma.stockMovement.create({
        data: {
          productId: product.id,
          type: "purchase",
          quantity: data.stock,
          reference: "Initial stock",
        },
      });
    }

    return NextResponse.json(product, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
