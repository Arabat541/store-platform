"use client";

import { Fragment } from "react";
import { useCartStore } from "@/lib/store/cart";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

export default function CartDrawer() {
  const { items, isOpen, setOpen, removeItem, updateQuantity, totalPrice } =
    useCartStore();

  if (!isOpen) return null;

  return (
    <Fragment>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
        onClick={() => setOpen(false)}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl shadow-primary/10 z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-primary/10">
          <h2 className="text-lg font-bold text-slate-900">
            Panier ({items.length})
          </h2>
          <button
            onClick={() => setOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-16">
              <span className="material-symbols-outlined text-5xl text-slate-300 mb-4 block">shopping_cart</span>
              <p className="text-slate-500 font-medium">Votre panier est vide</p>
              <button
                onClick={() => setOpen(false)}
                className="mt-4 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Continuer les achats
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 bg-slate-50 border border-slate-100 rounded-xl p-3"
              >
                <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-100">
                  <Image
                    src={item.image || "/icons/placeholder.svg"}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-slate-900 truncate">
                    {item.name}
                  </h3>
                  <p className="text-sm font-bold text-primary mt-1">
                    {formatCurrency(item.price)}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        className="px-2.5 py-1 hover:bg-slate-100 text-slate-600 transition-colors"
                      >
                        <span className="material-symbols-outlined text-base">remove</span>
                      </button>
                      <span className="px-3 py-1 text-sm font-medium border-x border-slate-200">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="px-2.5 py-1 hover:bg-slate-100 text-slate-600 transition-colors"
                      >
                        <span className="material-symbols-outlined text-base">add</span>
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="ml-auto p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-5 border-t border-primary/10 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-base font-medium text-slate-600">
                Total
              </span>
              <span className="text-xl font-bold text-slate-900">
                {formatCurrency(totalPrice())}
              </span>
            </div>
            <Link
              href="/checkout"
              onClick={() => setOpen(false)}
              className="block w-full bg-primary text-white text-center py-3 rounded-xl font-semibold hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all"
            >
              Passer à la caisse
            </Link>
          </div>
        )}
      </div>
    </Fragment>
  );
}
