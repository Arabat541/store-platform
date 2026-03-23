"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/dashboard-widgets/Widgets";
import { formatDate } from "@/lib/utils";
import Image from "next/image";

interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  password?: string | null;
  provider?: string | null;
  providerId?: string | null;
  avatar?: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  idType: string | null;
  idNumber: string | null;
  idImageFront: string | null;
  idImageBack: string | null;
  active: boolean;
  notes: string | null;
  orders: Order[];
  _count?: { orders: number };
  createdAt: string;
  updatedAt: string;
}

interface Order {
  id: number;
  orderNumber: string;
  total: number;
  status: string;
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
  const [showDetail, setShowDetail] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [imageModal, setImageModal] = useState<string | null>(null);

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

  const handleViewDetail = async (id: number) => {
    setDetailLoading(true);
    setShowDetail(true);
    try {
      const res = await fetch(`/api/customers/${id}`);
      const c = await res.json();
      setSelectedCustomer(c);
    } catch {
      setSelectedCustomer(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer ce client ?")) return;
    await fetch(`/api/customers/${id}`, { method: "DELETE" });
    loadCustomers();
  };

  const genderLabel = (g: string | null) => {
    if (g === "male") return "Homme";
    if (g === "female") return "Femme";
    if (g === "other") return "Autre";
    return g || "—";
  };

  const idTypeLabel = (t: string | null) => {
    const map: Record<string, string> = {
      national_id: "Carte d'identité nationale",
      passport: "Passeport",
      driver_license: "Permis de conduire",
      voter_card: "Carte d'électeur",
    };
    return (t && map[t]) || t || "—";
  };

  const providerLabel = (p: string | null) => {
    if (p === "google") return "Google";
    if (p === "facebook") return "Facebook";
    if (p === "email") return "Email / Mot de passe";
    return p || "Email / Mot de passe";
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
            header: "Nom",
            render: (item) => {
              const c = item as unknown as Customer;
              return (
                <div className="flex items-center gap-3">
                  {c.avatar ? (
                    <Image src={c.avatar} alt="" width={32} height={32} className="rounded-full object-cover" />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                      {c.firstName?.[0]}{c.lastName?.[0]}
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-slate-900">{c.firstName} {c.lastName}</p>
                    <p className="text-xs text-slate-400">{c.provider === "google" ? "Google" : c.provider === "facebook" ? "Facebook" : "Email"}</p>
                  </div>
                </div>
              );
            },
          },
          { key: "email", header: "Email" },
          { key: "phone", header: "Téléphone" },
          { key: "city", header: "Ville" },
          {
            key: "orders",
            header: "Commandes",
            render: (item) => {
              const c = item as unknown as Customer;
              return String(c._count?.orders || 0);
            },
          },
          {
            key: "createdAt",
            header: "Inscription",
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
                  <button onClick={(e) => { e.stopPropagation(); handleViewDetail(c.id); }} className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Voir le profil">
                    <span className="material-symbols-outlined text-lg">visibility</span>
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleEdit(c.id); }} className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Modifier">
                    <span className="material-symbols-outlined text-lg">edit</span>
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(c.id); }} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Supprimer">
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              );
            },
          },
        ]}
        data={customers as unknown as Record<string, unknown>[]}
      />

      {/* ===== Customer Detail Panel ===== */}
      {showDetail && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black/30" onClick={() => { setShowDetail(false); setSelectedCustomer(null); }} />
          <div className="relative bg-white w-full max-w-2xl h-full overflow-y-auto shadow-2xl animate-in slide-in-from-right">
            {detailLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : selectedCustomer ? (
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    {selectedCustomer.avatar ? (
                      <Image src={selectedCustomer.avatar} alt="" width={56} height={56} className="rounded-full object-cover" />
                    ) : (
                      <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
                        {selectedCustomer.firstName?.[0]}{selectedCustomer.lastName?.[0]}
                      </div>
                    )}
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">{selectedCustomer.firstName} {selectedCustomer.lastName}</h2>
                      <p className="text-sm text-slate-500">{selectedCustomer.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${selectedCustomer.active ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                          <span className="h-1.5 w-1.5 rounded-full ${selectedCustomer.active ? 'bg-green-500' : 'bg-red-500'}" />
                          {selectedCustomer.active ? "Actif" : "Inactif"}
                        </span>
                        <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                          {providerLabel(selectedCustomer.provider ?? null)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => { setShowDetail(false); setSelectedCustomer(null); }} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                {/* Info Sections */}
                <div className="space-y-6">
                  {/* Informations personnelles */}
                  <section>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg text-primary">person</span>
                      Informations personnelles
                    </h3>
                    <div className="bg-slate-50 rounded-xl p-4 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-slate-400 mb-0.5">Prénom</p>
                        <p className="text-sm font-medium text-slate-900">{selectedCustomer.firstName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 mb-0.5">Nom</p>
                        <p className="text-sm font-medium text-slate-900">{selectedCustomer.lastName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 mb-0.5">Genre</p>
                        <p className="text-sm font-medium text-slate-900">{genderLabel(selectedCustomer.gender)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 mb-0.5">Date de naissance</p>
                        <p className="text-sm font-medium text-slate-900">
                          {selectedCustomer.dateOfBirth ? new Date(selectedCustomer.dateOfBirth).toLocaleDateString("fr-FR") : "—"}
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* Contact */}
                  <section>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg text-primary">contact_phone</span>
                      Contact
                    </h3>
                    <div className="bg-slate-50 rounded-xl p-4 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-slate-400 mb-0.5">Email</p>
                        <p className="text-sm font-medium text-slate-900">{selectedCustomer.email}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 mb-0.5">Téléphone</p>
                        <p className="text-sm font-medium text-slate-900">{selectedCustomer.phone || "—"}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs text-slate-400 mb-0.5">Adresse</p>
                        <p className="text-sm font-medium text-slate-900">{selectedCustomer.address || "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 mb-0.5">Ville</p>
                        <p className="text-sm font-medium text-slate-900">{selectedCustomer.city || "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 mb-0.5">Pays</p>
                        <p className="text-sm font-medium text-slate-900">{selectedCustomer.country || "—"}</p>
                      </div>
                    </div>
                  </section>

                  {/* Pièce d'identité */}
                  <section>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg text-primary">badge</span>
                      Pièce d&apos;identité
                    </h3>
                    <div className="bg-slate-50 rounded-xl p-4">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-slate-400 mb-0.5">Type de pièce</p>
                          <p className="text-sm font-medium text-slate-900">{idTypeLabel(selectedCustomer.idType)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 mb-0.5">Numéro</p>
                          <p className="text-sm font-medium text-slate-900">{selectedCustomer.idNumber || "—"}</p>
                        </div>
                      </div>

                      {/* ID Card Images */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-slate-400 mb-2">Recto</p>
                          {selectedCustomer.idImageFront ? (
                            <button onClick={() => setImageModal(selectedCustomer.idImageFront)} className="block w-full group relative">
                              <Image
                                src={selectedCustomer.idImageFront}
                                alt="Pièce d'identité - Recto"
                                width={300}
                                height={200}
                                className="rounded-lg border border-slate-200 object-cover w-full h-40 group-hover:opacity-90 transition-opacity"
                              />
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="bg-black/60 text-white px-3 py-1.5 rounded-lg text-xs flex items-center gap-1">
                                  <span className="material-symbols-outlined text-sm">zoom_in</span> Agrandir
                                </span>
                              </div>
                            </button>
                          ) : (
                            <div className="w-full h-40 rounded-lg border-2 border-dashed border-slate-200 flex items-center justify-center">
                              <div className="text-center text-slate-400">
                                <span className="material-symbols-outlined text-3xl mb-1 block">no_photography</span>
                                <p className="text-xs">Non fourni</p>
                              </div>
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 mb-2">Verso</p>
                          {selectedCustomer.idImageBack ? (
                            <button onClick={() => setImageModal(selectedCustomer.idImageBack)} className="block w-full group relative">
                              <Image
                                src={selectedCustomer.idImageBack}
                                alt="Pièce d'identité - Verso"
                                width={300}
                                height={200}
                                className="rounded-lg border border-slate-200 object-cover w-full h-40 group-hover:opacity-90 transition-opacity"
                              />
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="bg-black/60 text-white px-3 py-1.5 rounded-lg text-xs flex items-center gap-1">
                                  <span className="material-symbols-outlined text-sm">zoom_in</span> Agrandir
                                </span>
                              </div>
                            </button>
                          ) : (
                            <div className="w-full h-40 rounded-lg border-2 border-dashed border-slate-200 flex items-center justify-center">
                              <div className="text-center text-slate-400">
                                <span className="material-symbols-outlined text-3xl mb-1 block">no_photography</span>
                                <p className="text-xs">Non fourni</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Notes */}
                  {selectedCustomer.notes && (
                    <section>
                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg text-primary">notes</span>
                        Notes
                      </h3>
                      <div className="bg-slate-50 rounded-xl p-4">
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">{selectedCustomer.notes}</p>
                      </div>
                    </section>
                  )}

                  {/* Commandes */}
                  <section>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg text-primary">shopping_bag</span>
                      Historique des commandes ({selectedCustomer.orders?.length || 0})
                    </h3>
                    {selectedCustomer.orders && selectedCustomer.orders.length > 0 ? (
                      <div className="space-y-2">
                        {selectedCustomer.orders.map((order) => (
                          <div key={order.id} className="bg-slate-50 rounded-xl p-4 flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-slate-900">#{order.orderNumber}</p>
                              <p className="text-xs text-slate-400">{new Date(order.createdAt).toLocaleDateString("fr-FR")}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-slate-900">${Number(order.total).toFixed(2)}</p>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                order.status === "completed" ? "bg-green-50 text-green-700" :
                                order.status === "pending" ? "bg-yellow-50 text-yellow-700" :
                                order.status === "cancelled" ? "bg-red-50 text-red-700" :
                                "bg-blue-50 text-blue-700"
                              }`}>
                                {order.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-slate-50 rounded-xl p-6 text-center">
                        <span className="material-symbols-outlined text-3xl text-slate-300 mb-2 block">receipt_long</span>
                        <p className="text-sm text-slate-400">Aucune commande</p>
                      </div>
                    )}
                  </section>

                  {/* Metadata */}
                  <section className="border-t border-slate-100 pt-4">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Inscrit le {new Date(selectedCustomer.createdAt).toLocaleDateString("fr-FR")}</span>
                      <span>Dernière MAJ : {new Date(selectedCustomer.updatedAt).toLocaleDateString("fr-FR")}</span>
                    </div>
                  </section>
                </div>

                {/* Actions */}
                <div className="sticky bottom-0 bg-white border-t border-slate-100 -mx-6 px-6 py-4 mt-6 flex gap-3">
                  <button
                    onClick={() => { setShowDetail(false); handleEdit(selectedCustomer.id); }}
                    className="flex-1 flex items-center justify-center gap-2 bg-primary text-white py-2.5 rounded-lg hover:bg-primary/90 text-sm font-medium transition-all"
                  >
                    <span className="material-symbols-outlined text-lg">edit</span>
                    Modifier
                  </button>
                  <button
                    onClick={() => { setShowDetail(false); setSelectedCustomer(null); }}
                    className="px-6 py-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-sm font-medium transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">
                <p>Client introuvable</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== Image Zoom Modal ===== */}
      {imageModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4" onClick={() => setImageModal(null)}>
          <div className="relative max-w-4xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setImageModal(null)} className="absolute -top-3 -right-3 bg-white rounded-full p-1.5 shadow-lg hover:bg-slate-100 z-10">
              <span className="material-symbols-outlined">close</span>
            </button>
            <Image src={imageModal} alt="Pièce d'identité" width={800} height={600} className="rounded-xl object-contain max-h-[85vh]" />
          </div>
        </div>
      )}

      {/* ===== Edit/Create Modal ===== */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/30" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl shadow-primary/10 w-full max-w-md max-h-[90vh] overflow-y-auto p-6 m-4">
            <h2 className="text-lg font-bold text-slate-900 mb-4">{editId ? "Modifier" : "Nouveau"} client</h2>
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
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                <textarea name="notes" value={form.notes} onChange={handleChange} rows={2} className="w-full px-3 py-2 border border-slate-200 rounded-lg" />
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
