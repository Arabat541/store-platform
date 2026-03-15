"use client";

import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/lib/store/cart";
import { formatCurrency } from "@/lib/utils";

interface ProductCardProps {
  id: number;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number | null;
  images: string[];
  stock: number;
  category?: { name: string; slug: string } | null;
  brand?: string | null;
}

export default function ProductCard({
  id,
  name,
  price,
  comparePrice,
  images,
  stock,
  category,
  brand,
}: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const image = images?.[0] || "/icons/placeholder.svg";
  const discount = comparePrice && comparePrice > price
    ? Math.round(((Number(comparePrice) - price) / Number(comparePrice)) * 100)
    : 0;

  return (
    <div className="bg-white border border-primary/5 rounded-2xl p-4 group hover:shadow-2xl transition-all duration-300 flex flex-col h-full">
      <Link href={`/product/${id}`} className="relative aspect-[4/3] rounded-xl overflow-hidden mb-4 block">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        {discount > 0 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase">
            Promo -{discount}%
          </span>
        )}
        {stock === 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-slate-900 text-sm font-medium px-4 py-2 rounded-full">
              Rupture de stock
            </span>
          </div>
        )}
        <button className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="material-symbols-outlined text-sm">favorite</span>
        </button>
      </Link>

      <div className="flex-1">
        {category && (
          <p className="text-slate-500 text-xs font-semibold mb-1 uppercase tracking-wider">
            {category.name}
          </p>
        )}
        <Link href={`/product/${id}`}>
          <h4 className="font-bold text-lg mb-1 leading-tight hover:text-primary transition-colors line-clamp-2">
            {name}
          </h4>
        </Link>
        {brand && <p className="text-xs text-slate-400 mb-2">{brand}</p>}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-primary font-bold text-xl">{formatCurrency(price)}</span>
          {comparePrice && comparePrice > price && (
            <span className="text-slate-400 text-sm line-through">
              {formatCurrency(Number(comparePrice))}
            </span>
          )}
        </div>
      </div>

      <button
        onClick={() => addItem({ id, name, price, image, stock })}
        disabled={stock === 0}
        className="w-full py-3 bg-primary/10 hover:bg-primary text-primary hover:text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
      >
        <span className="material-symbols-outlined text-xl">shopping_cart</span>
        Ajouter au panier
      </button>
    </div>
  );
}
