"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/store/auth";

const navigation = [
  { name: "Tableau de bord", href: "/admin/dashboard", icon: "dashboard" },
  { name: "Produits", href: "/admin/products", icon: "inventory_2" },
  { name: "Commandes", href: "/admin/orders", icon: "shopping_bag" },
  { name: "Clients", href: "/admin/customers", icon: "group" },
  { name: "Inventaire", href: "/admin/inventory", icon: "warehouse" },
  { name: "Fournisseurs", href: "/admin/suppliers", icon: "local_shipping" },
  { name: "Rapports", href: "/admin/reports", icon: "bar_chart" },
  { name: "Paramètres", href: "/admin/settings", icon: "settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  return (
    <aside className="w-64 bg-background-dark text-slate-100 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6">
        <Link href="/admin/dashboard" className="flex items-center gap-3">
          <Image src="/logo.png" alt="La Lumière Soit" width={36} height={36} className="rounded-lg" />
          <div>
            <span className="text-lg font-bold tracking-tight">La Lumière Soit</span>
            <span className="block text-xs text-slate-500">Panneau Admin</span>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
              )}
            >
              <span className="material-symbols-outlined text-xl">{item.icon}</span>
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-sm font-bold text-primary">
            {user?.name?.charAt(0) || "A"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name || "Admin"}</p>
            <p className="text-xs text-slate-500 truncate capitalize">{user?.role || "admin"}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
        >
          <span className="material-symbols-outlined text-lg">logout</span>
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
