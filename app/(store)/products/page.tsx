import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/product-card/ProductCard";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: { category?: string; search?: string; page?: string };
}

export default async function ProductsPage({ searchParams }: Props) {
  const page = parseInt(searchParams.page || "1");
  const limit = 12;

  const where: Record<string, unknown> = { active: true };
  if (searchParams.category) {
    where.category = { slug: searchParams.category };
  }
  if (searchParams.search) {
    where.OR = [
      { name: { contains: searchParams.search } },
      { description: { contains: searchParams.search } },
      { brand: { contains: searchParams.search } },
    ];
  }

  const [products, total, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: { select: { id: true, name: true, slug: true } } },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: "asc" },
    }),
  ]);

  const pages = Math.ceil(total / limit);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="hidden w-64 shrink-0 flex-col gap-8 md:flex">
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-bold text-slate-900">Catégories</h3>
            <nav className="flex flex-col gap-1">
              <Link
                href="/products"
                className={`group flex items-center justify-between rounded-lg px-4 py-3 transition-colors ${
                  !searchParams.category
                    ? "bg-primary/10 text-primary"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[20px]">grid_view</span>
                  <span className="text-sm font-medium">Tous les produits</span>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  !searchParams.category ? "bg-primary text-white" : "opacity-60"
                }`}>{total}</span>
              </Link>
              {categories.map((cat: { id: number; slug: string; name: string; _count: { products: number } }) => (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.slug}`}
                  className={`group flex items-center justify-between rounded-lg px-4 py-3 transition-colors ${
                    searchParams.category === cat.slug
                      ? "bg-primary/10 text-primary"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[20px]">category</span>
                    <span className="text-sm font-medium">{cat.name}</span>
                  </div>
                  <span className={`text-xs font-semibold ${
                    searchParams.category === cat.slug ? "bg-primary text-white px-2 py-0.5 rounded-full" : "opacity-60"
                  }`}>{cat._count.products}</span>
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-slate-900">
              {searchParams.search
                ? `Résultats pour "${searchParams.search}"`
                : searchParams.category
                ? categories.find((c: { slug: string; name: string }) => c.slug === searchParams.category)?.name || "Products"
                : "Tous les produits"}
            </h1>
            <span className="text-sm text-slate-500 font-medium">{total} produits</span>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-primary/5">
              <span className="material-symbols-outlined text-5xl text-slate-300 mb-4 block">search_off</span>
              <p className="text-slate-500 text-lg font-medium">Aucun produit trouvé</p>
              <Link href="/products" className="text-primary text-sm mt-3 inline-flex items-center gap-1 hover:text-primary/80 font-medium transition-colors">
                <span className="material-symbols-outlined text-lg">arrow_back</span>
                Effacer les filtres
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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

              {/* Pagination */}
              {pages > 1 && (
                <div className="flex justify-center gap-2 mt-10">
                  {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                    <Link
                      key={p}
                      href={`/products?${new URLSearchParams({
                        ...(searchParams.category ? { category: searchParams.category } : {}),
                        ...(searchParams.search ? { search: searchParams.search } : {}),
                        page: String(p),
                      }).toString()}`}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                        p === page
                          ? "bg-primary text-white shadow-lg shadow-primary/20"
                          : "bg-white border border-slate-200 text-slate-700 hover:border-primary/30 hover:text-primary"
                      }`}
                    >
                      {p}
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
