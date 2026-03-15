"use client";

import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/utils";

interface ReportData {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  commandesByStatus: Array<{ status: string; count: number; revenue: number }>;
}

export default function AdminReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d) => {
        setData({
          totalRevenue: d.stats.totalRevenue,
          totalOrders: d.stats.totalOrders,
          avgOrderValue: d.stats.totalOrders > 0 ? d.stats.totalRevenue / d.stats.totalOrders : 0,
          commandesByStatus: d.ordersByStatus,
        });
      });
  }, []);

  if (!data) {
    return <div className="animate-pulse"><div className="h-64 bg-slate-100 rounded-xl" /></div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Rapports de ventes</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <p className="text-sm text-slate-500">Chiffre d'affaires</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{formatCurrency(data.totalRevenue)}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <p className="text-sm text-slate-500">Total commandes</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{data.totalOrders}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <p className="text-sm text-slate-500">Valeur moyenne par commande</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{formatCurrency(data.avgOrderValue)}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Commandes par statut</h2>
        <div className="space-y-3">
          {data.commandesByStatus.map((s: { status: string; count: number; revenue: number }) => (
            <div key={s.status} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
              <span className="capitalize font-medium text-slate-700">{s.status}</span>
              <span className="text-sm font-bold text-slate-900">{s.count} commandes</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
