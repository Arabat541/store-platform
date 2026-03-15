"use client";

import { useEffect, useState } from "react";

export default function AdminSettingsPage() {
  const [store, setStore] = useState({ store_name: "La Lumière Soit", currency: "XOF", tax_rate: "0" });
  const [contact, setContact] = useState({ contact_email: "contact@lalumieresoit.com", contact_phone: "+225 00 000 000", contact_address: "Avenue de la République, Abidjan, Côte d'Ivoire" });
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/settings").then(r => r.json()).then((data) => {
      if (data.store_name) setStore(s => ({ ...s, store_name: data.store_name }));
      if (data.currency) setStore(s => ({ ...s, currency: data.currency }));
      if (data.tax_rate) setStore(s => ({ ...s, tax_rate: data.tax_rate }));
      if (data.contact_email) setContact(c => ({ ...c, contact_email: data.contact_email }));
      if (data.contact_phone) setContact(c => ({ ...c, contact_phone: data.contact_phone }));
      if (data.contact_address) setContact(c => ({ ...c, contact_address: data.contact_address }));
    });
  }, []);

  async function saveStore() {
    setSaving("store");
    await fetch("/api/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(store) });
    setSaving(null);
  }

  async function saveContact() {
    setSaving("contact");
    await fetch("/api/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(contact) });
    setSaving(null);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Paramètres</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Paramètres de la boutique</h2>
          <form className="space-y-4" onSubmit={e => { e.preventDefault(); saveStore(); }}>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nom de la boutique</label>
              <input value={store.store_name} onChange={e => setStore(s => ({ ...s, store_name: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Devise</label>
              <select value={store.currency} onChange={e => setStore(s => ({ ...s, currency: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg">
                <option value="XOF">XOF - Franc CFA (BCEAO)</option>
                <option value="EUR">EUR - Euro</option>
                <option value="USD">USD - US Dollar</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Taux de taxe (%)</label>
              <input type="number" value={store.tax_rate} onChange={e => setStore(s => ({ ...s, tax_rate: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg" />
            </div>
            <button type="submit" disabled={saving === "store"} className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 text-sm disabled:opacity-50">
              {saving === "store" ? "Enregistrement..." : "Enregistrer"}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Informations de contact</h2>
          <form className="space-y-4" onSubmit={e => { e.preventDefault(); saveContact(); }}>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input type="email" value={contact.contact_email} onChange={e => setContact(c => ({ ...c, contact_email: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Téléphone</label>
              <input value={contact.contact_phone} onChange={e => setContact(c => ({ ...c, contact_phone: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Adresse</label>
              <textarea rows={3} value={contact.contact_address} onChange={e => setContact(c => ({ ...c, contact_address: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg" />
            </div>
            <button type="submit" disabled={saving === "contact"} className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 text-sm disabled:opacity-50">
              {saving === "contact" ? "Enregistrement..." : "Enregistrer le contact"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
