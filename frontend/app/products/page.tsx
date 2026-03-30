"use client"

import { useEffect, useState, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Search, SlidersHorizontal, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/product-card"
import { productsAPI, type Product } from "@/lib/api"

const CATEGORIES = [
  "Protein Powder",
  "Pre-Workout",
  "Creatine",
  "Vitamins & Supplements",
  "Weight Gainers",
  "Fat Burners",
  "Amino Acids",
  "Bars & Snacks",
  "Apparel & Accessories",
  "Equipment",
]

const SORT_OPTIONS = [
  { label: "Newest", value: "-createdAt" },
  { label: "Price: Low to High", value: "price" },
  { label: "Price: High to Low", value: "-price" },
  { label: "Best Rated", value: "-rating" },
]

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [totalProducts, setTotalProducts] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filtersOpen, setFiltersOpen] = useState(false)

  // Filter state
  const [search, setSearch] = useState(searchParams.get("search") ?? "")
  const [category, setCategory] = useState(searchParams.get("category") ?? "")
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") ?? "")
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "")
  const [sort, setSort] = useState(searchParams.get("sort") ?? "-createdAt")
  const [featured, setFeatured] = useState(searchParams.get("featured") ?? "")

  const fetchProducts = useCallback(
    async (page = 1) => {
      setLoading(true)
      const params: Record<string, string> = {
        page: String(page),
        limit: "12",
        sort,
      }
      if (search) params.search = search
      if (category) params.category = category
      if (minPrice) params.minPrice = minPrice
      if (maxPrice) params.maxPrice = maxPrice
      if (featured) params.featured = featured

      try {
        const res = await productsAPI.getAll(params)
        setProducts(res.data.products)
        setTotalProducts(res.data.pagination.totalProducts)
        setTotalPages(res.data.pagination.total)
        setCurrentPage(page)
      } catch {
        setProducts([])
      } finally {
        setLoading(false)
      }
    },
    [search, category, minPrice, maxPrice, sort, featured]
  )

  useEffect(() => {
    fetchProducts(1)
  }, [fetchProducts])

  const clearFilters = () => {
    setSearch("")
    setCategory("")
    setMinPrice("")
    setMaxPrice("")
    setFeatured("")
    setSort("-createdAt")
    router.push("/products")
  }

  const hasFilters = search || category || minPrice || maxPrice || featured

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">
            {category || "All Products"}
          </h1>
          {!loading && (
            <p className="mt-1 text-sm text-muted-foreground">
              {totalProducts} product{totalProducts !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        <button
          className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium lg:hidden"
          onClick={() => setFiltersOpen((v) => !v)}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </button>
      </div>

      <div className="flex gap-6">
        {/* ── Sidebar filters ─────────────────────────────────────────────── */}
        <aside
          className={`${
            filtersOpen ? "block" : "hidden"
          } w-56 flex-shrink-0 lg:block`}
        >
          <div className="sticky top-20 space-y-6 rounded-xl border border-border bg-card p-5">
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
              >
                <X className="h-3 w-3" /> Clear all filters
              </button>
            )}

            {/* Category */}
            <div>
              <p className="mb-2 text-xs font-bold tracking-widest text-muted-foreground uppercase">
                Category
              </p>
              <div className="space-y-1">
                <button
                  className={`block w-full rounded-lg px-3 py-1.5 text-left text-sm transition-colors ${
                    !category
                      ? "bg-primary font-semibold text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                  onClick={() => setCategory("")}
                >
                  All
                </button>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    className={`block w-full rounded-lg px-3 py-1.5 text-left text-sm transition-colors ${
                      category === cat
                        ? "bg-primary font-semibold text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}
                    onClick={() => setCategory(cat === category ? "" : cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Price range */}
            <div>
              <p className="mb-2 text-xs font-bold tracking-widest text-muted-foreground uppercase">
                Price (£)
              </p>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full rounded-lg border border-border bg-secondary px-2 py-1.5 text-sm outline-none focus:border-primary"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full rounded-lg border border-border bg-secondary px-2 py-1.5 text-sm outline-none focus:border-primary"
                />
              </div>
            </div>

            {/* Best sellers toggle */}
            <div>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  className="accent-primary"
                  checked={featured === "true"}
                  onChange={(e) => setFeatured(e.target.checked ? "true" : "")}
                />
                <span className="text-sm font-medium">Best Sellers only</span>
              </label>
            </div>
          </div>
        </aside>

        {/* ── Main content ─────────────────────────────────────────────────── */}
        <div className="min-w-0 flex-1">
          {/* Search + Sort bar */}
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products…"
                className="w-full rounded-lg border border-border bg-card py-2.5 pr-4 pl-9 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {/* Products grid */}
          {loading ? (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[3/4] animate-pulse rounded-xl bg-card"
                />
              ))}
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => fetchProducts(currentPage - 1)}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => fetchProducts(currentPage + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-24 text-center">
              <span className="text-5xl">🔍</span>
              <p className="mt-4 font-semibold">No products found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try adjusting your search or filters
              </p>
              <Button
                variant="ghost"
                className="mt-4 text-primary"
                onClick={clearFilters}
              >
                Clear filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
