"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCustomerAuthStore } from "@/lib/store/customer-auth";

const errorMessages: Record<string, string> = {
  google_denied: "Connexion Google annulée",
  google_token: "Erreur lors de la connexion Google",
  google_email: "Impossible de récupérer votre email Google",
  google_error: "Erreur lors de la connexion Google",
  facebook_denied: "Connexion Facebook annulée",
  facebook_token: "Erreur lors de la connexion Facebook",
  facebook_email: "Impossible de récupérer votre email Facebook. Assurez-vous d'avoir autorisé l'accès à votre email.",
  facebook_error: "Erreur lors de la connexion Facebook",
  account_disabled: "Votre compte a été désactivé",
  callback_error: "Erreur lors de la connexion",
  no_token: "Erreur lors de la connexion",
};

function AuthForm() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const setAuth = useCustomerAuthStore((s) => s.setAuth);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const errorParam = params.get("error");
    if (errorParam && errorMessages[errorParam]) {
      setError(errorMessages[errorParam]);
      // Clean URL
      window.history.replaceState({}, "", "/auth");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
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

      setAuth(data.token, data.customer);
      router.push("/account");
    } catch {
      setError("Une erreur est survenue. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[480px]">
        {/* Tabs */}
        <div className="flex mb-6 bg-slate-100 rounded-xl p-1">
          <button
            onClick={() => { setMode("login"); setError(""); }}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
              mode === "login"
                ? "bg-white text-primary shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Connexion
          </button>
          <button
            onClick={() => { setMode("register"); setError(""); }}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
              mode === "register"
                ? "bg-white text-primary shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Créer un compte
          </button>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-xl shadow-primary/5">
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

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700" htmlFor="firstName">
                    Prénom
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-4 text-slate-900 transition-all focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
                    placeholder="Jean"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700" htmlFor="lastName">
                    Nom
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-4 text-slate-900 transition-all focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
                    placeholder="Dupont"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700" htmlFor="customer-email">
                Adresse email
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">mail</span>
                <input
                  id="customer-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-11 pr-4 text-slate-900 transition-all focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
                  placeholder="votre@email.com"
                />
              </div>
            </div>

            {mode === "register" && (
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700" htmlFor="customer-phone">
                  Téléphone (optionnel)
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">phone</span>
                  <input
                    id="customer-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-11 pr-4 text-slate-900 transition-all focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
                    placeholder="+243 XXX XXX XXX"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700" htmlFor="customer-password">
                Mot de passe
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">lock</span>
                <input
                  id="customer-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-11 pr-4 text-slate-900 transition-all focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
                  placeholder="••••••••"
                />
              </div>
              {mode === "register" && (
                <p className="text-xs text-slate-400 mt-1">Minimum 6 caractères</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-xl active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              <span>
                {loading
                  ? "Chargement..."
                  : mode === "login"
                  ? "Se connecter"
                  : "Créer mon compte"}
              </span>
              {!loading && (
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              )}
            </button>
          </form>

          {/* Separator */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-xs text-slate-400 uppercase tracking-wider">ou continuer avec</span>
            </div>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-3">
            <a
              href="/api/auth/customer/google"
              className="flex w-full items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm active:scale-[0.98]"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continuer avec Google
            </a>
            <a
              href="/api/auth/customer/facebook"
              className="flex w-full items-center justify-center gap-3 rounded-lg border border-[#1877F2] bg-[#1877F2] py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#166FE5] hover:shadow-sm active:scale-[0.98]"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Continuer avec Facebook
            </a>
          </div>

          <div className="mt-6 text-center text-sm text-slate-500">
            {mode === "login" ? (
              <p>
                Pas encore de compte ?{" "}
                <button
                  onClick={() => { setMode("register"); setError(""); }}
                  className="text-primary font-semibold hover:underline"
                >
                  Inscrivez-vous
                </button>
              </p>
            ) : (
              <p>
                Déjà un compte ?{" "}
                <button
                  onClick={() => { setMode("login"); setError(""); }}
                  className="text-primary font-semibold hover:underline"
                >
                  Connectez-vous
                </button>
              </p>
            )}
          </div>

          <div className="mt-4 text-center">
            <Link href="/" className="text-xs text-slate-400 hover:text-primary transition-colors">
              ← Retour à la boutique
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CustomerAuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    }>
      <AuthForm />
    </Suspense>
  );
}
