"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useCartStore } from "@/lib/store/cart";
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
  const totalItems = useCartStore((s) => s.totalItems());
  const toggleCart = useCartStore((s) => s.toggleCart);
  const router = useRouter();

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
            <Link
              href="/login"
              className="bg-primary text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hidden sm:block"
            >
              Login
            </Link>
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
            <Link
              href="/login"
              className="block text-center bg-primary text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-primary/90 transition-all mt-2"
              onClick={() => setMobileOpen(false)}
            >
              Login
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
