"use client";

import { useEffect, useState } from "react";
import { StatCard, DataTable, StatusBadge } from "@/components/dashboard-widgets/Widgets";
import { formatCurrency, formatDate } from "@/lib/utils";

interface DashboardData {
  stats: {
    totalProducts: number;
    totalOrders: number;
    totalCustomers: number;
    totalRevenue: number;
  };
  monthlySales: {
    current: { revenue: number; orders: number };
    previous: { revenue: number; orders: number };
  };
  recentOrders: Array<{
    id: number;
    orderNumber: string;
    total: number;
    status: string;
    createdAt: string;
    customer: { firstName: string; lastName: string };
  }>;
  lowStockProducts: Array<{
    id: number;
    name: string;
    stock: number;
    sku: string;
  }>;
  ordersByStatus: Array<{ status: string; count: number }>;
  topProducts: Array<{ id: number; name: string; totalSold: number }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setData);
  }, []);

  if (!data) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-100 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const revenueChange =
    data.monthlySales.previous.revenue > 0
      ? Math.round(
          ((data.monthlySales.current.revenue - data.monthlySales.previous.revenue) /
            data.monthlySales.previous.revenue) *
            100
        )
      : 0;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tableau de bord CRM</h1>
          <p className="text-slate-500 mt-1">Welcome back, Admin. Here&apos;s what&apos;s happening today.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Chiffre d'affaires"
          value={formatCurrency(data.stats.totalRevenue)}
          change={revenueChange}
          icon={<span className="material-symbols-outlined text-2xl">payments</span>}
          color="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          title="Total commandes"
          value={String(data.stats.totalOrders)}
          icon={<span className="material-symbols-outlined text-2xl">shopping_bag</span>}
          color="bg-primary/10 text-primary"
        />
        <StatCard
          title="Products"
          value={String(data.stats.totalProducts)}
          icon={<span className="material-symbols-outlined text-2xl">inventory_2</span>}
          color="bg-purple-50 text-purple-600"
        />
        <StatCard
          title="Customers"
          value={String(data.stats.totalCustomers)}
          icon={<span className="material-symbols-outlined text-2xl">group</span>}
          color="bg-amber-50 text-amber-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Commandes récentes */}
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">receipt_long</span>
            Commandes récentes
          </h2>
          <DataTable
            columns={[
              { key: "orderNumber", header: "Order" },
              {
                key: "customer",
                header: "Customer",
                render: (item) => {
                  const row = item as unknown as DashboardData["recentOrders"][0];
                  return `${row.customer.firstName} ${row.customer.lastName}`;
                },
              },
              {
                key: "total",
                header: "Total",
                render: (item) => {
                  const row = item as unknown as DashboardData["recentOrders"][0];
                  return formatCurrency(Number(row.total));
                },
              },
              {
                key: "status",
                header: "Status",
                render: (item) => {
                  const row = item as unknown as DashboardData["recentOrders"][0];
                  return <StatusBadge status={row.status} />;
                },
              },
              {
                key: "createdAt",
                header: "Date",
                render: (item) => {
                  const row = item as unknown as DashboardData["recentOrders"][0];
                  return formatDate(row.createdAt);
                },
              },
            ]}
            data={data.recentOrders as unknown as Record<string, unknown>[]}
          />
        </div>

        {/* Alerte stock faible */}
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-500">warning</span>
            Alerte stock faible
          </h2>
          <DataTable
            columns={[
              { key: "name", header: "Product" },
              { key: "sku", header: "SKU" },
              {
                key: "stock",
                header: "Stock",
                render: (item) => {
                  const row = item as unknown as DashboardData["lowStockProducts"][0];
                  return (
                    <span className={row.stock === 0 ? "text-red-600 font-semibold" : "text-yellow-600 font-medium"}>
                      {row.stock}
                    </span>
                  );
                },
              },
            ]}
            data={data.lowStockProducts as unknown as Record<string, unknown>[]}
          />
        </div>

        {/* Commandes par statut */}
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">donut_small</span>
            Commandes par statut
          </h2>
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="space-y-4">
              {data.ordersByStatus.map((s) => (
                <div key={s.status} className="flex items-center justify-between">
                  <StatusBadge status={s.status} />
                  <span className="text-sm font-bold text-slate-900">{s.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">star</span>
            Produits les plus vendus
          </h2>
          <DataTable
            columns={[
              { key: "name", header: "Product" },
              { key: "totalSold", header: "Unités vendues" },
            ]}
            data={data.topProducts as unknown as Record<string, unknown>[]}
          />
        </div>
      </div>
    </div>
  );
}
