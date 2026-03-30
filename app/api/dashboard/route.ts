import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser, unauthorized } from "@/lib/auth/api-guard";

export async function GET(req: NextRequest) {
  if (!getAdminUser(req)) return unauthorized();
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [
      totalProducts,
      totalOrders,
      totalCustomers,
      totalSuppliers,
      orderRevenue,
      salesRevenue,
      recentOrders,
      recentSales,
      lowStockProducts,
      monthlyOrders,
      lastMonthOrders,
      monthlySalesPos,
      lastMonthSalesPos,
      todayOrders,
      todaySales,
      pendingOrders,
      ordersByStatus,
      topOrderProducts,
      topSaleProducts,
    ] = await Promise.all([
      prisma.product.count({ where: { active: true } }),
      prisma.order.count(),
      prisma.customer.count(),
      prisma.supplier.count(),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { not: "cancelled" } },
      }),
      prisma.sale.aggregate({ _sum: { total: true } }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { customer: { select: { firstName: true, lastName: true } } },
      }),
      prisma.sale.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { seller: { select: { name: true } } },
      }),
      prisma.product.findMany({
        where: { active: true, stock: { lte: 5 } },
        take: 10,
        orderBy: { stock: "asc" },
      }),
      // Monthly orders
      prisma.order.aggregate({
        _sum: { total: true },
        _count: true,
        where: { createdAt: { gte: startOfMonth }, status: { not: "cancelled" } },
      }),
      prisma.order.aggregate({
        _sum: { total: true },
        _count: true,
        where: { createdAt: { gte: startOfLastMonth, lt: startOfMonth }, status: { not: "cancelled" } },
      }),
      // Monthly POS sales
      prisma.sale.aggregate({
        _sum: { total: true },
        _count: true,
        where: { createdAt: { gte: startOfMonth } },
      }),
      prisma.sale.aggregate({
        _sum: { total: true },
        _count: true,
        where: { createdAt: { gte: startOfLastMonth, lt: startOfMonth } },
      }),
      // Today
      prisma.order.aggregate({
        _sum: { total: true },
        _count: true,
        where: { createdAt: { gte: startOfToday }, status: { not: "cancelled" } },
      }),
      prisma.sale.aggregate({
        _sum: { total: true },
        _count: true,
        where: { createdAt: { gte: startOfToday } },
      }),
      // Pending orders
      prisma.order.count({ where: { status: "pending" } }),
      prisma.order.groupBy({ by: ["status"], _count: true }),
      // Top products from orders
      prisma.orderItem.groupBy({
        by: ["productId"],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 10,
      }),
      // Top products from POS sales
      prisma.saleItem.groupBy({
        by: ["productId"],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 10,
      }),
    ]);

    // Merge top products from orders + POS
    const productSalesMap = new Map<number, number>();
    for (const p of topOrderProducts) {
      productSalesMap.set(p.productId, (productSalesMap.get(p.productId) || 0) + (p._sum.quantity || 0));
    }
    for (const p of topSaleProducts) {
      productSalesMap.set(p.productId, (productSalesMap.get(p.productId) || 0) + (p._sum.quantity || 0));
    }
    const sortedTopProducts = [...productSalesMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const topProductDetails = await prisma.product.findMany({
      where: { id: { in: sortedTopProducts.map(([id]) => id) } },
      select: { id: true, name: true, images: true },
    });

    // Calculate combined revenue
    const totalRevenueAll = (Number(orderRevenue._sum.total) || 0) + (Number(salesRevenue._sum.total) || 0);
    const currentMonthRevenue = (Number(monthlyOrders._sum.total) || 0) + (Number(monthlySalesPos._sum.total) || 0);
    const lastMonthRevenue = (Number(lastMonthOrders._sum.total) || 0) + (Number(lastMonthSalesPos._sum.total) || 0);
    const todayRevenue = (Number(todayOrders._sum.total) || 0) + (Number(todaySales._sum.total) || 0);

    return NextResponse.json({
      stats: {
        totalProducts,
        totalOrders,
        totalCustomers,
        totalSuppliers,
        totalRevenue: totalRevenueAll,
        pendingOrders,
      },
      today: {
        revenue: todayRevenue,
        orders: todayOrders._count,
        sales: todaySales._count,
      },
      monthly: {
        current: {
          revenue: currentMonthRevenue,
          orders: monthlyOrders._count,
          sales: monthlySalesPos._count,
        },
        previous: {
          revenue: lastMonthRevenue,
          orders: lastMonthOrders._count,
          sales: lastMonthSalesPos._count,
        },
      },
      recentOrders,
      recentSales,
      lowStockProducts,
      ordersByStatus: ordersByStatus.map((s: { status: string; _count: number }) => ({
        status: s.status,
        count: s._count,
      })),
      topProducts: sortedTopProducts.map(([id, totalSold]) => ({
        ...topProductDetails.find((d: { id: number }) => d.id === id),
        totalSold,
      })),
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
