"use client";

import { useEffect, useState } from "react";
import { StatCard, StatusBadge } from "@/components/dashboard-widgets/Widgets";
import { formatCurrency, formatDate } from "@/lib/utils";

interface DashboardData {
  stats: {
    totalProducts: number;
    totalOrders: number;
    totalCustomers: number;
    totalSuppliers: number;
    totalRevenue: number;
    pendingOrders: number;
  };
  today: {
    revenue: number;
    orders: number;
    sales: number;
  };
  monthly: {
    current: { revenue: number; orders: number; sales: number };
    previous: { revenue: number; orders: number; sales: number };
  };
  recentOrders: Array<{
    id: number;
    orderNumber: string;
    total: number;
    status: string;
    createdAt: string;
    customer: { firstName: string; lastName: string };
  }>;
  recentSales: Array<{
    id: number;
    saleNumber: string;
    total: number;
    customerName: string | null;
    paymentMethod: string;
    createdAt: string;
    seller: { name: string } | null;
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

const statusLabels: Record<string, string> = {
  pending: "En attente",
  confirmed: "Confirmée",
  shipped: "Expédiée",
  completed: "Terminée",
  cancelled: "Annulée",
};

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
        <div className="h-8 w-64 bg-slate-100 rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-100 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-100 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const revenueChange =
    data.monthly.previous.revenue > 0
      ? Math.round(
          ((data.monthly.current.revenue - data.monthly.previous.revenue) /
            data.monthly.previous.revenue) *
            100
        )
      : 0;

  const ordersChange =
    data.monthly.previous.orders > 0
      ? Math.round(
          ((data.monthly.current.orders - data.monthly.previous.orders) /
            data.monthly.previous.orders) *
            100
        )
      : 0;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tableau de bord</h1>
          <p className="text-slate-500 mt-1">
            Vue d&apos;ensemble de votre activité
          </p>
        </div>
        <div className="text-right text-sm text-slate-500">
          {new Date().toLocaleDateString("fr-FR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      {/* Today's Activity */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl p-6 mb-8 border border-primary/10">
        <h2 className="text-sm font-semibold text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">today</span>
          Activité du jour
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-slate-600">Revenu du jour</p>
            <p className="text-2xl font-bold text-slate-900">{formatCurrency(data.today.revenue)}</p>
          </div>
          <div>
            <p className="text-sm text-slate-600">Commandes en ligne</p>
            <p className="text-2xl font-bold text-slate-900">{data.today.orders}</p>
          </div>
          <div>
            <p className="text-sm text-slate-600">Ventes en boutique</p>
            <p className="text-2xl font-bold text-slate-900">{data.today.sales}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Chiffre d'affaires total"
          value={formatCurrency(data.stats.totalRevenue)}
          change={revenueChange}
          icon={<span className="material-symbols-outlined text-2xl">payments</span>}
          color="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          title="Commandes"
          value={String(data.stats.totalOrders)}
          change={ordersChange}
          icon={<span className="material-symbols-outlined text-2xl">shopping_bag</span>}
          color="bg-primary/10 text-primary"
        />
        <StatCard
          title="Clients"
          value={String(data.stats.totalCustomers)}
          icon={<span className="material-symbols-outlined text-2xl">group</span>}
          color="bg-amber-50 text-amber-600"
        />
        <StatCard
          title="Produits actifs"
          value={String(data.stats.totalProducts)}
          icon={<span className="material-symbols-outlined text-2xl">inventory_2</span>}
          color="bg-purple-50 text-purple-600"
        />
      </div>

      {/* Pending orders alert */}
      {data.stats.pendingOrders > 0 && (
        <a
          href="/admin/orders"
          className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 hover:bg-amber-100 transition-colors"
        >
          <span className="material-symbols-outlined text-amber-600 text-2xl">notifications_active</span>
          <div>
            <p className="text-sm font-semibold text-amber-800">
              {data.stats.pendingOrders} commande{data.stats.pendingOrders > 1 ? "s" : ""} en attente
            </p>
            <p className="text-xs text-amber-600">Cliquez pour les traiter</p>
          </div>
          <span className="material-symbols-outlined text-amber-400 ml-auto">chevron_right</span>
        </a>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">shopping_bag</span>
              Dernières commandes
            </h2>
            <a href="/admin/orders" className="text-xs text-primary hover:underline">Voir tout</a>
          </div>
          <div className="divide-y divide-slate-50">
            {data.recentOrders.length === 0 ? (
              <p className="p-6 text-center text-slate-400 text-sm">Aucune commande</p>
            ) : (
              data.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center gap-4 px-6 py-3 hover:bg-slate-50 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-primary text-lg">receipt</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {order.orderNumber}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {order.customer.firstName} {order.customer.lastName}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-slate-900">{formatCurrency(Number(order.total))}</p>
                    <StatusBadge status={order.status} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent POS Sales */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-600 text-xl">point_of_sale</span>
              Dernières ventes boutique
            </h2>
            <a href="/admin/sales" className="text-xs text-primary hover:underline">Voir tout</a>
          </div>
          <div className="divide-y divide-slate-50">
            {data.recentSales.length === 0 ? (
              <p className="p-6 text-center text-slate-400 text-sm">Aucune vente</p>
            ) : (
              data.recentSales.map((sale) => (
                <div key={sale.id} className="flex items-center gap-4 px-6 py-3 hover:bg-slate-50 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-emerald-600 text-lg">receipt_long</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {sale.saleNumber}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {sale.customerName || "Client anonyme"} — {sale.seller?.name || "—"}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-slate-900">{formatCurrency(Number(sale.total))}</p>
                    <span className="text-xs text-slate-400">{formatDate(sale.createdAt)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Orders by Status */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">donut_small</span>
            Commandes par statut
          </h2>
          <div className="space-y-3">
            {data.ordersByStatus.map((s) => {
              const total = data.stats.totalOrders || 1;
              const pct = Math.round((s.count / total) * 100);
              return (
                <div key={s.status}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-700 capitalize">{statusLabels[s.status] || s.status}</span>
                    <span className="text-sm font-bold text-slate-900">{s.count}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-primary rounded-full h-2 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-500 text-xl">star</span>
            Produits les plus vendus
          </h2>
          <div className="space-y-3">
            {data.topProducts.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">Aucune vente</p>
            ) : (
              data.topProducts.map((product, idx) => (
                <div key={product.id} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                    {idx + 1}
                  </span>
                  <span className="flex-1 text-sm text-slate-900 truncate">{product.name}</span>
                  <span className="text-sm font-semibold text-primary">{product.totalSold} vendus</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-red-500 text-xl">warning</span>
              Alertes stock
            </h2>
            <a href="/admin/inventory" className="text-xs text-primary hover:underline">Inventaire</a>
          </div>
          <div className="space-y-2">
            {data.lowStockProducts.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">Stock OK pour tous les produits</p>
            ) : (
              data.lowStockProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between py-1.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-900 truncate">{product.name}</p>
                    {product.sku && <p className="text-xs text-slate-400">{product.sku}</p>}
                  </div>
                  <span
                    className={`text-sm font-bold px-2 py-0.5 rounded-full ${
                      product.stock === 0
                        ? "bg-red-50 text-red-600"
                        : "bg-amber-50 text-amber-600"
                    }`}
                  >
                    {product.stock === 0 ? "Rupture" : product.stock}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats Footer */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-8 border-t border-slate-200">
        <div className="text-center">
          <p className="text-2xl font-bold text-slate-900">{data.stats.totalSuppliers}</p>
          <p className="text-xs text-slate-500">Fournisseurs</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-slate-900">{data.monthly.current.orders}</p>
          <p className="text-xs text-slate-500">Commandes ce mois</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-slate-900">{data.monthly.current.sales}</p>
          <p className="text-xs text-slate-500">Ventes boutique ce mois</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-slate-900">{formatCurrency(data.monthly.current.revenue)}</p>
          <p className="text-xs text-slate-500">Revenu ce mois</p>
        </div>
      </div>
    </div>
  );
}
