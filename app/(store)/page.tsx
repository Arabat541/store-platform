import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/product-card/ProductCard";

export const dynamic = "force-dynamic";

const categoryIcons: Record<string, string> = {
  smartphones: "smartphone",
  computers: "laptop_mac",
  accessories: "headphones",
  electronics: "tv",
};

async function getFeaturedProducts() {
  const products = await prisma.product.findMany({
    where: { active: true, featured: true },
    include: { category: { select: { id: true, name: true, slug: true } } },
    take: 8,
    orderBy: { createdAt: "desc" },
  });
  return products;
}

async function getCategories() {
  return prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });
}

export default async function HomePage() {
  const [products, categories] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
  ]);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden min-h-[480px] flex items-center bg-gradient-to-r from-background-dark via-background-dark/80 to-primary/20">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-background-dark via-background-dark/60 to-transparent z-10" />
        </div>
        <div className="relative z-20 px-8 md:px-16 max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 bg-primary/20 border border-primary/30 backdrop-blur-md px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-primary text-xs font-bold uppercase tracking-wider">Nouveauté 2024</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-white leading-tight">
            La Tech Nouvelle <br />
            <span className="text-primary">Est Déjà Là.</span>
          </h2>
          <p className="text-slate-300 text-lg leading-relaxed">
            Découvrez notre collection ultime de gadgets haute performance et d'électronique premium à des prix imbattables.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <Link
              href="/products"
              className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl shadow-primary/30 transition-transform active:scale-95"
            >
              Acheter maintenant
            </Link>
            <Link
              href="/contact"
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/30 px-8 py-4 rounded-xl font-bold text-lg transition-all"
            >
              Voir les offres
            </Link>
          </div>
        </div>
      </section>

      {/* Category Grid */}
      {categories.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold tracking-tight">Acheter par catégorie</h3>
            <Link className="text-primary font-semibold flex items-center gap-1 hover:underline" href="/products">
              Tout voir <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((cat: { id: number; slug: string; name: string; _count: { products: number } }) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="group cursor-pointer"
              >
                <div className="aspect-square bg-primary/5 rounded-2xl overflow-hidden mb-4 relative flex items-center justify-center">
                  <span className="material-symbols-outlined text-6xl text-primary/40 group-hover:text-primary/60 group-hover:scale-110 transition-all duration-500">
                    {categoryIcons[cat.slug] || "category"}
                  </span>
                  <div className="absolute inset-0 bg-primary/10 group-hover:bg-transparent transition-colors" />
                </div>
                <p className="font-bold text-lg group-hover:text-primary transition-colors">{cat.name}</p>
                <p className="text-sm text-slate-500">{cat._count.products}+ Produits</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Produits en vedette */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-bold tracking-tight">Produits en vedette</h3>
        </div>
        {products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate-500 text-lg">Aucun produit en vedette pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product: { id: number; name: string; slug: string; price: unknown; comparePrice: unknown; images: unknown; stock: number; brand: string | null; category: { name: string; slug: string } | null }) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                slug={product.slug}
                price={Number(product.price)}
                comparePrice={product.comparePrice ? Number(product.comparePrice) : null}
                images={product.images as string[]}
                stock={product.stock}
                category={product.category}
                brand={product.brand}
              />
            ))}
          </div>
        )}
      </section>

      {/* Newsletter Section */}
      <section className="bg-primary/5 rounded-3xl p-8 md:p-12 border border-primary/10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-md space-y-4 text-center md:text-left">
            <h3 className="text-3xl font-bold tracking-tight">Restez informé</h3>
            <p className="text-slate-500">
              Abonnez-vous pour recevoir en exclusivité les nouveaux produits, conseils tech et remises réservées aux membres.
            </p>
          </div>
          <div className="w-full max-w-md">
            <form className="flex flex-col sm:flex-row gap-3">
              <input
                className="flex-1 px-4 py-3 rounded-xl border-primary/20 bg-white focus:ring-2 focus:ring-primary transition-all"
                placeholder="Votre adresse email"
                type="email"
              />
              <button
                className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all"
                type="submit"
              >
                S'abonner
              </button>
            </form>
            <p className="text-[10px] text-slate-400 mt-3 text-center md:text-left">
              En vous abonnant, vous acceptez nos conditions d'utilisation et notre politique de confidentialité.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
