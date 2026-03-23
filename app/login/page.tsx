"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuthStore } from "@/lib/store/auth";
import { useCustomerAuthStore } from "@/lib/store/customer-auth";

const errorMessages: Record<string, string> = {
  google_denied: "Connexion Google annulée",
  google_token: "Erreur lors de la connexion Google",
  google_email: "Impossible de récupérer votre email Google",
  google_error: "Erreur lors de la connexion Google",
  facebook_denied: "Connexion Facebook annulée",
  facebook_token: "Erreur lors de la connexion Facebook",
  facebook_email: "Impossible de récupérer votre email Facebook",
  facebook_error: "Erreur lors de la connexion Facebook",
  account_disabled: "Votre compte a été désactivé",
  callback_error: "Erreur lors de la connexion",
  no_token: "Erreur lors de la connexion",
};

function LoginForm() {
  const [tab, setTab] = useState<"client" | "admin">("client");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Forgot password state
  const [forgotMode, setForgotMode] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [resetUid, setResetUid] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetStep, setResetStep] = useState<"email" | "token" | "done">("email");

  const router = useRouter();
  const setAdminAuth = useAuthStore((s) => s.setAuth);
  const setCustomerAuth = useCustomerAuthStore((s) => s.setAuth);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const errorParam = params.get("error");
    if (errorParam && errorMessages[errorParam]) {
      setError(errorMessages[errorParam]);
      window.history.replaceState({}, "", "/login");
    }
    const tabParam = params.get("tab");
    if (tabParam === "admin") {
      setTab("admin");
    }
  }, []);

  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const body =
        mode === "login"
          ? { action: "login", email, password }
          : { action: "register", email, password, firstName, lastName, phone };

      const res = await fetch("/api/auth/customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Une erreur est survenue");
        return;
      }

      setCustomerAuth(data.token, data.customer);
      router.push("/account");
    } catch {
      setError("Une erreur est survenue. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
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
        setError(data.error || "Échec de la connexion");
        return;
      }

      setAdminAuth(data.token, data.user);
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

  const switchTab = (newTab: "client" | "admin") => {
    setTab(newTab);
    setEmail("");
    setPassword("");
    setError("");
    setMode("login");
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center pattern-bg px-4">
      {/* Logo */}
      <div className="mb-8 flex flex-col items-center gap-2">
        <Link href="/" className="flex items-center gap-3 text-slate-900 hover:opacity-80 transition-opacity">
          <Image src="/logo.png" alt="La Lumière Soit" width={44} height={44} className="rounded-lg" />
          <h2 className="text-2xl font-bold tracking-tight">La Lumière Soit</h2>
        </Link>
      </div>

      <div className="w-full max-w-[480px]">
        {/* Main tabs: Client / Administration */}
        <div className="flex mb-6 bg-slate-100 rounded-xl p-1">
          <button
            onClick={() => switchTab("client")}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
              tab === "client"
                ? "bg-white text-primary shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <span className="material-symbols-outlined text-lg">person</span>
            Client
          </button>
          <button
            onClick={() => switchTab("admin")}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
              tab === "admin"
                ? "bg-white text-primary shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
            Administration
          </button>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-xl shadow-primary/5">
          {/* ============ CLIENT TAB ============ */}
          {tab === "client" && (
            <>
              {/* Login/Register sub-tabs */}
              <div className="flex mb-6 bg-slate-50 rounded-lg p-0.5">
                <button
                  onClick={() => { setMode("login"); setError(""); }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all ${
                    mode === "login"
                      ? "bg-white text-primary shadow-sm"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  Connexion
                </button>
                <button
                  onClick={() => { setMode("register"); setError(""); }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all ${
                    mode === "register"
                      ? "bg-white text-primary shadow-sm"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  Créer un compte
                </button>
              </div>

              <div className="mb-6 text-center">
                <h1 className="text-2xl font-bold text-slate-900">
                  {mode === "login" ? "Bienvenue !" : "Créer votre compte"}
                </h1>
                <p className="mt-2 text-sm text-slate-500">
                  {mode === "login"
                    ? "Connectez-vous pour accéder à votre espace client"
                    : "Inscrivez-vous pour profiter de nos services"}
                </p>
              </div>

              {error && (
                <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">
                  <span className="material-symbols-outlined text-xl">error</span>
                  <span className="text-sm font-medium">{error}</span>
                </div>
              )}

              <form onSubmit={handleCustomerSubmit} className="space-y-4">
                {mode === "register" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-slate-700" htmlFor="firstName">Prénom</label>
                      <input id="firstName" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-4 text-slate-900 transition-all focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
                        placeholder="Jean" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-slate-700" htmlFor="lastName">Nom</label>
                      <input id="lastName" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-4 text-slate-900 transition-all focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
                        placeholder="Dupont" />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700" htmlFor="email">Adresse email</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">mail</span>
                    <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-11 pr-4 text-slate-900 transition-all focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
                      placeholder="votre@email.com" />
                  </div>
                </div>

                {mode === "register" && (
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-700" htmlFor="phone">Téléphone (optionnel)</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">phone</span>
                      <input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-11 pr-4 text-slate-900 transition-all focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
                        placeholder="+243 XXX XXX XXX" />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700" htmlFor="password">Mot de passe</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">lock</span>
                    <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-11 pr-4 text-slate-900 transition-all focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
                      placeholder="••••••••" />
                  </div>
                  {mode === "register" && <p className="text-xs text-slate-400 mt-1">Minimum 6 caractères</p>}
                </div>

                <button type="submit" disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-xl active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed mt-2">
                  <span>{loading ? "Chargement..." : mode === "login" ? "Se connecter" : "Créer mon compte"}</span>
                  {!loading && <span className="material-symbols-outlined text-lg">arrow_forward</span>}
                </button>
              </form>

              {/* Separator */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-3 text-xs text-slate-400 uppercase tracking-wider">ou continuer avec</span>
                </div>
              </div>

              {/* Social Login */}
              <div className="space-y-3">
                <a href="/api/auth/customer/google"
                  className="flex w-full items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm active:scale-[0.98]">
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continuer avec Google
                </a>
                <a href="/api/auth/customer/facebook"
                  className="flex w-full items-center justify-center gap-3 rounded-lg border border-[#1877F2] bg-[#1877F2] py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#166FE5] hover:shadow-sm active:scale-[0.98]">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Continuer avec Facebook
                </a>
              </div>
            </>
          )}

          {/* ============ ADMIN TAB ============ */}
          {tab === "admin" && (
            <>
              <div className="mb-6 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <span className="material-symbols-outlined text-2xl text-primary">shield_person</span>
                </div>
                <h1 className="text-2xl font-bold text-slate-900">Espace Administration</h1>
                <p className="mt-2 text-sm text-slate-500">Connectez-vous pour accéder au tableau de bord</p>
              </div>

              {error && (
                <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">
                  <span className="material-symbols-outlined text-xl">error</span>
                  <span className="text-sm font-medium">{error}</span>
                </div>
              )}

              <form onSubmit={handleAdminSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700" htmlFor="admin-email">Adresse email</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">mail</span>
                    <input id="admin-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-slate-900 transition-all focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
                      placeholder="admin@techstore.com" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700" htmlFor="admin-password">Mot de passe</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">lock</span>
                    <input id="admin-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-slate-900 transition-all focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
                      placeholder="••••••••" />
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-xl active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed">
                  <span>{loading ? "Connexion en cours..." : "Se connecter"}</span>
                  {!loading && <span className="material-symbols-outlined text-lg">arrow_forward</span>}
                </button>
              </form>

              <div className="mt-4 text-center">
                <button
                  onClick={() => { setForgotMode(true); setResetStep("email"); setError(""); }}
                  className="text-sm text-primary hover:underline"
                >
                  Mot de passe oublié ?
                </button>
              </div>
            </>
          )}

          {/* Return to store */}
          <div className="mt-6 text-center">
            <Link href="/" className="text-xs text-slate-400 hover:text-primary transition-colors">
              ← Retour à la boutique
            </Link>
          </div>
        </div>
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
                    <input type="password" required minLength={6} value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg" placeholder="Minimum 6 caractères" />
                  </div>
                  <div className="flex justify-end gap-3">
                    <button type="button" onClick={() => setForgotMode(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Annuler</button>
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
                    <input type="email" required value={resetEmail} onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg" placeholder="votre@email.com" />
                  </div>
                  <div className="flex justify-end gap-3">
                    <button type="button" onClick={() => setForgotMode(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Annuler</button>
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

      {/* Background Decorative */}
      <div className="fixed -bottom-24 -right-24 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      <div className="fixed -top-24 -left-24 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
    </div>
  );
}

export default function UnifiedLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
