"use client";

import { useEffect, useState } from "react";

interface Banner {
  id: number;
  title: string;
  subtitle: string | null;
  image: string;
  link: string | null;
  active: boolean;
  position: number;
  startDate: string | null;
  endDate: string | null;
}

interface FormData {
  title: string;
  subtitle: string;
  link: string;
  active: boolean;
  position: string;
  startDate: string;
  endDate: string;
}

const defaultForm: FormData = {
  title: "",
  subtitle: "",
  link: "",
  active: true,
  position: "0",
  startDate: "",
  endDate: "",
};

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<FormData>(defaultForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [existingImage, setExistingImage] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  const loadBanners = () => {
    fetch("/api/banners")
      .then((r) => r.json())
      .then((d) => setBanners(Array.isArray(d) ? d : []));
  };

  useEffect(() => {
    loadBanners();
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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setExistingImage("");
  };

  const uploadImage = async (): Promise<string> => {
    if (!imageFile) return existingImage;
    const fd = new window.FormData();
    fd.append("files", imageFile);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    if (!res.ok) throw new Error("Upload failed");
    const { urls } = await res.json();
    return urls[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile && !existingImage) {
      alert("Veuillez sélectionner une image pour la bannière");
      return;
    }
    setUploading(true);
    try {
      const imageUrl = await uploadImage();

      const payload = {
        title: form.title,
        subtitle: form.subtitle || null,
        image: imageUrl,
        link: form.link || null,
        active: form.active,
        position: parseInt(form.position) || 0,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
      };

      const url = editId ? `/api/banners/${editId}` : "/api/banners";
      const method = editId ? "PUT" : "POST";

      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      closeModal();
      loadBanners();
    } catch (err) {
      alert("Erreur lors de la sauvegarde");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditId(null);
    setForm(defaultForm);
    setImageFile(null);
    setImagePreview("");
    setExistingImage("");
  };

  const handleEdit = (banner: Banner) => {
    setForm({
      title: banner.title,
      subtitle: banner.subtitle || "",
      link: banner.link || "",
      active: banner.active,
      position: String(banner.position),
      startDate: banner.startDate ? banner.startDate.slice(0, 16) : "",
      endDate: banner.endDate ? banner.endDate.slice(0, 16) : "",
    });
    setExistingImage(banner.image);
    setImageFile(null);
    setImagePreview("");
    setEditId(banner.id);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer cette bannière ?")) return;
    await fetch(`/api/banners/${id}`, { method: "DELETE" });
    loadBanners();
  };

  const toggleActive = async (banner: Banner) => {
    await fetch(`/api/banners/${banner.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...banner, active: !banner.active }),
    });
    loadBanners();
  };

  const formatDate = (d: string | null) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Bannières publicitaires</h1>
          <p className="text-sm text-slate-500 mt-1">Gérez les annonces affichées sur la page d&apos;accueil</p>
        </div>
        <button
          onClick={() => {
            setForm(defaultForm);
            setEditId(null);
            setImageFile(null);
            setImagePreview("");
            setExistingImage("");
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg hover:bg-primary/90 shadow-lg shadow-primary/20 font-medium text-sm transition-all"
        >
          <span className="material-symbols-outlined text-lg">add</span> Nouvelle bannière
        </button>
      </div>

      {/* Banner list */}
      <div className="space-y-4">
        {banners.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
            <span className="material-symbols-outlined text-5xl text-slate-300 mb-3 block">campaign</span>
            <p className="text-slate-500">Aucune bannière publicitaire</p>
            <p className="text-sm text-slate-400 mt-1">Créez votre première bannière pour annoncer vos promotions</p>
          </div>
        )}

        {banners.map((banner) => (
          <div
            key={banner.id}
            className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col sm:flex-row">
              {/* Image preview */}
              <div className="sm:w-64 h-40 sm:h-auto bg-slate-100 flex-shrink-0 relative">
                <img
                  src={banner.image}
                  alt={banner.title}
                  className="w-full h-full object-cover"
                />
                {!banner.active && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white text-sm font-bold bg-red-500 px-3 py-1 rounded-full">Inactive</span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-lg text-slate-900">{banner.title}</h3>
                      {banner.subtitle && (
                        <p className="text-sm text-slate-500 mt-0.5">{banner.subtitle}</p>
                      )}
                    </div>
                    <span className="text-xs font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded">
                      #{banner.position}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-3 text-xs text-slate-500 mt-3">
                    {banner.link && (
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">link</span>
                        {banner.link}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">calendar_today</span>
                      {formatDate(banner.startDate)} → {formatDate(banner.endDate)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-50">
                  <button
                    onClick={() => toggleActive(banner)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      banner.active
                        ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                        : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">
                      {banner.active ? "visibility" : "visibility_off"}
                    </span>
                    {banner.active ? "Active" : "Inactive"}
                  </button>
                  <button
                    onClick={() => handleEdit(banner)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">edit</span>
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(banner.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/30" onClick={closeModal} />
          <div className="relative bg-white rounded-2xl shadow-2xl shadow-primary/10 w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 m-4">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">
                {editId ? "edit" : "campaign"}
              </span>
              {editId ? "Modifier la bannière" : "Nouvelle bannière"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Titre *</label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  placeholder="Ex: Soldes d'été -50%"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Sous-titre</label>
                <input
                  name="subtitle"
                  value={form.subtitle}
                  onChange={handleChange}
                  placeholder="Ex: Sur tous les smartphones"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Image upload */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Image de la bannière *</label>
                {(imagePreview || existingImage) && (
                  <div className="relative mb-3 rounded-xl overflow-hidden border border-slate-200">
                    <img
                      src={imagePreview || existingImage}
                      alt="Aperçu"
                      className="w-full h-40 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview("");
                        setExistingImage("");
                      }}
                      className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                )}
                <div className="flex gap-2">
                  <label className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer transition-colors text-sm font-medium text-slate-700">
                    <span className="material-symbols-outlined text-lg">photo_library</span>
                    Galerie
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </label>
                  <label className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer transition-colors text-sm font-medium text-slate-700">
                    <span className="material-symbols-outlined text-lg">photo_camera</span>
                    Appareil photo
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Lien (URL)</label>
                <input
                  name="link"
                  value={form.link}
                  onChange={handleChange}
                  placeholder="Ex: /products?category=smartphones"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date de début</label>
                  <input
                    name="startDate"
                    type="datetime-local"
                    value={form.startDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date de fin</label>
                  <input
                    name="endDate"
                    type="datetime-local"
                    value={form.endDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Position (ordre)</label>
                  <input
                    name="position"
                    type="number"
                    value={form.position}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="active"
                      checked={form.active}
                      onChange={handleChange}
                      className="rounded"
                    />
                    <span className="text-sm text-slate-700">Active</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 font-medium transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-2.5 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 shadow-lg shadow-primary/20 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? "Upload en cours..." : editId ? "Modifier" : "Créer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
