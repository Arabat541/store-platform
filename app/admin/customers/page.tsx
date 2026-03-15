"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/dashboard-widgets/Widgets";
import { formatDate } from "@/lib/utils";

interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  city: string | null;
  _count: { orders: number };
  createdAt: string;
}

const defaultForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  notes: "",
};

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(defaultForm);

  const loadCustomers = () => {
    fetch("/api/customers?limit=100")
      .then((r) => r.json())
      .then((d) => setCustomers(d.customers || []));
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editId ? `/api/customers/${editId}` : "/api/customers";
    const method = editId ? "PUT" : "POST";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setShowModal(false);
    setEditId(null);
    setForm(defaultForm);
    loadCustomers();
  };

  const handleEdit = async (id: number) => {
    const res = await fetch(`/api/customers/${id}`);
    const c = await res.json();
    setForm({
      firstName: c.firstName,
      lastName: c.lastName,
      email: c.email,
      phone: c.phone || "",
      address: c.address || "",
      city: c.city || "",
      notes: c.notes || "",
    });
    setEditId(id);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer ce client ?")) return;
    await fetch(`/api/customers/${id}`, { method: "DELETE" });
    loadCustomers();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Clients</h1>
        <button
          onClick={() => { setForm(defaultForm); setEditId(null); setShowModal(true); }}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg hover:bg-primary/90 shadow-lg shadow-primary/20 font-medium text-sm transition-all"
        >
          <span className="material-symbols-outlined text-lg">add</span> Ajouter un client
        </button>
      </div>

      <DataTable
        columns={[
          {
            key: "name",
            header: "Name",
            render: (item) => {
              const c = item as unknown as Customer;
              return `${c.firstName} ${c.lastName}`;
            },
          },
          { key: "email", header: "Email" },
          { key: "phone", header: "Phone" },
          { key: "city", header: "City" },
          {
            key: "orders",
            header: "Orders",
            render: (item) => {
              const c = item as unknown as Customer;
              return String(c._count?.orders || 0);
            },
          },
          {
            key: "createdAt",
            header: "Joined",
            render: (item) => {
              const c = item as unknown as Customer;
              return formatDate(c.createdAt);
            },
          },
          {
            key: "actions",
            header: "",
            render: (item) => {
              const c = item as unknown as Customer;
              return (
                <div className="flex gap-1">
                  <button onClick={(e) => { e.stopPropagation(); handleEdit(c.id); }} className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
                    <span className="material-symbols-outlined text-lg">edit</span>
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(c.id); }} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              );
            },
          },
        ]}
        data={customers as unknown as Record<string, unknown>[]}
      />

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/30" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl shadow-primary/10 w-full max-w-md max-h-[90vh] overflow-y-auto p-6 m-4">
            <h2 className="text-lg font-bold text-slate-900 mb-4">{editId ? "Edit" : "New"} Customer</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Prénom *</label>
                  <input name="firstName" value={form.firstName} onChange={handleChange} required className="w-full px-3 py-2 border border-slate-200 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nom *</label>
                  <input name="lastName" value={form.lastName} onChange={handleChange} required className="w-full px-3 py-2 border border-slate-200 rounded-lg" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} required className="w-full px-3 py-2 border border-slate-200 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Téléphone</label>
                <input name="phone" value={form.phone} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Adresse</label>
                <textarea name="address" value={form.address} onChange={handleChange} rows={2} className="w-full px-3 py-2 border border-slate-200 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Ville</label>
                <input name="city" value={form.city} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg" />
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 font-medium transition-colors">Annuler</button>
                <button type="submit" className="px-4 py-2.5 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 shadow-lg shadow-primary/20 font-medium transition-all">{editId ? "Modifier" : "Créer"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
