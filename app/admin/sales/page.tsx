"use client";

import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/utils";

interface SaleItem {
  id: number;
  quantity: number;
  price: number;
  total: number;
  product: { id: number; name: string; images: string[] };
}

interface Sale {
  id: number;
  saleNumber: string;
  customerName: string | null;
  customerPhone: string | null;
  subtotal: number;
  total: number;
  paymentMethod: string;
  seller: { id: number; name: string } | null;
  items: SaleItem[];
  createdAt: string;
}

const paymentLabels: Record<string, string> = {
  cash: "Espèces",
  mobile_money: "Mobile Money",
  card: "Carte bancaire",
};

export default function AdminSalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  const loadSales = (page = 1) => {
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (search) params.set("search", search);
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);

    fetch(`/api/sales?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setSales(d.sales || []);
        setPagination(d.pagination || { page: 1, pages: 1, total: 0 });
      });
  };

  useEffect(() => {
    loadSales();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadSales(1);
  };

  const formatDate = (d: string) => {
    const date = new Date(d);
    return `${date.toLocaleDateString("fr-FR")} à ${date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`;
  };

  const todayTotal = sales
    .filter((s) => new Date(s.createdAt).toDateString() === new Date().toDateString())
    .reduce((sum, s) => sum + Number(s.total), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Historique des ventes</h1>
          <p className="text-sm text-slate-500 mt-1">
            {pagination.total} vente{pagination.total > 1 ? "s" : ""} au total
          </p>
        </div>
        <div className="bg-primary/10 rounded-xl px-5 py-3 text-center">
          <p className="text-xs text-primary font-medium">Ventes du jour</p>
          <p className="text-xl font-black text-primary">{formatCurrency(todayTotal)}</p>
        </div>
      </div>

      {/* Filters */}
      <form onSubmit={handleSearch} className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par n° de vente, nom, téléphone..."
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
          />
        </div>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="px-3 py-2.5 border border-slate-200 rounded-lg text-sm"
        />
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="px-3 py-2.5 border border-slate-200 rounded-lg text-sm"
        />
        <button
          type="submit"
          className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Filtrer
        </button>
      </form>

      {/* Sales table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">N° Vente</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Date</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Client</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Paiement</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Vendeur</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Articles</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Total</th>
            </tr>
          </thead>
          <tbody>
            {sales.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-slate-400">
                  <span className="material-symbols-outlined text-4xl mb-2 block">receipt_long</span>
                  Aucune vente trouvée
                </td>
              </tr>
            ) : (
              sales.map((sale) => (
                <tr
                  key={sale.id}
                  onClick={() => setSelectedSale(sale)}
                  className="border-b border-slate-50 hover:bg-slate-50/50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3">
                    <span className="text-sm font-mono font-medium text-primary">{sale.saleNumber}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{formatDate(sale.createdAt)}</td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-slate-900">{sale.customerName || "—"}</span>
                    {sale.customerPhone && (
                      <span className="block text-xs text-slate-400">{sale.customerPhone}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 text-xs font-medium text-slate-600">
                      {paymentLabels[sale.paymentMethod] || sale.paymentMethod}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{sale.seller?.name || "—"}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{sale.items.length}</td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm font-bold text-slate-900">{formatCurrency(Number(sale.total))}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => loadSales(p)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                p === pagination.page
                  ? "bg-primary text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Sale detail panel */}
      {selectedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/30" onClick={() => setSelectedSale(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto p-6 m-4">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Détail de la vente</h2>
                <p className="text-sm font-mono text-primary">{selectedSale.saleNumber}</p>
              </div>
              <button
                onClick={() => setSelectedSale(null)}
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 mb-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Date</span>
                <span className="text-slate-900">{formatDate(selectedSale.createdAt)}</span>
              </div>
              {selectedSale.customerName && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Client</span>
                  <span className="text-slate-900">{selectedSale.customerName}</span>
                </div>
              )}
              {selectedSale.customerPhone && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Téléphone</span>
                  <span className="text-slate-900">{selectedSale.customerPhone}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">Paiement</span>
                <span className="text-slate-900">{paymentLabels[selectedSale.paymentMethod] || selectedSale.paymentMethod}</span>
              </div>
              {selectedSale.seller && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Vendeur</span>
                  <span className="text-slate-900">{selectedSale.seller.name}</span>
                </div>
              )}
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden mb-4">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left px-3 py-2 text-slate-500 font-medium">Article</th>
                    <th className="text-center px-3 py-2 text-slate-500 font-medium">Qté</th>
                    <th className="text-right px-3 py-2 text-slate-500 font-medium">Prix</th>
                    <th className="text-right px-3 py-2 text-slate-500 font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedSale.items.map((item) => (
                    <tr key={item.id} className="border-t border-slate-100">
                      <td className="px-3 py-2 text-slate-900">{item.product.name}</td>
                      <td className="px-3 py-2 text-center text-slate-600">{item.quantity}</td>
                      <td className="px-3 py-2 text-right text-slate-600">{formatCurrency(Number(item.price))}</td>
                      <td className="px-3 py-2 text-right font-medium text-slate-900">{formatCurrency(Number(item.total))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-primary/5 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-slate-900">Total</span>
                <span className="text-2xl font-black text-primary">{formatCurrency(Number(selectedSale.total))}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
