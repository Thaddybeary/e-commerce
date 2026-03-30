"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Dumbbell,
  ShoppingCart,
  User,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { useCart } from "@/context/cart-context";

const categories = [
  "Protein Powder",
  "Pre-Workout",
  "Creatine",
  "Vitamins & Supplements",
  "Weight Gainers",
  "Fat Burners",
  "Amino Acids",
  "Bars & Snacks",
];

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems } = useCart();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setProfileOpen(false);
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-sm">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Dumbbell className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-black tracking-tight">
            IRON<span className="text-primary">FUEL</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-6 md:flex">
          <Link
            href="/products"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Shop All
          </Link>

          {/* Categories dropdown */}
          <div className="relative">
            <button
              className="flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              onMouseEnter={() => setCatOpen(true)}
              onMouseLeave={() => setCatOpen(false)}
            >
              Categories <ChevronDown className="h-3.5 w-3.5" />
            </button>
            {catOpen && (
              <div
                className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-52 rounded-xl border border-border bg-popover p-2 shadow-xl"
                onMouseEnter={() => setCatOpen(true)}
                onMouseLeave={() => setCatOpen(false)}
              >
                {categories.map((cat) => (
                  <Link
                    key={cat}
                    href={`/products?category=${encodeURIComponent(cat)}`}
                    className="block rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    onClick={() => setCatOpen(false)}
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link
            href="/products?featured=true"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Best Sellers
          </Link>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Cart */}
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              )}
            </Button>
          </Link>

          {/* Auth */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                className="flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent"
                onClick={() => setProfileOpen((v) => !v)}
              >
                <User className="h-4 w-4 text-primary" />
                <span className="hidden sm:inline max-w-24 truncate">
                  {user?.name}
                </span>
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-44 rounded-xl border border-border bg-popover p-1.5 shadow-xl">
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                    onClick={() => setProfileOpen(false)}
                  >
                    <Package className="h-4 w-4" /> My Orders
                  </Link>
                  <hr className="my-1 border-border" />
                  <button
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-destructive"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm">Sign Up</Button>
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            className="md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border bg-card px-4 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            <Link
              href="/products"
              className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-accent"
              onClick={() => setMobileOpen(false)}
            >
              Shop All
            </Link>
            <p className="px-3 pt-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Categories
            </p>
            {categories.map((cat) => (
              <Link
                key={cat}
                href={`/products?category=${encodeURIComponent(cat)}`}
                className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                onClick={() => setMobileOpen(false)}
              >
                {cat}
              </Link>
            ))}
            {!isAuthenticated && (
              <div className="mt-4 flex gap-2 border-t border-border pt-4">
                <Link href="/auth/login" className="flex-1" onClick={() => setMobileOpen(false)}>
                  <Button variant="ghost" className="w-full">Login</Button>
                </Link>
                <Link href="/auth/register" className="flex-1" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
