"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCustomerAuthStore } from "@/lib/store/customer-auth";
import { Suspense } from "react";

function CallbackHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const setAuth = useCustomerAuthStore((s) => s.setAuth);
  const processed = useRef(false);

  useEffect(() => {
    // Guard against double execution (React Strict Mode)
    if (processed.current) return;

    const token = searchParams.get("token");
    const customerParam = searchParams.get("customer");

    if (token && customerParam) {
      try {
        const customer = JSON.parse(customerParam);
        processed.current = true;
        setAuth(token, customer);
        // Wait for Zustand persist to flush to localStorage before navigating
        setTimeout(() => {
          router.replace("/account");
        }, 100);
      } catch {
        router.replace("/login?error=callback_error");
      }
    } else {
      router.replace("/login?error=no_token");
    }
  }, [searchParams, router, setAuth]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-slate-500 text-sm">Connexion en cours...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      }
    >
      <CallbackHandler />
    </Suspense>
  );
}
