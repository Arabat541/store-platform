"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useCustomerAuthStore } from "@/lib/store/customer-auth";

interface Order {
  id: number;
  orderNumber: string;
  total: string;
  status: string;
  createdAt: string;
}

interface Profile {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
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
  orders: Order[];
}

interface FormState {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  dateOfBirth: string;
  gender: string;
  idType: string;
  idNumber: string;
  idImageFront: string;
  idImageBack: string;
}

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: "En attente", color: "bg-yellow-100 text-yellow-700" },
  confirmed: { label: "Confirmée", color: "bg-blue-100 text-blue-700" },
  shipped: { label: "Expédiée", color: "bg-purple-100 text-purple-700" },
  completed: { label: "Livrée", color: "bg-green-100 text-green-700" },
  cancelled: { label: "Annulée", color: "bg-red-100 text-red-700" },
};

const idTypes = [
  { value: "", label: "Sélectionner..." },
  { value: "carte_identite", label: "Carte d'identité nationale" },
  { value: "passeport", label: "Passeport" },
  { value: "permis_conduire", label: "Permis de conduire" },
  { value: "carte_electeur", label: "Carte d'électeur" },
];

export default function AccountPage() {
  const { token, customer, logout, updateCustomer, isAuthenticated, _hasHydrated } = useCustomerAuthStore();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState<FormState>({
    firstName: "", lastName: "", phone: "", address: "", city: "",
    dateOfBirth: "", gender: "", idType: "", idNumber: "", idImageFront: "", idImageBack: "",
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!isAuthenticated()) {
      router.push("/auth");
      return;
    }
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_hasHydrated]);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/auth/customer", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        logout();
        router.push("/auth");
        return;
      }
      const data = await res.json();
      setProfile(data.customer);
      setForm({
        firstName: data.customer.firstName,
        lastName: data.customer.lastName,
        phone: data.customer.phone || "",
        address: data.customer.address || "",
        city: data.customer.city || "",
        dateOfBirth: data.customer.dateOfBirth ? data.customer.dateOfBirth.slice(0, 10) : "",
        gender: data.customer.gender || "",
        idType: data.customer.idType || "",
        idNumber: data.customer.idNumber || "",
        idImageFront: data.customer.idImageFront || "",
        idImageBack: data.customer.idImageBack || "",
      });
    } catch {
      logout();
      router.push("/auth");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/auth/customer", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const data = await res.json();
        setProfile((prev) => prev ? { ...prev, ...data.customer } : prev);
        updateCustomer(data.customer);
        setEditing(false);
        setMessage("Profil mis à jour avec succès !");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch {
      setMessage("Erreur lors de la mise à jour");
    } finally {
      setSaving(false);
    }
  };

  const handleUploadId = async (file: File, side: "front" | "back") => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/auth/customer/upload-id", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        const field = side === "front" ? "idImageFront" : "idImageBack";
        setForm((prev) => ({ ...prev, [field]: data.url }));
      }
    } catch {
      // upload failed silently
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50/50">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Mon Compte</h1>
            <p className="text-slate-500 text-sm mt-1">
              Bienvenue, {profile.firstName} {profile.lastName}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
            Déconnexion
          </button>
        </div>

        {message && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-3 text-green-700">
            <span className="material-symbols-outlined text-xl">check_circle</span>
            <span className="text-sm font-medium">{message}</span>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          {/* Profil Card */}
          <div className="md:col-span-2 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900">Informations personnelles</h2>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline"
                >
                  <span className="material-symbols-outlined text-lg">edit</span>
                  Modifier
                </button>
              )}
            </div>

            {editing ? (
              <form onSubmit={handleSave} className="space-y-5">
                {/* Informations de base */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Prénom</label>
                    <input
                      type="text"
                      value={form.firstName}
                      onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                      required
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nom</label>
                    <input
                      type="text"
                      value={form.lastName}
                      onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                      required
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Date de naissance</label>
                    <input
                      type="date"
                      value={form.dateOfBirth}
                      onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Genre</label>
                    <select
                      value={form.gender}
                      onChange={(e) => setForm({ ...form, gender: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="">Sélectionner...</option>
                      <option value="homme">Homme</option>
                      <option value="femme">Femme</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Téléphone</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="+243 XXX XXX XXX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Adresse</label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ville</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {/* Pièce d'identité */}
                <div className="border-t border-slate-100 pt-5 mt-5">
                  <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg text-primary">badge</span>
                    Pièce d&apos;identité
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Type de pièce</label>
                      <select
                        value={form.idType}
                        onChange={(e) => setForm({ ...form, idType: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
                      >
                        {idTypes.map((t) => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Numéro</label>
                      <input
                        type="text"
                        value={form.idNumber}
                        onChange={(e) => setForm({ ...form, idNumber: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
                        placeholder="N° de la pièce"
                      />
                    </div>
                  </div>

                  {/* Upload images */}
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Photo recto</label>
                      {form.idImageFront ? (
                        <div className="relative group">
                          <Image src={form.idImageFront} alt="Recto" width={300} height={200} className="w-full h-32 object-cover rounded-lg border border-slate-200" />
                          <button
                            type="button"
                            onClick={() => setForm({ ...form, idImageFront: "" })}
                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <span className="material-symbols-outlined text-sm">close</span>
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors">
                          <span className="material-symbols-outlined text-2xl text-slate-400">cloud_upload</span>
                          <span className="text-xs text-slate-500 mt-1">{uploading ? "Envoi..." : "Cliquez pour ajouter"}</span>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleUploadId(file, "front");
                            }}
                          />
                        </label>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Photo verso</label>
                      {form.idImageBack ? (
                        <div className="relative group">
                          <Image src={form.idImageBack} alt="Verso" width={300} height={200} className="w-full h-32 object-cover rounded-lg border border-slate-200" />
                          <button
                            type="button"
                            onClick={() => setForm({ ...form, idImageBack: "" })}
                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <span className="material-symbols-outlined text-sm">close</span>
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors">
                          <span className="material-symbols-outlined text-2xl text-slate-400">cloud_upload</span>
                          <span className="text-xs text-slate-500 mt-1">{uploading ? "Envoi..." : "Cliquez pour ajouter"}</span>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleUploadId(file, "back");
                            }}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">Format JPG, PNG ou WebP — Max 5 Mo par image</p>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-primary/90 transition-all disabled:opacity-60"
                  >
                    {saving ? "Enregistrement..." : "Enregistrer"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider">Prénom</p>
                    <p className="text-sm font-medium text-slate-900 mt-0.5">{profile.firstName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider">Nom</p>
                    <p className="text-sm font-medium text-slate-900 mt-0.5">{profile.lastName}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider">Date de naissance</p>
                    <p className="text-sm font-medium text-slate-900 mt-0.5">
                      {profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString("fr-FR") : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider">Genre</p>
                    <p className="text-sm font-medium text-slate-900 mt-0.5 capitalize">{profile.gender || "—"}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider">Email</p>
                  <p className="text-sm font-medium text-slate-900 mt-0.5">{profile.email}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider">Téléphone</p>
                  <p className="text-sm font-medium text-slate-900 mt-0.5">{profile.phone || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider">Adresse</p>
                  <p className="text-sm font-medium text-slate-900 mt-0.5">
                    {profile.address ? `${profile.address}${profile.city ? `, ${profile.city}` : ""}` : "—"}
                  </p>
                </div>

                {/* Pièce d'identité - lecture seule */}
                {(profile.idType || profile.idNumber || profile.idImageFront) && (
                  <div className="border-t border-slate-100 pt-4 mt-4">
                    <h3 className="text-xs text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">badge</span>
                      Pièce d&apos;identité
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-slate-400 uppercase tracking-wider">Type</p>
                        <p className="text-sm font-medium text-slate-900 mt-0.5">
                          {idTypes.find(t => t.value === profile.idType)?.label || profile.idType || "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 uppercase tracking-wider">Numéro</p>
                        <p className="text-sm font-medium text-slate-900 mt-0.5">{profile.idNumber || "—"}</p>
                      </div>
                    </div>
                    {(profile.idImageFront || profile.idImageBack) && (
                      <div className="grid grid-cols-2 gap-4 mt-3">
                        {profile.idImageFront && (
                          <div>
                            <p className="text-xs text-slate-400 mb-1">Recto</p>
                            <Image src={profile.idImageFront} alt="Recto" width={300} height={200} className="w-full h-24 object-cover rounded-lg border border-slate-200" />
                          </div>
                        )}
                        {profile.idImageBack && (
                          <div>
                            <p className="text-xs text-slate-400 mb-1">Verso</p>
                            <Image src={profile.idImageBack} alt="Verso" width={300} height={200} className="w-full h-24 object-cover rounded-lg border border-slate-200" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm text-center">
              <span className="material-symbols-outlined text-3xl text-primary mb-2 block">shopping_bag</span>
              <p className="text-2xl font-bold text-slate-900">{profile.orders.length}</p>
              <p className="text-sm text-slate-500">Commandes</p>
            </div>
            <Link
              href="/products"
              className="flex items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm font-semibold text-primary hover:bg-primary/10 transition-colors"
            >
              <span className="material-symbols-outlined text-lg">storefront</span>
              Continuer mes achats
            </Link>
          </div>
        </div>

        {/* Commandes */}
        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Mes commandes récentes</h2>
          {profile.orders.length === 0 ? (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-5xl text-slate-300 mb-3 block">receipt_long</span>
              <p className="text-slate-500 text-sm">Aucune commande pour le moment</p>
              <Link
                href="/products"
                className="inline-block mt-4 text-sm text-primary font-semibold hover:underline"
              >
                Découvrir nos produits →
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-3 px-2 font-semibold text-slate-600">N° Commande</th>
                    <th className="text-left py-3 px-2 font-semibold text-slate-600">Date</th>
                    <th className="text-left py-3 px-2 font-semibold text-slate-600">Statut</th>
                    <th className="text-right py-3 px-2 font-semibold text-slate-600">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {profile.orders.map((order) => {
                    const status = statusLabels[order.status] || { label: order.status, color: "bg-slate-100 text-slate-700" };
                    return (
                      <tr key={order.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                        <td className="py-3 px-2 font-medium text-slate-900">{order.orderNumber}</td>
                        <td className="py-3 px-2 text-slate-500">
                          {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                        </td>
                        <td className="py-3 px-2">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right font-semibold text-slate-900">
                          ${parseFloat(order.total).toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
