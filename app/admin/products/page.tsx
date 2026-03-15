"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/dashboard-widgets/Widgets";
import { formatCurrency } from "@/lib/utils";

interface Product {
  id: number;
  name: string;
  sku: string;
  price: number;
  stock: number;
  active: boolean;
  featured: boolean;
  brand: string | null;
  category: { id: number; name: string } | null;
}

interface FormData {
  name: string;
  slug: string;
  description: string;
  price: string;
  comparePrice: string;
  sku: string;
  stock: string;
  brand: string;
  featured: boolean;
  active: boolean;
  categoryId: string;
  supplierId: string;
  images: string;
}

const defaultForm: FormData = {
  name: "",
  slug: "",
  description: "",
  price: "",
  comparePrice: "",
  sku: "",
  stock: "0",
  brand: "",
  featured: false,
  active: true,
  categoryId: "",
  supplierId: "",
  images: "",
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<FormData>(defaultForm);

  const loadProducts = () => {
    fetch("/api/products?limit=100")
      .then((r) => r.json())
      .then((d) => setProducts(d.products || []));
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const target = e.target;
    const value =
      target instanceof HTMLInputElement && target.type === "checkbox"
        ? target.checked
        : target.value;
    setForm({ ...form, [target.name]: value });
  };

  const slugify = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      slug: form.slug || slugify(form.name),
      description: form.description,
      price: parseFloat(form.price),
      comparePrice: form.comparePrice ? parseFloat(form.comparePrice) : null,
      sku: form.sku || null,
      stock: parseInt(form.stock),
      brand: form.brand || null,
      featured: form.featured,
      active: form.active,
      categoryId: form.categoryId ? parseInt(form.categoryId) : null,
      supplierId: form.supplierId ? parseInt(form.supplierId) : null,
      images: form.images
        ? form.images.split(",").map((s) => s.trim())
        : [],
    };

    const url = editId ? `/api/products/${editId}` : "/api/products";
    const method = editId ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setShowModal(false);
    setEditId(null);
    setForm(defaultForm);
    loadProducts();
  };

  const handleEdit = async (id: number) => {
    const res = await fetch(`/api/products/${id}`);
    const product = await res.json();
    setForm({
      name: product.name,
      slug: product.slug,
      description: product.description || "",
      price: String(product.price),
      comparePrice: product.comparePrice ? String(product.comparePrice) : "",
      sku: product.sku || "",
      stock: String(product.stock),
      brand: product.brand || "",
      featured: product.featured,
      active: product.active,
      categoryId: product.categoryId ? String(product.categoryId) : "",
      supplierId: product.supplierId ? String(product.supplierId) : "",
      images: Array.isArray(product.images) ? product.images.join(", ") : "",
    });
    setEditId(id);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    loadProducts();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Produits</h1>
        <button
          onClick={() => {
            setForm(defaultForm);
            setEditId(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg hover:bg-primary/90 shadow-lg shadow-primary/20 font-medium text-sm transition-all"
        >
          <span className="material-symbols-outlined text-lg">add</span> Ajouter un produit
        </button>
      </div>

      <DataTable
        columns={[
          { key: "name", header: "Name" },
          { key: "sku", header: "SKU" },
          {
            key: "category",
            header: "Category",
            render: (item) => {
              const p = item as unknown as Product;
              return p.category?.name || "—";
            },
          },
          {
            key: "price",
            header: "Price",
            render: (item) => {
              const p = item as unknown as Product;
              return formatCurrency(Number(p.price));
            },
          },
          {
            key: "stock",
            header: "Stock",
            render: (item) => {
              const p = item as unknown as Product;
              return (
                <span className={p.stock <= 5 ? "text-red-600 font-bold" : ""}>
                  {p.stock}
                </span>
              );
            },
          },
          {
            key: "actions",
            header: "Actions",
            render: (item) => {
              const p = item as unknown as Product;
              return (
                <div className="flex gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleEdit(p.id); }}
                    className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">edit</span>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              );
            },
          },
        ]}
        data={products as unknown as Record<string, unknown>[]}
      />

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/30" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl shadow-primary/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 m-4">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">{editId ? "edit" : "add_circle"}</span>
              {editId ? "Modifier le produit" : "Nouveau produit"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nom *</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Slug</label>
                  <input
                    name="slug"
                    value={form.slug}
                    onChange={handleChange}
                    placeholder="Auto-généré"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Prix *</label>
                  <input
                    name="price"
                    type="number"
                    step="0.01"
                    value={form.price}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Prix comparé</label>
                  <input
                    name="comparePrice"
                    type="number"
                    step="0.01"
                    value={form.comparePrice}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Stock</label>
                  <input
                    name="stock"
                    type="number"
                    value={form.stock}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Réf</label>
                  <input name="sku" value={form.sku} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Marque</label>
                  <input name="brand" value={form.brand} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">ID Catégorie</label>
                  <input name="categoryId" value={form.categoryId} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">ID Fournisseur</label>
                  <input name="supplierId" value={form.supplierId} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">URLs images (séparées par des virgules)</label>
                <input name="images" value={form.images} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" />
              </div>

              <div className="flex gap-6">
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} className="rounded" />
                  <span className="text-sm text-slate-700">En vedette</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="active" checked={form.active} onChange={handleChange} className="rounded" />
                  <span className="text-sm text-slate-700">Actif</span>
                </label>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 font-medium transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2.5 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 shadow-lg shadow-primary/20 font-medium transition-all">
                  {editId ? "Modifier" : "Créer"} Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
