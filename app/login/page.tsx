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
  const [forgotMode, setForgotMode] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [resetToken, setResetToken] = useState("");
  const [resetUid, setResetUid] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetStep, setResetStep] = useState<"email" | "token" | "done">("email");
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
      setError("Une erreur est survenue. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail }),
      });
      const data = await res.json();
      if (data.resetToken) {
        setResetToken(data.resetToken);
        setResetUid(data.resetUrl?.split("uid=")[1] || "");
        setResetStep("token");
      }
      setResetSent(true);
    } catch {
      setError("Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: resetToken, newPassword, uid: resetUid }),
      });
      const data = await res.json();
      if (res.ok) {
        setResetStep("done");
      } else {
        setError(data.error || "Erreur");
      }
    } catch {
      setError("Une erreur est survenue.");
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

        <div className="mt-4 text-center">
          <button
            onClick={() => { setForgotMode(true); setResetStep("email"); setResetSent(false); setError(""); }}
            className="text-sm text-primary hover:underline"
          >
            Mot de passe oublié ?
          </button>
        </div>

        {/* Forgot Password Modal */}
        {forgotMode && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              {resetStep === "done" ? (
                <div className="text-center py-4">
                  <span className="material-symbols-outlined text-5xl text-green-500 mb-3 block">check_circle</span>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Mot de passe réinitialisé !</h3>
                  <p className="text-sm text-slate-500 mb-4">Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.</p>
                  <button onClick={() => setForgotMode(false)} className="bg-primary text-white px-6 py-2 rounded-lg text-sm hover:bg-primary/90">
                    Retour à la connexion
                  </button>
                </div>
              ) : resetStep === "token" ? (
                <>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Nouveau mot de passe</h3>
                  <p className="text-sm text-slate-500 mb-4">Entrez votre nouveau mot de passe ci-dessous.</p>
                  {error && (
                    <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700 text-sm">
                      <span className="material-symbols-outlined text-lg">error</span>
                      {error}
                    </div>
                  )}
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Nouveau mot de passe</label>
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                        placeholder="Minimum 6 caractères"
                      />
                    </div>
                    <div className="flex justify-end gap-3">
                      <button type="button" onClick={() => setForgotMode(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">
                        Annuler
                      </button>
                      <button type="submit" disabled={loading} className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 text-sm disabled:opacity-50">
                        {loading ? "..." : "Réinitialiser"}
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Mot de passe oublié</h3>
                  <p className="text-sm text-slate-500 mb-4">Entrez votre adresse email pour réinitialiser votre mot de passe.</p>
                  {error && (
                    <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700 text-sm">
                      <span className="material-symbols-outlined text-lg">error</span>
                      {error}
                    </div>
                  )}
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                      <input
                        type="email"
                        required
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                        placeholder="votre@email.com"
                      />
                    </div>
                    <div className="flex justify-end gap-3">
                      <button type="button" onClick={() => setForgotMode(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">
                        Annuler
                      </button>
                      <button type="submit" disabled={loading} className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 text-sm disabled:opacity-50">
                        {loading ? "..." : "Réinitialiser"}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        )}

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
