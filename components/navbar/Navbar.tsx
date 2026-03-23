"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { useCartStore } from "@/lib/store/cart";
import { useCustomerAuthStore } from "@/lib/store/customer-auth";
import { useRouter } from "next/navigation";

const categories = [
  { name: "Smartphones", slug: "smartphones" },
  { name: "Ordinateurs", slug: "computers" },
  { name: "Accessoires", slug: "accessories" },
  { name: "Électronique", slug: "electronics" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const totalItems = useCartStore((s) => s.totalItems());
  const toggleCart = useCartStore((s) => s.toggleCart);
  const { customer, isAuthenticated, logout } = useCustomerAuthStore();
  const router = useRouter();

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/products?search=${encodeURIComponent(search.trim())}`);
      setSearch("");
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-background-light/80 backdrop-blur-md border-b border-primary/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Image src="/logo.png" alt="La Lumière Soit" width={36} height={36} className="rounded-lg" />
            <h1 className="text-xl font-bold tracking-tight text-primary">La Lumière Soit</h1>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-slate-400 text-xl">search</span>
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border-0 bg-primary/5 rounded-xl focus:ring-2 focus:ring-primary text-sm placeholder-slate-500"
                placeholder="Rechercher des produits..."
              />
            </div>
          </form>

          {/* Nav Links & Actions */}
          <nav className="flex items-center gap-1 sm:gap-4">
            <div className="hidden lg:flex items-center gap-6 mr-4">
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/products?category=${cat.slug}`}
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
            <button
              onClick={toggleCart}
              className="p-2 hover:bg-primary/10 rounded-full transition-colors relative"
            >
              <span className="material-symbols-outlined">shopping_cart</span>
              {totalItems > 0 && (
                <span className="absolute top-1 right-1 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-background-light">
                  {totalItems}
                </span>
              )}
            </button>
            {isAuthenticated() && customer ? (
              <div className="relative hidden sm:block" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 p-1.5 hover:bg-primary/10 rounded-full transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">
                      {customer.firstName[0]}{customer.lastName[0]}
                    </span>
                  </div>
                </button>
                {profileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-slate-200 shadow-xl py-2 z-50">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-sm font-semibold text-slate-900">{customer.firstName} {customer.lastName}</p>
                      <p className="text-xs text-slate-500 truncate">{customer.email}</p>
                    </div>
                    <Link
                      href="/account"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      onClick={() => setProfileOpen(false)}
                    >
                      <span className="material-symbols-outlined text-lg">person</span>
                      Mon compte
                    </Link>
                    <button
                      onClick={() => { logout(); setProfileOpen(false); router.push("/"); }}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                    >
                      <span className="material-symbols-outlined text-lg">logout</span>
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-primary text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hidden sm:block"
              >
                Connexion
              </Link>
            )}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 hover:bg-primary/10 rounded-full transition-colors"
            >
              <span className="material-symbols-outlined">
                {mobileOpen ? "close" : "menu"}
              </span>
            </button>
          </nav>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="lg:hidden py-4 border-t border-primary/10 space-y-2">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-slate-400 text-xl">search</span>
                </div>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border-0 bg-primary/5 rounded-xl focus:ring-2 focus:ring-primary text-sm placeholder-slate-500"
                  placeholder="Rechercher des produits..."
                />
              </div>
            </form>
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/products?category=${cat.slug}`}
                className="block px-3 py-2 text-sm font-medium hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {cat.name}
              </Link>
            ))}
            {isAuthenticated() && customer ? (
              <>
                <Link
                  href="/account"
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  <span className="material-symbols-outlined text-lg">person</span>
                  Mon compte
                </Link>
                <button
                  onClick={() => { logout(); setMobileOpen(false); router.push("/"); }}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full text-left"
                >
                  <span className="material-symbols-outlined text-lg">logout</span>
                  Déconnexion
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="block text-center bg-primary text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-primary/90 transition-all mt-2"
                onClick={() => setMobileOpen(false)}
              >
                Connexion
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
