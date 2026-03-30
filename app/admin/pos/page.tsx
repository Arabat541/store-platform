"use client";

import { useEffect, useRef, useState } from "react";
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

interface SaleData {
  saleNumber: string;
  total: number;
  subtotal: number;
  paymentMethod: string;
  customerName: string | null;
  customerPhone: string | null;
  createdAt: string;
  items: { quantity: number; price: number; total: number; product: { name: string } }[];
}

interface StoreSettings {
  store_name?: string;
  contact_phone?: string;
  contact_address?: string;
  contact_email?: string;
  contact_whatsapp?: string;
}

export default function AdminPOSPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [processing, setProcessing] = useState(false);
  const [receipt, setReceipt] = useState<SaleData | null>(null);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>({});
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/products?limit=500")
      .then((r) => r.json())
      .then((d) => setProducts(d.products || []));
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => setStoreSettings(d));
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

    const res = await fetch("/api/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: customerName || null,
        customerPhone: customerPhone || null,
        items: cart.map((i) => ({
          productId: i.product.id,
          quantity: i.quantity,
        })),
        paymentMethod,
        notes: "Vente en boutique (POS)",
      }),
    });

    if (res.ok) {
      const sale = await res.json();
      setReceipt({
        saleNumber: sale.saleNumber,
        total: Number(sale.total),
        subtotal: Number(sale.subtotal),
        paymentMethod: sale.paymentMethod,
        customerName: sale.customerName,
        customerPhone: sale.customerPhone,
        createdAt: sale.createdAt,
        items: sale.items.map((i: { quantity: number; price: string | number; total: string | number; product: { name: string } }) => ({
          quantity: i.quantity,
          price: Number(i.price),
          total: Number(i.total),
          product: i.product,
        })),
      });
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

  function printReceipt() {
    if (!receiptRef.current) return;
    const printWindow = window.open("", "_blank", "width=350,height=600");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Reçu</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Courier New', monospace; font-size: 12px; padding: 10px; width: 300px; }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .line { border-top: 1px dashed #000; margin: 8px 0; }
            .row { display: flex; justify-content: space-between; margin: 2px 0; }
            .item-name { margin-bottom: 1px; }
            h1 { font-size: 16px; margin-bottom: 4px; }
            h2 { font-size: 13px; margin-bottom: 2px; }
            .total-row { font-size: 14px; font-weight: bold; }
            @media print { body { width: 100%; } }
          </style>
        </head>
        <body>${receiptRef.current.innerHTML}</body>
        <script>window.onload=function(){window.print();window.onafterprint=function(){window.close();}}<\/script>
      </html>
    `);
    printWindow.document.close();
  }

  function newSale() {
    setReceipt(null);
  }

  const paymentLabels: Record<string, string> = {
    cash: "Espèces",
    mobile_money: "Mobile Money",
    card: "Carte bancaire",
  };

  if (receipt) {
    const receiptDate = new Date(receipt.createdAt);
    const storeName = storeSettings.store_name || "La Lumière Soit";

    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-lg w-full">
          {/* Printable receipt content (hidden visually, used for printing) */}
          <div ref={receiptRef} className="hidden">
            <div className="center">
              <h1>{storeName}</h1>
              {storeSettings.contact_address && <p>{storeSettings.contact_address}</p>}
              {storeSettings.contact_phone && <p>Tél: {storeSettings.contact_phone}</p>}
            </div>
            <div className="line"></div>
            <div className="row"><span>Reçu N°:</span><span className="bold">{receipt.saleNumber}</span></div>
            <div className="row"><span>Date:</span><span>{receiptDate.toLocaleDateString("fr-FR")} {receiptDate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span></div>
            {receipt.customerName && (
              <div className="row"><span>Client:</span><span>{receipt.customerName}</span></div>
            )}
            {receipt.customerPhone && <div className="row"><span>Tél:</span><span>{receipt.customerPhone}</span></div>}
            <div className="row"><span>Paiement:</span><span>{paymentLabels[receipt.paymentMethod] || receipt.paymentMethod}</span></div>
            <div className="line"></div>
            {receipt.items.map((item, idx) => (
              <div key={idx}>
                <div className="item-name bold">{item.product.name}</div>
                <div className="row"><span>{item.quantity} x {formatCurrency(item.price)}</span><span>{formatCurrency(item.total)}</span></div>
              </div>
            ))}
            <div className="line"></div>
            <div className="row"><span>Sous-total:</span><span>{formatCurrency(receipt.subtotal)}</span></div>
            <div className="line"></div>
            <div className="row total-row"><span>TOTAL:</span><span>{formatCurrency(receipt.total)}</span></div>
            <div className="line"></div>
            <div className="center" style={{ marginTop: "8px" }}>
              <p>Merci pour votre achat !</p>
              {storeSettings.contact_whatsapp && <p>WhatsApp: {storeSettings.contact_whatsapp}</p>}
            </div>
          </div>

          {/* On-screen receipt preview */}
          <div className="text-center mb-6">
            <span className="material-symbols-outlined text-6xl text-green-500 mb-2 block">check_circle</span>
            <h2 className="text-2xl font-bold text-slate-900">Vente enregistrée !</h2>
            <p className="text-slate-500">Vente #{receipt.saleNumber}</p>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 mb-4 space-y-2 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Date</span>
              <span>{receiptDate.toLocaleDateString("fr-FR")} à {receiptDate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
            {receipt.customerName && (
              <div className="flex justify-between text-slate-600">
                <span>Client</span>
                <span>{receipt.customerName}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>Paiement</span>
              <span>{paymentLabels[receipt.paymentMethod] || receipt.paymentMethod}</span>
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden mb-4">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-3 py-2 text-slate-500 font-medium">Article</th>
                  <th className="text-center px-3 py-2 text-slate-500 font-medium">Qté</th>
                  <th className="text-right px-3 py-2 text-slate-500 font-medium">Prix</th>
                  <th className="text-right px-3 py-2 text-slate-500 font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {receipt.items.map((item, idx) => (
                  <tr key={idx} className="border-t border-slate-100">
                    <td className="px-3 py-2 text-slate-900">{item.product.name}</td>
                    <td className="px-3 py-2 text-center text-slate-600">{item.quantity}</td>
                    <td className="px-3 py-2 text-right text-slate-600">{formatCurrency(item.price)}</td>
                    <td className="px-3 py-2 text-right font-medium text-slate-900">{formatCurrency(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-primary/5 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-slate-900">Total</span>
              <span className="text-2xl font-black text-primary">{formatCurrency(receipt.total)}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={printReceipt}
              className="flex-1 bg-slate-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">print</span>
              Imprimer le reçu
            </button>
            <button
              onClick={newSale}
              className="flex-1 bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">add_shopping_cart</span>
              Nouvelle vente
            </button>
          </div>
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
