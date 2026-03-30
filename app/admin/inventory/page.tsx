"use client";

import { useEffect, useState } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Product {
  id: number;
  name: string;
  sku: string | null;
  price: number;
  stock: number;
  images: string[];
  category: { name: string } | null;
}

interface Movement {
  id: number;
  type: string;
  quantity: number;
  reference: string | null;
  createdAt: string;
  product: { id: number; name: string; sku: string | null };
}

type Tab = "stock" | "movements";

export default function AdminInventoryPage() {
  const [tab, setTab] = useState<Tab>("stock");
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState<"all" | "low" | "out">("all");
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({
    productId: "",
    type: "purchase",
    quantity: "",
    reference: "",
  });

  const loadProducts = () => {
    fetch("/api/products?limit=500")
      .then((r) => r.json())
      .then((d) => setProducts(d.products || []));
  };

  const loadMovements = () => {
    fetch("/api/inventory?limit=100")
      .then((r) => r.json())
      .then((d) => setMovements(d.movements || []));
  };

  useEffect(() => {
    loadProducts();
    loadMovements();
  }, []);

  const filtered = products
    .filter((p) => {
      if (stockFilter === "low") return p.stock > 0 && p.stock <= 5;
      if (stockFilter === "out") return p.stock <= 0;
      return true;
    })
    .filter(
      (p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
    );

  const totalProducts = products.length;
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
  const totalValue = products.reduce((sum, p) => sum + p.stock * Number(p.price), 0);
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const outOfStock = products.filter((p) => p.stock <= 0).length;

  const openAdjust = (product: Product) => {
    setSelectedProduct(product);
    setForm({
      productId: String(product.id),
      type: "purchase",
      quantity: "",
      reference: "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(form.quantity);
    if (!qty) return;

    await fetch("/api/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: parseInt(form.productId),
        type: form.type,
        quantity: form.type === "purchase" || form.type === "return_item" ? Math.abs(qty) : -Math.abs(qty),
        reference: form.reference || null,
      }),
    });

    setShowModal(false);
    setSelectedProduct(null);
    setForm({ productId: "", type: "purchase", quantity: "", reference: "" });
    loadProducts();
    loadMovements();
  };

  const typeLabels: Record<string, string> = {
    purchase: "Achat",
    sale: "Vente",
    adjustment: "Ajustement",
    return_item: "Retour",
  };

  const typeColors: Record<string, string> = {
    purchase: "bg-emerald-50 text-emerald-700",
    sale: "bg-blue-50 text-blue-700",
    adjustment: "bg-amber-50 text-amber-700",
    return_item: "bg-purple-50 text-purple-700",
  };

  const stockLevel = (stock: number) => {
    if (stock <= 0) return { color: "text-red-600 bg-red-50", label: "Rupture" };
    if (stock <= 5) return { color: "text-amber-600 bg-amber-50", label: "Bas" };
    return { color: "text-emerald-600 bg-emerald-50", label: "OK" };
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Inventaire</h1>
        <p className="text-sm text-slate-500 mt-1">Vue d&apos;ensemble du stock et mouvements</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-100 p-4">
          <p className="text-xs text-slate-500 font-medium">Produits</p>
          <p className="text-2xl font-bold text-slate-900">{totalProducts}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-4">
          <p className="text-xs text-slate-500 font-medium">Stock total</p>
          <p className="text-2xl font-bold text-slate-900">{totalStock}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-4">
          <p className="text-xs text-slate-500 font-medium">Valeur stock</p>
          <p className="text-2xl font-bold text-primary">{formatCurrency(totalValue)}</p>
        </div>
        <div className="bg-white rounded-xl border border-amber-200 p-4 cursor-pointer hover:bg-amber-50/50 transition-colors" onClick={() => { setTab("stock"); setStockFilter("low"); }}>
          <p className="text-xs text-amber-600 font-medium">Stock bas</p>
          <p className="text-2xl font-bold text-amber-600">{lowStock}</p>
        </div>
        <div className="bg-white rounded-xl border border-red-200 p-4 cursor-pointer hover:bg-red-50/50 transition-colors" onClick={() => { setTab("stock"); setStockFilter("out"); }}>
          <p className="text-xs text-red-600 font-medium">Rupture</p>
          <p className="text-2xl font-bold text-red-600">{outOfStock}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-lg p-1 mb-6 w-fit">
        <button
          onClick={() => setTab("stock")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === "stock" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <span className="material-symbols-outlined text-base align-middle mr-1">inventory_2</span>
          État du stock
        </button>
        <button
          onClick={() => setTab("movements")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === "movements" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <span className="material-symbols-outlined text-base align-middle mr-1">swap_vert</span>
          Mouvements de stock
        </button>
      </div>

      {/* TAB: État du stock */}
      {tab === "stock" && (
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="relative flex-1 min-w-[200px]">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher par nom ou référence..."
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>
            <div className="flex gap-1">
              {([
                { value: "all", label: "Tous" },
                { value: "low", label: "Stock bas" },
                { value: "out", label: "Rupture" },
              ] as const).map((f) => (
                <button
                  key={f.value}
                  onClick={() => setStockFilter(f.value)}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    stockFilter === f.value
                      ? "bg-primary text-white"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Products table */}
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Produit</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Réf</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Catégorie</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Stock</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Statut</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Valeur</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400">
                      <span className="material-symbols-outlined text-4xl mb-2 block">inventory_2</span>
                      Aucun produit trouvé
                    </td>
                  </tr>
                ) : (
                  filtered.map((product) => {
                    const level = stockLevel(product.stock);
                    return (
                      <tr key={product.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                              {product.images?.[0] ? (
                                <img src={product.images[0] as string} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <span className="material-symbols-outlined text-slate-300 text-lg">image</span>
                              )}
                            </div>
                            <span className="text-sm font-medium text-slate-900">{product.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-500 font-mono">{product.sku || "—"}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{product.category?.name || "—"}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-sm font-bold text-slate-900">{product.stock}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${level.color}`}>
                            {level.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-medium text-slate-900">
                          {formatCurrency(product.stock * Number(product.price))}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => openAdjust(product)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                          >
                            <span className="material-symbols-outlined text-sm">edit</span>
                            Ajuster
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* TAB: Mouvements de stock */}
      {tab === "movements" && (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Produit</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Type</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Quantité</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Référence</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody>
              {movements.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400">
                    <span className="material-symbols-outlined text-4xl mb-2 block">swap_vert</span>
                    Aucun mouvement enregistré
                  </td>
                </tr>
              ) : (
                movements.map((m) => (
                  <tr key={m.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-slate-900">{m.product.name}</span>
                      {m.product.sku && <span className="block text-xs text-slate-400 font-mono">{m.product.sku}</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${typeColors[m.type] || "bg-slate-50 text-slate-600"}`}>
                        {typeLabels[m.type] || m.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-sm font-bold ${m.quantity > 0 ? "text-emerald-600" : "text-red-600"}`}>
                        {m.quantity > 0 ? "+" : ""}{m.quantity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">{m.reference || "—"}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{formatDate(m.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal ajustement */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/30" onClick={() => { setShowModal(false); setSelectedProduct(null); }} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 m-4">
            <h2 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">edit</span>
              Ajuster le stock
            </h2>
            {selectedProduct && (
              <p className="text-sm text-slate-500 mb-4">
                {selectedProduct.name} — Stock actuel : <span className="font-bold text-slate-900">{selectedProduct.stock}</span>
              </p>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              {!selectedProduct && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">ID Produit *</label>
                  <input
                    type="number"
                    value={form.productId}
                    onChange={(e) => setForm({ ...form, productId: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type de mouvement *</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="purchase">Achat (entrée de stock)</option>
                  <option value="adjustment">Ajustement (correction)</option>
                  <option value="return_item">Retour client (entrée)</option>
                  <option value="sale">Sortie manuelle</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Quantité *</label>
                <input
                  type="number"
                  min="1"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  required
                  placeholder="Ex: 10"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <p className="text-xs text-slate-400 mt-1">
                  {form.type === "purchase" || form.type === "return_item"
                    ? "Le stock sera augmenté de cette quantité"
                    : "Le stock sera diminué de cette quantité"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Référence / Note</label>
                <input
                  value={form.reference}
                  onChange={(e) => setForm({ ...form, reference: e.target.value })}
                  placeholder="Ex: Commande fournisseur #123"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setSelectedProduct(null); }}
                  className="px-4 py-2.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 font-medium transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 shadow-lg shadow-primary/20 font-medium transition-all"
                >
                  Confirmer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
