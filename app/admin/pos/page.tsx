"use client";

import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/utils";

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  sku: string | null;
  images: string[];
}

interface CartItem {
  product: Product;
  quantity: number;
}

export default function AdminPOSPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [processing, setProcessing] = useState(false);
  const [receipt, setReceipt] = useState<{ orderNumber: string; total: number } | null>(null);

  useEffect(() => {
    fetch("/api/products?limit=500")
      .then((r) => r.json())
      .then((d) => setProducts(d.products || []));
  }, []);

  const filtered = products.filter(
    (p) =>
      p.stock > 0 &&
      (p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(search.toLowerCase())))
  );

  function addToCart(product: Product) {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  }

  function updateQuantity(productId: number, qty: number) {
    if (qty <= 0) {
      setCart((prev) => prev.filter((i) => i.product.id !== productId));
    } else {
      setCart((prev) =>
        prev.map((i) =>
          i.product.id === productId
            ? { ...i, quantity: Math.min(qty, i.product.stock) }
            : i
        )
      );
    }
  }

  function removeFromCart(productId: number) {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  }

  const subtotal = cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const total = subtotal;

  async function processOrder() {
    if (cart.length === 0) return;
    setProcessing(true);

    const customerEmail = `pos-${Date.now()}@boutique.local`;

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer: {
          firstName: customerName || "Client",
          lastName: "Boutique",
          email: customerEmail,
          phone: customerPhone || undefined,
        },
        items: cart.map((i) => ({
          productId: i.product.id,
          quantity: i.quantity,
        })),
        paymentMethod,
        notes: "Vente en boutique (POS)",
      }),
    });

    if (res.ok) {
      const order = await res.json();
      setReceipt({ orderNumber: order.orderNumber, total: Number(order.total) });
      setCart([]);
      setCustomerName("");
      setCustomerPhone("");
      // Refresh products stock
      fetch("/api/products?limit=500")
        .then((r) => r.json())
        .then((d) => setProducts(d.products || []));
    }
    setProcessing(false);
  }

  function newSale() {
    setReceipt(null);
  }

  if (receipt) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center max-w-md w-full">
          <span className="material-symbols-outlined text-6xl text-green-500 mb-4 block">check_circle</span>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Vente enregistrée !</h2>
          <p className="text-slate-500 mb-4">Commande #{receipt.orderNumber}</p>
          <p className="text-3xl font-bold text-slate-900 mb-6">{formatCurrency(receipt.total)}</p>
          <button
            onClick={newSale}
            className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Nouvelle vente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-6 h-[calc(100vh-2rem)]">
      {/* Product selection */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="mb-4">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un produit (nom ou référence)..."
              className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl bg-white text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 content-start">
          {filtered.map((product) => (
            <button
              key={product.id}
              onClick={() => addToCart(product)}
              className="bg-white border border-slate-200 rounded-xl p-4 text-left hover:border-primary hover:shadow-md transition-all group"
            >
              <div className="w-full aspect-square bg-slate-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                {product.images?.[0] ? (
                  <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-4xl text-slate-300">image</span>
                )}
              </div>
              <h3 className="text-sm font-medium text-slate-900 truncate group-hover:text-primary">
                {product.name}
              </h3>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm font-bold text-primary">{formatCurrency(product.price)}</span>
                <span className="text-xs text-slate-400">Stock: {product.stock}</span>
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-12 text-slate-400">
              <span className="material-symbols-outlined text-5xl mb-2 block">search_off</span>
              Aucun produit trouvé
            </div>
          )}
        </div>
      </div>

      {/* Cart / Order panel */}
      <div className="w-96 bg-white border border-slate-200 rounded-2xl flex flex-col">
        <div className="p-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">point_of_sale</span>
            Vente en boutique
          </h2>
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <span className="material-symbols-outlined text-4xl mb-2 block">shopping_cart</span>
              <p className="text-sm">Sélectionnez des produits</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.product.id} className="flex items-center gap-3 bg-slate-50 rounded-lg p-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{item.product.name}</p>
                  <p className="text-xs text-slate-500">{formatCurrency(item.product.price)}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    className="w-7 h-7 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100"
                  >
                    <span className="material-symbols-outlined text-base">remove</span>
                  </button>
                  <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    className="w-7 h-7 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100"
                  >
                    <span className="material-symbols-outlined text-base">add</span>
                  </button>
                </div>
                <div className="text-right min-w-[80px]">
                  <p className="text-sm font-bold text-slate-900">{formatCurrency(item.product.price * item.quantity)}</p>
                </div>
                <button
                  onClick={() => removeFromCart(item.product.id)}
                  className="text-slate-400 hover:text-red-500"
                >
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Customer + Payment */}
        <div className="p-4 border-t border-slate-100 space-y-3">
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Nom du client (optionnel)"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
          />
          <input
            type="tel"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            placeholder="Téléphone (optionnel)"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
          />
          <div className="flex gap-2">
            {[
              { value: "cash", label: "Espèces", icon: "payments" },
              { value: "mobile_money", label: "Mobile Money", icon: "smartphone" },
              { value: "card", label: "Carte", icon: "credit_card" },
            ].map((m) => (
              <button
                key={m.value}
                onClick={() => setPaymentMethod(m.value)}
                className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-lg border text-xs font-medium transition-colors ${
                  paymentMethod === m.value
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-slate-200 text-slate-500 hover:border-slate-300"
                }`}
              >
                <span className="material-symbols-outlined text-lg">{m.icon}</span>
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Total + Confirm */}
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-bold text-slate-900">Total</span>
            <span className="text-2xl font-black text-primary">{formatCurrency(total)}</span>
          </div>
          <button
            onClick={processOrder}
            disabled={cart.length === 0 || processing}
            className="w-full bg-primary text-white py-3 rounded-xl font-bold text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">check</span>
            {processing ? "Traitement..." : "Valider la vente"}
          </button>
        </div>
      </div>
    </div>
  );
}
