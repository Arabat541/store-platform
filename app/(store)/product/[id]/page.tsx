"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/lib/store/cart";
import { formatCurrency } from "@/lib/utils";

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  comparePrice: number | null;
  images: string[];
  stock: number;
  brand: string | null;
  category: { id: number; name: string; slug: string } | null;
}

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    fetch(`/api/products/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        setProduct({
          ...data,
          price: Number(data.price),
          comparePrice: data.comparePrice ? Number(data.comparePrice) : null,
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || "/icons/placeholder.svg",
      stock: product.stock,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-16 text-center">
        <div className="animate-pulse">
          <div className="h-96 bg-slate-100 rounded-xl mb-8" />
          <div className="h-8 bg-slate-100 rounded w-1/2 mx-auto mb-4" />
          <div className="h-4 bg-slate-100 rounded w-1/3 mx-auto" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-16 text-center">
        <span className="material-symbols-outlined text-5xl text-slate-300 mb-4 block">error</span>
        <h1 className="text-2xl font-bold text-slate-900">Produit introuvable</h1>
      </div>
    );
  }

  const images = product.images?.length ? product.images : ["/icons/placeholder.svg"];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 mb-8 text-sm font-medium">
        <Link href="/" className="text-slate-500 hover:text-primary transition-colors">Accueil</Link>
        <span className="material-symbols-outlined text-xs text-slate-400">chevron_right</span>
        <Link href="/products" className="text-slate-500 hover:text-primary transition-colors">Produits</Link>
        {product.category && (
          <>
            <span className="material-symbols-outlined text-xs text-slate-400">chevron_right</span>
            <Link href={`/products?category=${product.category.slug}`} className="text-slate-500 hover:text-primary transition-colors">
              {product.category.name}
            </Link>
          </>
        )}
        <span className="material-symbols-outlined text-xs text-slate-400">chevron_right</span>
        <span className="text-slate-900">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Images */}
        <div className="space-y-4">
          <div className="aspect-[4/3] w-full rounded-xl bg-slate-100 overflow-hidden border border-slate-200">
            <Image
              src={images[selectedImage]}
              alt={product.name}
              width={800}
              height={600}
              className="w-full h-full object-cover"
              priority
            />
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                    idx === selectedImage
                      ? "border-primary"
                      : "border-slate-200 hover:border-primary/50"
                  }`}
                >
                  <Image src={img} alt="" width={100} height={100} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          {product.category && (
            <span className="inline-flex items-center gap-1.5 text-sm text-primary font-semibold uppercase tracking-wider">
              <span className="material-symbols-outlined text-base">category</span>
              {product.category.name}
            </span>
          )}
          <h1 className="text-3xl font-bold text-slate-900 mt-2">
            {product.name}
          </h1>
          {product.brand && (
            <p className="text-sm text-slate-500 mt-1 font-medium">par {product.brand}</p>
          )}

          <div className="mt-6 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-primary">
              {formatCurrency(product.price)}
            </span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-lg text-slate-400 line-through">
                {formatCurrency(product.comparePrice)}
              </span>
            )}
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-sm font-bold text-green-600 bg-green-50 px-2.5 py-0.5 rounded-full">
                -{Math.round((1 - product.price / product.comparePrice) * 100)}%
              </span>
            )}
          </div>

          {/* Stock */}
          <div className="mt-4">
            {product.stock > 0 ? (
              <span className="inline-flex items-center gap-1.5 text-sm text-green-600 font-medium">
                <span className="material-symbols-outlined text-lg">check_circle</span>
                En stock ({product.stock} disponibles)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-sm text-red-600 font-medium">
                <span className="material-symbols-outlined text-lg">cancel</span>
                Rupture de stock
              </span>
            )}
          </div>

          {/* Ajouter au panier */}
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="mt-6 w-full flex items-center justify-center gap-2 bg-primary text-white py-3.5 px-6 rounded-xl font-semibold hover:bg-primary/90 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed shadow-lg shadow-primary/20 transition-all"
          >
            {added ? (
              <>
                <span className="material-symbols-outlined text-xl">check</span>
                Ajouté au panier
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-xl">shopping_cart</span>
                Ajouter au panier
              </>
            )}
          </button>

          {/* Quick Actions */}
          <div className="mt-4 flex gap-3">
            <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:border-primary/30 hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-lg">favorite</span>
              Favoris
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:border-primary/30 hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-lg">share</span>
              Share
            </button>
          </div>

          {/* Description */}
          {product.description && (
            <div className="mt-8 pt-8 border-t border-slate-200">
              <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">description</span>
                Description
              </h2>
              <div className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                {product.description}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
