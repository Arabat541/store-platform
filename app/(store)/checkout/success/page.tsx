import Link from "next/link";

export default function CheckoutSuccessPage() {
  return (
    <div className="max-w-lg mx-auto px-6 py-20 text-center">
      <span className="material-symbols-outlined text-6xl text-green-500">check_circle</span>
      <h1 className="text-2xl font-bold text-slate-900 mt-6">
        Order Placed Successfully!
      </h1>
      <p className="text-slate-500 mt-3">
        Thank you for your order. We&apos;ll contact you with shipping details shortly.
      </p>
      <Link
        href="/products"
        className="inline-block mt-8 bg-primary text-white px-6 py-3.5 rounded-xl font-semibold hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all"
      >
        Continuer les achats
      </Link>
    </div>
  );
}
