"use client";

import { useEffect, useState } from "react";
import { DataTable, StatusBadge } from "@/components/dashboard-widgets/Widgets";
import { formatDate } from "@/lib/utils";

interface Movement {
  id: number;
  type: string;
  quantity: number;
  reference: string | null;
  createdAt: string;
  product: { id: number; name: string; sku: string };
}

export default function AdminInventoryPage() {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    productId: "",
    type: "purchase",
    quantity: "",
    reference: "",
  });

  const loadMovements = () => {
    fetch("/api/inventory?limit=100")
      .then((r) => r.json())
      .then((d) => setMovements(d.movements || []));
  };

  useEffect(() => {
    loadMovements();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: parseInt(form.productId),
        type: form.type,
        quantity: parseInt(form.quantity),
        reference: form.reference || null,
      }),
    });
    setShowModal(false);
    setForm({ productId: "", type: "purchase", quantity: "", reference: "" });
    loadMovements();
  };

  const typeColors: Record<string, string> = {
    purchase: "bg-green-100 text-green-800",
    sale: "bg-blue-100 text-blue-800",
    adjustment: "bg-yellow-100 text-yellow-800",
    return_item: "bg-purple-100 text-purple-800",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Inventaire</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg hover:bg-primary/90 shadow-lg shadow-primary/20 font-medium text-sm transition-all"
        >
          <span className="material-symbols-outlined text-lg">add</span> Ajouter un mouvement
        </button>
      </div>

      <DataTable
        columns={[
          {
            key: "product",
            header: "Product",
            render: (item) => {
              const m = item as unknown as Movement;
              return m.product.name;
            },
          },
          {
            key: "type",
            header: "Type",
            render: (item) => {
              const m = item as unknown as Movement;
              return <StatusBadge status={m.type} colors={typeColors} />;
            },
          },
          {
            key: "quantity",
            header: "Quantity",
            render: (item) => {
              const m = item as unknown as Movement;
              return (
                <span className={m.quantity > 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                  {m.quantity > 0 ? "+" : ""}{m.quantity}
                </span>
              );
            },
          },
          { key: "reference", header: "Reference" },
          {
            key: "createdAt",
            header: "Date",
            render: (item) => {
              const m = item as unknown as Movement;
              return formatDate(m.createdAt);
            },
          },
        ]}
        data={movements as unknown as Record<string, unknown>[]}
      />

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/30" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl shadow-primary/10 w-full max-w-md p-6 m-4">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Nouveau mouvement de stock</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ID Produit *</label>
                <input
                  name="productId"
                  type="number"
                  value={form.productId}
                  onChange={(e) => setForm({ ...form, productId: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type *</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                >
                  <option value="purchase">Achat</option>
                  <option value="sale">Vente</option>
                  <option value="adjustment">Ajustement</option>
                  <option value="return_item">Retour</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Quantité *</label>
                <input
                  name="quantity"
                  type="number"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Référence</label>
                <input
                  name="reference"
                  value={form.reference}
                  onChange={(e) => setForm({ ...form, reference: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 font-medium transition-colors">Annuler</button>
                <button type="submit" className="px-4 py-2.5 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 shadow-lg shadow-primary/20 font-medium transition-all">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
