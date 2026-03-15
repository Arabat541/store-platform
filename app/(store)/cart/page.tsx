"use client";

import { useCartStore } from "@/lib/store/cart";
import { formatCurrency } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, totalPrice } =
    useCartStore();

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <span className="material-symbols-outlined text-6xl text-slate-300 mb-4 block">shopping_cart</span>
        <h1 className="text-2xl font-bold text-slate-900 mb-3">
          Votre panier est vide
        </h1>
        <p className="text-slate-500 mb-6">
          Looks like you haven&apos;t added anything yet.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Commencer vos achats
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <h2 className="text-3xl font-bold mb-8 text-slate-900">Panier</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-lg">Vos articles ({items.length})</h3>
              <button
                onClick={clearCart}
                className="text-sm text-slate-500 hover:text-red-500 font-medium transition-colors"
              >
                Vider le panier
              </button>
            </div>

            {items.map((item) => (
              <div
                key={item.id}
                className="p-6 flex flex-col sm:flex-row gap-6 border-b border-slate-100 last:border-0"
              >
                <div className="h-24 w-24 rounded-lg bg-slate-50 flex-shrink-0 p-2 overflow-hidden border border-slate-100">
                  <Image
                    src={item.image || "/icons/placeholder.svg"}
                    alt={item.name}
                    width={96}
                    height={96}
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between">
                    <Link
                      href={`/product/${item.id}`}
                      className="font-semibold text-slate-900 hover:text-primary transition-colors text-lg"
                    >
                      {item.name}
                    </Link>
                    <p className="font-bold text-primary text-lg">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                  <p className="text-sm text-slate-500">
                    {formatCurrency(item.price)} chacun
                  </p>
                  <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-3 py-1.5 hover:bg-slate-50 text-slate-600 transition-colors"
                      >
                        <span className="material-symbols-outlined text-base">remove</span>
                      </button>
                      <span className="px-4 py-1.5 text-sm font-medium border-x border-slate-200">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-3 py-1.5 hover:bg-slate-50 text-slate-600 transition-colors"
                      >
                        <span className="material-symbols-outlined text-base">add</span>
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Résumé de la commande */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 sticky top-24">
          <h3 className="font-bold text-lg mb-4">Résumé de la commande</h3>
          <div className="space-y-3 mb-4">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-slate-500">{item.name} × {item.quantity}</span>
                <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-200 pt-4 flex items-center justify-between">
            <span className="text-base font-semibold">Total</span>
            <span className="text-2xl font-bold text-slate-900">
              {formatCurrency(totalPrice())}
            </span>
          </div>
          <Link
            href="/checkout"
            className="block w-full mt-6 bg-primary text-white text-center py-3.5 rounded-xl font-semibold hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all"
          >
            Passer à la caisse
          </Link>
          <Link
            href="/products"
            className="block w-full mt-3 text-center py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:text-primary border border-slate-200 hover:border-primary/30 transition-colors"
          >
            Continuer les achats
          </Link>
        </div>
      </div>
    </div>
  );
}
