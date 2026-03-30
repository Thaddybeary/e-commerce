"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingCart,
  ChevronLeft,
  Plus,
  Minus,
  Loader2,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/star-rating";
import { useCart } from "@/context/cart-context";
import { useAuth } from "@/context/auth-context";
import { productsAPI, type Product } from "@/lib/api";

export default function ProductDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { addItem, items } = useCart();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState<"description" | "reviews">(
    "description"
  );
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [addedFeedback, setAddedFeedback] = useState(false);

  useEffect(() => {
    productsAPI
      .getById(id)
      .then((res) => setProduct(res.data))
      .catch(() => router.push("/products"))
      .finally(() => setLoading(false));
  }, [id, router]);

  const cartItem = items.find((i) => i.productId === id);
  const cartQty = cartItem?.quantity ?? 0;

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      productId: product._id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      image: product.images?.[0] ?? null,
      stock: product.stock,
      quantity: qty,
    });
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 2000);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }
    setSubmittingReview(true);
    setReviewError("");
    try {
      await productsAPI.addReview(id, {
        rating: reviewRating,
        comment: reviewComment,
      });
      const res = await productsAPI.getById(id);
      setProduct(res.data);
      setReviewComment("");
      setReviewRating(5);
    } catch (err: unknown) {
      setReviewError(
        err instanceof Error ? err.message : "Failed to submit review"
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back link */}
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
      >
        <ChevronLeft className="h-4 w-4" /> Back
      </button>

      {/* ── Product main ───────────────────────────────────────────────────── */}
      <div className="grid gap-10 lg:grid-cols-2">
        {/* Images */}
        <div className="flex flex-col gap-3">
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-secondary">
            {product.images?.[activeImage] ? (
              <Image
                src={product.images[activeImage]}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-7xl">
                🏋️
              </div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  className={`relative h-16 w-16 overflow-hidden rounded-lg border-2 transition-colors ${
                    activeImage === i
                      ? "border-primary"
                      : "border-transparent hover:border-border"
                  }`}
                  onClick={() => setActiveImage(i)}
                >
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-5">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-primary">
              {product.brand}
            </p>
            <h1 className="mt-1 text-3xl font-black tracking-tight leading-tight">
              {product.name}
            </h1>
            {(product.flavour || product.weight) && (
              <p className="mt-1 text-sm text-muted-foreground">
                {[product.flavour, product.weight, product.servings ? `${product.servings} servings` : ""].filter(Boolean).join(" · ")}
              </p>
            )}
          </div>

          {/* Rating */}
          {product.numReviews > 0 && (
            <div className="flex items-center gap-2">
              <StarRating
                rating={product.rating}
                size="md"
                showValue
                count={product.numReviews}
              />
            </div>
          )}

          {/* Price */}
          <div className="flex items-end gap-3">
            <span className="text-4xl font-black">
              £{product.price.toFixed(2)}
            </span>
            {product.stock > 0 ? (
              <span className="mb-1 rounded-full bg-green-500/15 px-2 py-0.5 text-xs font-semibold text-green-400">
                In Stock ({product.stock})
              </span>
            ) : (
              <span className="mb-1 rounded-full bg-destructive/15 px-2 py-0.5 text-xs font-semibold text-destructive">
                Out of Stock
              </span>
            )}
          </div>

          {/* Tags */}
          {product.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {product.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border bg-secondary px-2 py-0.5 text-xs text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Quantity + Add to cart */}
          {product.stock > 0 && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 rounded-lg border border-border">
                <button
                  className="flex h-10 w-10 items-center justify-center rounded-l-lg hover:bg-accent disabled:opacity-50"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={qty <= 1}
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-10 text-center text-sm font-semibold">
                  {qty}
                </span>
                <button
                  className="flex h-10 w-10 items-center justify-center rounded-r-lg hover:bg-accent disabled:opacity-50"
                  onClick={() =>
                    setQty((q) => Math.min(product.stock - cartQty, q + 1))
                  }
                  disabled={qty >= product.stock - cartQty}
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
              <Button
                size="lg"
                className="flex-1 gap-2 font-bold"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="h-4 w-4" />
                {addedFeedback ? "Added to Cart! ✓" : "Add to Cart"}
              </Button>
            </div>
          )}

          {cartQty > 0 && (
            <p className="text-sm text-muted-foreground">
              {cartQty} already in cart.{" "}
              <Link href="/cart" className="text-primary hover:underline">
                View cart
              </Link>
            </p>
          )}

          {/* Perks */}
          <div className="rounded-xl border border-border bg-card p-4 space-y-2 text-sm text-muted-foreground">
            <p>🚚 Free shipping on orders over £50</p>
            <p>🔄 30-day hassle-free returns</p>
            <p>✅ Authenticity guaranteed</p>
          </div>
        </div>
      </div>

      {/* ── Tabs: Description / Reviews ─────────────────────────────────────── */}
      <div className="mt-12">
        <div className="flex gap-6 border-b border-border">
          {(["description", "reviews"] as const).map((tab) => (
            <button
              key={tab}
              className={`pb-3 text-sm font-semibold capitalize transition-colors ${
                activeTab === tab
                  ? "border-b-2 border-primary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
              {tab === "reviews" && ` (${product.numReviews})`}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {activeTab === "description" ? (
            <div className="prose prose-invert max-w-none">
              <p className="leading-relaxed text-muted-foreground">
                {product.description}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Write review */}
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="mb-4 font-semibold">Write a Review</h3>
                {!isAuthenticated ? (
                  <p className="text-sm text-muted-foreground">
                    <Link
                      href="/auth/login"
                      className="text-primary hover:underline"
                    >
                      Sign in
                    </Link>{" "}
                    to leave a review.
                  </p>
                ) : (
                  <form onSubmit={handleSubmitReview} className="space-y-4">
                    {reviewError && (
                      <p className="text-sm text-destructive">{reviewError}</p>
                    )}
                    <div>
                      <p className="mb-1 text-sm font-medium">Rating</p>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => setReviewRating(n)}
                            className="text-2xl transition-transform hover:scale-110"
                            style={{
                              color:
                                n <= reviewRating ? "#f97316" : "#3a3a3a",
                            }}
                          >
                            <Star
                              className="h-6 w-6"
                              fill={n <= reviewRating ? "#f97316" : "none"}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Share your experience with this product…"
                      rows={3}
                      className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm outline-none focus:border-primary resize-none"
                    />
                    <Button
                      type="submit"
                      size="sm"
                      disabled={submittingReview}
                    >
                      {submittingReview ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Submit Review"
                      )}
                    </Button>
                  </form>
                )}
              </div>

              {/* Existing reviews */}
              {product.reviews.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No reviews yet. Be the first!
                </p>
              ) : (
                product.reviews.map((r) => (
                  <div
                    key={r._id}
                    className="rounded-xl border border-border bg-card p-5"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-sm">{r.username}</p>
                        <StarRating rating={r.rating} size="sm" className="mt-0.5" />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {r.comment && (
                      <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                        {r.comment}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
