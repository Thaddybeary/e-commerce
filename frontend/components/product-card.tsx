"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/star-rating";
import { useCart } from "@/context/cart-context";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/api";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { addItem, items } = useCart();

  const inCart = items.some((i) => i.productId === product._id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      productId: product._id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      image: product.images?.[0] ?? null,
      stock: product.stock,
    });
  };

  return (
    <Link href={`/products/${product._id}`}>
      <div
        className={cn(
          "group relative flex flex-col rounded-xl border border-border bg-card overflow-hidden card-hover",
          className
        )}
      >
        {/* Image */}
        <div className="relative aspect-square w-full overflow-hidden bg-secondary">
          {product.images?.[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="text-5xl">🏋️</span>
            </div>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <span className="rounded-full bg-destructive px-3 py-1 text-xs font-semibold text-white">
                Out of Stock
              </span>
            </div>
          )}
          {product.isFeatured && (
            <div className="absolute top-2 left-2 rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">
              Featured
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-1 flex-col gap-2 p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wider text-primary">
                {product.brand}
              </p>
              <h3 className="mt-0.5 line-clamp-2 text-sm font-semibold leading-tight text-foreground">
                {product.name}
              </h3>
            </div>
          </div>

          {(product.flavour || product.weight) && (
            <p className="text-xs text-muted-foreground">
              {[product.flavour, product.weight].filter(Boolean).join(" · ")}
            </p>
          )}

          {product.numReviews > 0 && (
            <StarRating
              rating={product.rating}
              size="sm"
              showValue
              count={product.numReviews}
            />
          )}

          <div className="mt-auto flex items-center justify-between pt-2">
            <span className="text-lg font-bold text-foreground">
              £{product.price.toFixed(2)}
            </span>
            <Button
              size="sm"
              variant={inCart ? "secondary" : "default"}
              className="gap-1.5"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              {inCart ? "Added" : "Add"}
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}
