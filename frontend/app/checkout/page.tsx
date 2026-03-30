"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Loader2, CheckCircle, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/context/cart-context"
import { useAuth } from "@/context/auth-context"
import { cartAPI, ordersAPI, type ShippingAddress } from "@/lib/api"

type PaymentMethod = "card" | "paypal" | "cash_on_delivery"

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string; icon: string }[] =
  [
    { value: "card", label: "Credit / Debit Card", icon: "💳" },
    { value: "paypal", label: "PayPal", icon: "🅿️" },
    { value: "cash_on_delivery", label: "Cash on Delivery", icon: "💵" },
  ]

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()

  const [step, setStep] = useState<"shipping" | "payment" | "success">(
    "shipping"
  )
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [orderNumber, setOrderNumber] = useState("")

  const [address, setAddress] = useState<ShippingAddress>({
    fullName: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "United Kingdom",
    phone: "",
  })
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card")

  const shipping = totalPrice >= 50 ? 0 : 4.99
  const tax = Math.round(totalPrice * 0.2 * 100) / 100
  const orderTotal = Math.round((totalPrice + shipping + tax) * 100) / 100

  // Redirect if not authenticated or cart empty
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login")
    }
    if (!authLoading && items.length === 0 && step !== "success") {
      router.push("/cart")
    }
  }, [authLoading, isAuthenticated, items.length, router, step])

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setStep("payment")
  }

  const handlePlaceOrder = async () => {
    setSubmitting(true)
    setError("")
    try {
      // Sync local cart to backend cart
      await cartAPI.clear().catch(() => {})
      for (const item of items) {
        await cartAPI.addItem(item.productId, item.quantity)
      }

      // Create order
      const res = await ordersAPI.create({
        shippingAddress: address,
        paymentMethod,
      })

      setOrderNumber(res.data.orderNumber)
      clearCart()
      setStep("success")
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to place order. Please try again."
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (step === "success") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/15">
          <CheckCircle className="h-10 w-10 text-green-400" />
        </div>
        <h1 className="text-3xl font-black tracking-tight">Order Placed!</h1>
        <p className="mt-2 text-muted-foreground">Thank you for your order.</p>
        {orderNumber && (
          <p className="mt-1 font-mono text-sm text-primary">{orderNumber}</p>
        )}
        <p className="mt-3 max-w-sm text-sm text-muted-foreground">
          We&apos;ll send you a confirmation email shortly. Your supplements
          will be dispatched soon!
        </p>
        <div className="mt-6 flex gap-3">
          <Button onClick={() => router.push("/profile")} variant="outline">
            View My Orders
          </Button>
          <Button onClick={() => router.push("/products")}>
            Continue Shopping
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-black tracking-tight">Checkout</h1>

      {/* Progress */}
      <div className="mb-8 flex items-center gap-3 text-sm">
        <span
          className={`font-semibold ${step === "shipping" ? "text-primary" : "text-muted-foreground"}`}
        >
          1. Shipping
        </span>
        <span className="text-border">→</span>
        <span
          className={`font-semibold ${step === "payment" ? "text-primary" : "text-muted-foreground"}`}
        >
          2. Payment
        </span>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* ── Left: Forms ──────────────────────────────────────────────────── */}
        <div className="lg:col-span-2">
          {step === "shipping" && (
            <form
              onSubmit={handleAddressSubmit}
              className="space-y-5 rounded-xl border border-border bg-card p-6"
            >
              <h2 className="text-lg font-bold">Shipping Address</h2>

              <Field
                label="Full Name"
                value={address.fullName}
                onChange={(v) => setAddress({ ...address, fullName: v })}
                placeholder="John Smith"
                required
              />
              <Field
                label="Street Address"
                value={address.street}
                onChange={(v) => setAddress({ ...address, street: v })}
                placeholder="123 Gym Street"
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <Field
                  label="City"
                  value={address.city}
                  onChange={(v) => setAddress({ ...address, city: v })}
                  placeholder="London"
                  required
                />
                <Field
                  label="County / State"
                  value={address.state}
                  onChange={(v) => setAddress({ ...address, state: v })}
                  placeholder="Greater London"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field
                  label="Postcode"
                  value={address.postalCode}
                  onChange={(v) => setAddress({ ...address, postalCode: v })}
                  placeholder="SW1A 1AA"
                  required
                />
                <Field
                  label="Country"
                  value={address.country}
                  onChange={(v) => setAddress({ ...address, country: v })}
                  placeholder="United Kingdom"
                  required
                />
              </div>
              <Field
                label="Phone (optional)"
                value={address.phone ?? ""}
                onChange={(v) => setAddress({ ...address, phone: v })}
                placeholder="+44 7700 900000"
              />

              <Button type="submit" className="w-full font-bold" size="lg">
                Continue to Payment
              </Button>
            </form>
          )}

          {step === "payment" && (
            <div className="space-y-5 rounded-xl border border-border bg-card p-6">
              <h2 className="text-lg font-bold">Payment Method</h2>

              {error && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="space-y-3">
                {PAYMENT_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors ${
                      paymentMethod === opt.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={opt.value}
                      checked={paymentMethod === opt.value}
                      onChange={() => setPaymentMethod(opt.value)}
                      className="accent-primary"
                    />
                    <span className="text-xl">{opt.icon}</span>
                    <span className="font-medium">{opt.label}</span>
                  </label>
                ))}
              </div>

              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Lock className="h-3 w-3" />
                Your payment information is secured with SSL encryption.
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep("shipping")}
                >
                  Back
                </Button>
                <Button
                  className="flex-1 font-bold"
                  size="lg"
                  onClick={handlePlaceOrder}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Placing order…
                    </>
                  ) : (
                    `Place Order · £${orderTotal.toFixed(2)}`
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* ── Right: Order summary ────────────────────────────────────────── */}
        <div>
          <div className="sticky top-20 space-y-4 rounded-xl border border-border bg-card p-5">
            <h2 className="font-bold">Your Order</h2>
            <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.productId} className="flex items-center gap-3">
                  <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-secondary">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-lg">
                        🏋️
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      ×{item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-semibold">
                    £{(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
            <hr className="border-border" />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>£{totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span>
                  {shipping === 0 ? (
                    <span className="text-green-400">Free</span>
                  ) : (
                    `£${shipping.toFixed(2)}`
                  )}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>VAT (20%)</span>
                <span>£{tax.toFixed(2)}</span>
              </div>
              <hr className="border-border" />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>£{orderTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  required?: boolean
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </div>
  )
}
