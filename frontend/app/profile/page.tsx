"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Package, ChevronRight, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"
import { ordersAPI, type Order } from "@/lib/api"

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500/15 text-yellow-400",
  processing: "bg-blue-500/15 text-blue-400",
  shipped: "bg-purple-500/15 text-purple-400",
  delivered: "bg-green-500/15 text-green-400",
  cancelled: "bg-red-500/15 text-red-400",
}

const PAYMENT_COLORS: Record<string, string> = {
  pending: "text-yellow-400",
  paid: "text-green-400",
  failed: "text-destructive",
  refunded: "text-muted-foreground",
}

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth()
  const router = useRouter()

  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login")
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated) {
      ordersAPI
        .getMyOrders()
        .then((res) => setOrders(res.data.orders))
        .catch(() => setOrders([]))
        .finally(() => setOrdersLoading(false))
    }
  }, [isAuthenticated])

  const handleCancel = async (orderId: string) => {
    setCancellingId(orderId)
    try {
      await ordersAPI.cancel(orderId, "Cancelled by customer")
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: "cancelled" } : o))
      )
      if (selectedOrder?._id === orderId) {
        setSelectedOrder((prev) =>
          prev ? { ...prev, status: "cancelled" } : null
        )
      }
    } catch {}
    setCancellingId(null)
  }

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  if (authLoading) {
    return (
      <div className="flex min-h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-black tracking-tight">My Account</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* ── Sidebar ──────────────────────────────────────────────────────── */}
        <aside>
          <div className="space-y-4 rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <hr className="border-border" />
            <div className="space-y-1">
              <button className="flex w-full items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-sm font-medium text-primary">
                <Package className="h-4 w-4" /> My Orders
              </button>
            </div>
            <hr className="border-border" />
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-destructive"
            >
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
          </div>
        </aside>

        {/* ── Orders ───────────────────────────────────────────────────────── */}
        <div className="lg:col-span-2">
          {selectedOrder ? (
            /* Order detail */
            <div className="space-y-5 rounded-xl border border-border bg-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-bold">Order Detail</h2>
                  <p className="font-mono text-sm text-primary">
                    {selectedOrder.orderNumber}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  ← Back
                </button>
              </div>

              {/* Status badges */}
              <div className="flex flex-wrap gap-2">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS_COLORS[selectedOrder.status] ?? ""}`}
                >
                  {selectedOrder.status}
                </span>
                <span
                  className={`text-xs font-semibold capitalize ${PAYMENT_COLORS[selectedOrder.paymentStatus] ?? ""}`}
                >
                  Payment: {selectedOrder.paymentStatus}
                </span>
              </div>

              {/* Items */}
              <div className="space-y-3">
                {selectedOrder.items.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.brand} · ×{item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-semibold">
                      £{item.subtotal.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-2 rounded-lg bg-secondary p-4 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>£{selectedOrder.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span>
                    {selectedOrder.shippingCost === 0 ? (
                      <span className="text-green-400">Free</span>
                    ) : (
                      `£${selectedOrder.shippingCost.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>VAT</span>
                  <span>£{selectedOrder.tax.toFixed(2)}</span>
                </div>
                <hr className="border-border" />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>£{selectedOrder.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Shipping address */}
              <div>
                <h3 className="mb-2 text-sm font-semibold">Shipping To</h3>
                <div className="space-y-0.5 text-sm text-muted-foreground">
                  <p>{selectedOrder.shippingAddress.fullName}</p>
                  <p>{selectedOrder.shippingAddress.street}</p>
                  <p>
                    {selectedOrder.shippingAddress.city},{" "}
                    {selectedOrder.shippingAddress.postalCode}
                  </p>
                  <p>{selectedOrder.shippingAddress.country}</p>
                </div>
              </div>

              {selectedOrder.trackingNumber && (
                <p className="text-sm">
                  Tracking:{" "}
                  <span className="font-mono text-primary">
                    {selectedOrder.trackingNumber}
                  </span>
                </p>
              )}

              {["pending", "processing"].includes(selectedOrder.status) && (
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={cancellingId === selectedOrder._id}
                  onClick={() => handleCancel(selectedOrder._id)}
                >
                  {cancellingId === selectedOrder._id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Cancel Order"
                  )}
                </Button>
              )}
            </div>
          ) : (
            /* Orders list */
            <div className="rounded-xl border border-border bg-card">
              <div className="border-b border-border px-5 py-4">
                <h2 className="font-bold">Order History</h2>
              </div>

              {ordersLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Package className="h-12 w-12 text-muted-foreground opacity-30" />
                  <p className="mt-3 font-semibold">No orders yet</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Your orders will appear here after you shop.
                  </p>
                  <Button
                    className="mt-4"
                    size="sm"
                    onClick={() => router.push("/products")}
                  >
                    Start Shopping
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {orders.map((order) => (
                    <button
                      key={order._id}
                      className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-accent/50"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-mono text-sm font-semibold text-primary">
                            {order.orderNumber}
                          </p>
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${STATUS_COLORS[order.status] ?? ""}`}
                          >
                            {order.status}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString(
                            "en-GB",
                            { day: "numeric", month: "short", year: "numeric" }
                          )}{" "}
                          · {order.items.length} item
                          {order.items.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold">
                          £{order.totalAmount.toFixed(2)}
                        </p>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
