"use client";

import { useEffect, useState } from "react";

interface Employee {
  id: number;
  email: string;
  name: string;
  role: string;
  active: boolean;
  createdAt: string;
}

export default function AdminEmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "seller", active: true });
  const [changingPassword, setChangingPassword] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => { loadEmployees(); }, []);

  function loadEmployees() {
    fetch("/api/employees").then((r) => r.json()).then(setEmployees);
  }

  function openCreate() {
    setEditId(null);
    setForm({ name: "", email: "", password: "", role: "seller", active: true });
    setShowModal(true);
  }

  function openEdit(emp: Employee) {
    setEditId(emp.id);
    setForm({ name: emp.name, email: emp.email, password: "", role: emp.role, active: emp.active });
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editId) {
      const body: Record<string, unknown> = { name: form.name, email: form.email, role: form.role, active: form.active };
      if (form.password) body.password = form.password;
      await fetch(`/api/employees/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } else {
      await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    setShowModal(false);
    loadEmployees();
  }

  async function toggleActive(emp: Employee) {
    await fetch(`/api/employees/${emp.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !emp.active }),
    });
    loadEmployees();
  }

  async function handleChangePassword(id: number) {
    if (!newPassword) return;
    await fetch(`/api/employees/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: newPassword }),
    });
    setChangingPassword(null);
    setNewPassword("");
  }

  async function handleDelete(id: number) {
    if (!confirm("Supprimer cet employé ?")) return;
    await fetch(`/api/employees/${id}`, { method: "DELETE" });
    loadEmployees();
  }

  const roleLabels: Record<string, string> = { admin: "Administrateur", manager: "Manager", seller: "Vendeur" };
  const roleColors: Record<string, string> = {
    admin: "bg-red-100 text-red-700",
    manager: "bg-amber-100 text-amber-700",
    seller: "bg-blue-100 text-blue-700",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">badge</span>
          Employés
        </h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 text-sm"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Ajouter un employé
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Rôle</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Inscrit le</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {employees.map((emp) => (
              <tr key={emp.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{emp.name}</td>
                <td className="px-4 py-3 text-slate-600">{emp.email}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[emp.role] || "bg-slate-100 text-slate-600"}`}>
                    {roleLabels[emp.role] || emp.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleActive(emp)}
                    className={`px-2 py-1 rounded-full text-xs font-medium cursor-pointer ${
                      emp.active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {emp.active ? "Actif" : "Inactif"}
                  </button>
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {new Date(emp.createdAt).toLocaleDateString("fr-FR")}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(emp)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-primary">
                      <span className="material-symbols-outlined text-lg">edit</span>
                    </button>
                    <button onClick={() => { setChangingPassword(emp.id); setNewPassword(""); }} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-amber-600">
                      <span className="material-symbols-outlined text-lg">key</span>
                    </button>
                    <button onClick={() => handleDelete(emp.id)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-red-500">
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              {editId ? "Modifier l'employé" : "Nouvel employé"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nom *</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Mot de passe {editId ? "(laisser vide pour garder l'actuel)" : "*"}
                </label>
                <input
                  type="password"
                  required={!editId}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Rôle</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                >
                  <option value="seller">Vendeur</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>
              {editId && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="active"
                    checked={form.active}
                    onChange={(e) => setForm({ ...form, active: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor="active" className="text-sm text-slate-700">Compte actif</label>
                </div>
              )}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">
                  Annuler
                </button>
                <button type="submit" className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 text-sm">
                  {editId ? "Modifier" : "Créer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {changingPassword && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Changer le mot de passe</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nouveau mot de passe</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  minLength={6}
                  placeholder="Minimum 6 caractères"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={() => setChangingPassword(null)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">
                  Annuler
                </button>
                <button
                  onClick={() => handleChangePassword(changingPassword)}
                  disabled={newPassword.length < 6}
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 text-sm disabled:opacity-50"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
