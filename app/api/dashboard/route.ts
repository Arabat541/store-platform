import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [
      totalProducts,
      totalOrders,
      totalCustomers,
      totalRevenue,
      recentOrders,
      lowStockProducts,
      monthlySales,
      lastMonthSales,
      ordersByStatus,
      topProducts,
    ] = await Promise.all([
      prisma.product.count({ where: { active: true } }),
      prisma.order.count(),
      prisma.customer.count(),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { not: "cancelled" } },
      }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { customer: true },
      }),
      prisma.product.findMany({
        where: { active: true, stock: { lte: 5 } },
        take: 10,
        orderBy: { stock: "asc" },
      }),
      prisma.order.aggregate({
        _sum: { total: true },
        _count: true,
        where: {
          createdAt: { gte: startOfMonth },
          status: { not: "cancelled" },
        },
      }),
      prisma.order.aggregate({
        _sum: { total: true },
        _count: true,
        where: {
          createdAt: { gte: startOfLastMonth, lt: startOfMonth },
          status: { not: "cancelled" },
        },
      }),
      prisma.order.groupBy({
        by: ["status"],
        _count: true,
      }),
      prisma.orderItem.groupBy({
        by: ["productId"],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 5,
      }),
    ]);

    const topProductIds = topProducts.map((p: { productId: number }) => p.productId);
    const topProductDetails = await prisma.product.findMany({
      where: { id: { in: topProductIds } },
      select: { id: true, name: true, images: true },
    });

    return NextResponse.json({
      stats: {
        totalProducts,
        totalOrders,
        totalCustomers,
        totalRevenue: Number(totalRevenue._sum.total) || 0,
      },
      monthlySales: {
        current: {
          revenue: Number(monthlySales._sum.total) || 0,
          orders: monthlySales._count,
        },
        previous: {
          revenue: Number(lastMonthSales._sum.total) || 0,
          orders: lastMonthSales._count,
        },
      },
      recentOrders,
      lowStockProducts,
      ordersByStatus: ordersByStatus.map((s: { status: string; _count: number }) => ({
        status: s.status,
        count: s._count,
      })),
      topProducts: topProducts.map((p: { productId: number; _sum: { quantity: number | null } }) => ({
        ...topProductDetails.find((d: { id: number }) => d.id === p.productId),
        totalSold: p._sum.quantity,
      })),
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
