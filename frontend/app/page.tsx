"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Zap, Shield, Truck, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";
import { productsAPI, type Product } from "@/lib/api";

const categoryCards = [
  { name: "Protein Powder", emoji: "🥛", desc: "Whey, casein & plant protein", color: "from-orange-900/40 to-orange-950/20" },
  { name: "Pre-Workout", emoji: "⚡", desc: "Energy & focus boosters", color: "from-yellow-900/40 to-yellow-950/20" },
  { name: "Creatine", emoji: "💪", desc: "Strength & power gains", color: "from-red-900/40 to-red-950/20" },
  { name: "Vitamins & Supplements", emoji: "💊", desc: "Daily health essentials", color: "from-green-900/40 to-green-950/20" },
];

const perks = [
  { icon: Truck, title: "Free Shipping", desc: "On all orders over £50" },
  { icon: Shield, title: "100% Authentic", desc: "Genuine products only" },
  { icon: Zap, title: "Fast Dispatch", desc: "Same-day on orders before 3pm" },
  { icon: Star, title: "5★ Reviews", desc: "Trusted by 10,000+ athletes" },
];

export default function HomePage() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productsAPI
      .getFeatured()
      .then((res) => setFeatured(res.data.slice(0, 4)))
      .catch(() => setFeatured([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="hero-bg relative overflow-hidden py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-primary">
              Premium Supplements
            </p>
            <h1 className="text-5xl font-black leading-tight tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              FUEL YOUR
              <br />
              <span className="gradient-text">GAINS</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-lg">
              Science-backed nutrition for serious athletes. From protein powders
              to pre-workouts — everything you need to crush your goals.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/products">
                <Button size="lg" className="gap-2 text-base font-bold">
                  Shop Now <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/products?featured=true">
                <Button size="lg" variant="outline" className="text-base">
                  Best Sellers
                </Button>
              </Link>
            </div>
            <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
              <span className="text-primary">✓</span> Free shipping over £50 &nbsp;·&nbsp;
              <span className="text-primary">✓</span> 30-day returns
            </div>
          </div>
        </div>

        {/* Decorative glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 right-0 h-[600px] w-[600px] rounded-full opacity-10"
          style={{
            background:
              "radial-gradient(circle, oklch(0.702 0.193 47.5) 0%, transparent 70%)",
          }}
        />
      </section>

      {/* ── Perks bar ─────────────────────────────────────────────────────── */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 divide-x divide-border lg:grid-cols-4">
            {perks.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3 px-6 py-5">
                <Icon className="h-6 w-6 flex-shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-semibold">{title}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary">
              Browse
            </p>
            <h2 className="mt-1 text-3xl font-black tracking-tight">
              Shop by Category
            </h2>
          </div>
          <Link href="/products">
            <Button variant="ghost" className="gap-1 text-muted-foreground">
              View all <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {categoryCards.map((cat) => (
            <Link
              key={cat.name}
              href={`/products?category=${encodeURIComponent(cat.name)}`}
              className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${cat.color} border border-border p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10`}
            >
              <span className="block text-4xl mb-3">{cat.emoji}</span>
              <h3 className="font-bold text-foreground">{cat.name}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{cat.desc}</p>
              <ArrowRight className="absolute bottom-4 right-4 h-4 w-4 text-primary opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
          ))}
        </div>
      </section>

      {/* ── Featured Products ─────────────────────────────────────────────── */}
      <section className="border-t border-border bg-card/50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary">
                Top Picks
              </p>
              <h2 className="mt-1 text-3xl font-black tracking-tight">
                Featured Products
              </h2>
            </div>
            <Link href="/products?featured=true">
              <Button variant="ghost" className="gap-1 text-muted-foreground">
                See all <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square animate-pulse rounded-xl bg-secondary"
                />
              ))}
            </div>
          ) : featured.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {featured.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
              <span className="text-5xl">🏋️</span>
              <p className="mt-4 font-semibold text-foreground">
                Products coming soon!
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                We&apos;re stocking up. Check back shortly.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-primary px-8 py-12 text-center">
          <h2 className="text-3xl font-black tracking-tight text-primary-foreground sm:text-4xl">
            Ready to Level Up?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-primary-foreground/80">
            Join thousands of athletes who trust IronFuel to fuel their training.
            New products added weekly.
          </p>
          <Link href="/products" className="mt-6 inline-block">
            <Button
              size="lg"
              className="bg-primary-foreground text-primary font-bold hover:bg-primary-foreground/90"
            >
              Shop All Products
            </Button>
          </Link>
          {/* Decorative circles */}
          <div
            aria-hidden
            className="absolute -left-16 -top-16 h-64 w-64 rounded-full bg-white/5"
          />
          <div
            aria-hidden
            className="absolute -right-16 -bottom-16 h-64 w-64 rounded-full bg-white/5"
          />
        </div>
      </section>
    </div>
  );
}
