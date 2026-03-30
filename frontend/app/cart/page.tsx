"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart-context";

export default function CartPage() {
  const { items, totalItems, totalPrice, updateQuantity, removeItem, clearCart } =
    useCart();

  const shipping = totalPrice >= 50 ? 0 : 4.99;
  const tax = Math.round(totalPrice * 0.2 * 100) / 100;
  const orderTotal = Math.round((totalPrice + shipping + tax) * 100) / 100;

  if (items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <ShoppingBag className="h-16 w-16 text-muted-foreground opacity-40" />
        <h2 className="mt-4 text-2xl font-black tracking-tight">
          Your cart is empty
        </h2>
        <p className="mt-2 text-muted-foreground">
          Add some products to get started!
        </p>
        <Link href="/products" className="mt-6">
          <Button size="lg" className="gap-2 font-bold">
            Shop Now <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-black tracking-tight">
          Cart ({totalItems})
        </h1>
        <button
          onClick={clearCart}
          className="text-sm text-muted-foreground hover:text-destructive"
        >
          Clear all
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* ── Cart items ──────────────────────────────────────────────────── */}
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => (
            <div
              key={item.productId}
              className="flex gap-4 rounded-xl border border-border bg-card p-4"
            >
              {/* Image */}
              <Link
                href={`/products/${item.productId}`}
                className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-secondary"
              >
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-2xl">
                    🏋️
                  </div>
                )}
              </Link>

              {/* Details */}
              <div className="flex flex-1 min-w-0 flex-col justify-between">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                      {item.brand}
                    </p>
                    <Link
                      href={`/products/${item.productId}`}
                      className="mt-0.5 block font-semibold leading-tight hover:text-primary truncate"
                    >
                      {item.name}
                    </Link>
                  </div>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="flex-shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  {/* Qty controls */}
                  <div className="flex items-center gap-1 rounded-lg border border-border">
                    <button
                      className="flex h-8 w-8 items-center justify-center rounded-l-lg hover:bg-accent disabled:opacity-50"
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity - 1)
                      }
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold">
                      {item.quantity}
                    </span>
                    <button
                      className="flex h-8 w-8 items-center justify-center rounded-r-lg hover:bg-accent disabled:opacity-50"
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity + 1)
                      }
                      disabled={item.quantity >= item.stock}
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <p className="font-bold">
                    £{(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Order summary ───────────────────────────────────────────────── */}
        <div>
          <div className="sticky top-20 rounded-xl border border-border bg-card p-6 space-y-4">
            <h2 className="text-lg font-black tracking-tight">Order Summary</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>£{totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>
                  {shipping === 0 ? (
                    <span className="text-green-400">Free</span>
                  ) : (
                    `£${shipping.toFixed(2)}`
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">VAT (20%)</span>
                <span>£{tax.toFixed(2)}</span>
              </div>
              <hr className="border-border" />
              <div className="flex justify-between text-base font-bold">
                <span>Total</span>
                <span>£{orderTotal.toFixed(2)}</span>
              </div>
            </div>

            {shipping > 0 && (
              <p className="rounded-lg bg-secondary px-3 py-2 text-xs text-muted-foreground">
                Add{" "}
                <span className="font-semibold text-primary">
                  £{(50 - totalPrice).toFixed(2)}
                </span>{" "}
                more for free shipping!
              </p>
            )}

            <Link href="/checkout">
              <Button className="w-full gap-2 font-bold" size="lg">
                Checkout <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>

            <Link href="/products">
              <Button variant="ghost" className="w-full text-muted-foreground">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
