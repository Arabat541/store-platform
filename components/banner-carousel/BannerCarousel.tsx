"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface Banner {
  id: number;
  title: string;
  subtitle: string | null;
  image: string;
  link: string | null;
}

export default function BannerCarousel({ banners }: { banners: Banner[] }) {
  const [current, setCurrent] = useState(0);
  const total = banners.length;

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % total);
  }, [total]);

  const prev = () => {
    setCurrent((c) => (c - 1 + total) % total);
  };

  useEffect(() => {
    if (total <= 1) return;
    const interval = setInterval(next, 5000);
    return () => clearInterval(interval);
  }, [next, total]);

  if (total === 0) return null;

  const banner = banners[current];

  const Wrapper = banner.link
    ? ({ children, className }: { children: React.ReactNode; className: string }) => (
        <Link href={banner.link!} className={className}>{children}</Link>
      )
    : ({ children, className }: { children: React.ReactNode; className: string }) => (
        <div className={className}>{children}</div>
      );

  return (
    <section className="relative rounded-2xl overflow-hidden group">
      <Wrapper className="block relative h-48 sm:h-64 md:h-80">
        <img
          src={banner.image}
          alt={banner.title}
          className="w-full h-full object-cover transition-opacity duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <h3 className="text-white text-xl md:text-3xl font-bold drop-shadow-lg">
            {banner.title}
          </h3>
          {banner.subtitle && (
            <p className="text-white/80 text-sm md:text-base mt-1 drop-shadow">{banner.subtitle}</p>
          )}
          {banner.link && (
            <span className="inline-flex items-center gap-1 mt-3 text-sm text-primary font-semibold bg-white/90 px-4 py-2 rounded-lg backdrop-blur-sm">
              Voir l&apos;offre
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </span>
          )}
        </div>
      </Wrapper>

      {/* Navigation arrows */}
      {total > 1 && (
        <>
          <button
            onClick={(e) => { e.preventDefault(); prev(); }}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <span className="material-symbols-outlined text-lg text-slate-800">chevron_left</span>
          </button>
          <button
            onClick={(e) => { e.preventDefault(); next(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <span className="material-symbols-outlined text-lg text-slate-800">chevron_right</span>
          </button>
        </>
      )}

      {/* Dots indicator */}
      {total > 1 && (
        <div className="absolute bottom-3 right-6 flex gap-1.5">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === current ? "bg-white w-6" : "bg-white/50 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
