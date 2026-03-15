"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuthStore } from "@/lib/store/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      setAuth(data.token, data.user);
      document.cookie = `auth-token=${data.token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Strict`;
      router.push("/admin/dashboard");
    } catch {
      setError("Une erreur est survenue. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center pattern-bg px-4">
      {/* Header / Logo Area */}
      <div className="mb-8 flex flex-col items-center gap-2">
        <div className="flex items-center gap-3 text-slate-900">
          <Image src="/logo.png" alt="La Lumière Soit" width={44} height={44} className="rounded-lg" />
          <h2 className="text-2xl font-bold tracking-tight">La Lumière Soit</h2>
        </div>
        <p className="text-slate-500 text-sm">Portail de Gestion</p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-[440px] rounded-xl border border-slate-200 bg-white p-8 shadow-xl shadow-primary/5">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Connexion Admin</h1>
          <p className="mt-2 text-sm text-slate-500">Veuillez entrer vos identifiants pour accéder au tableau de bord</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">
            <span className="material-symbols-outlined text-xl">error</span>
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Input */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700" htmlFor="email">
              Adresse email
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">mail</span>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-slate-900 transition-all focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
                placeholder="admin@techstore.com"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">lock</span>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-slate-900 transition-all focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-xl active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <span>{loading ? "Connexion en cours..." : "Se connecter"}</span>
            {!loading && <span className="material-symbols-outlined text-lg">arrow_forward</span>}
          </button>
        </form>

        {/* Footer Branding */}
        <div className="mt-8 border-t border-slate-100 pt-6 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-widest font-medium">
            Environnement Admin Sécurisé
          </p>
          <p className="text-xs text-slate-400 mt-2">
            Default: admin@techstore.com / admin123
          </p>
        </div>
      </div>

      {/* Background Decorative Elements */}
      <div className="fixed -bottom-24 -right-24 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      <div className="fixed -top-24 -left-24 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
    </div>
  );
}
