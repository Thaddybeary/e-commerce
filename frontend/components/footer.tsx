import Link from "next/link"
import { Dumbbell } from "lucide-react"

const links = {
  Shop: [
    { label: "Protein Powder", href: "/products?category=Protein+Powder" },
    { label: "Pre-Workout", href: "/products?category=Pre-Workout" },
    { label: "Creatine", href: "/products?category=Creatine" },
    { label: "Vitamins", href: "/products?category=Vitamins+%26+Supplements" },
    { label: "All Products", href: "/products" },
  ],
  Account: [
    { label: "My Profile", href: "/profile" },
    { label: "My Orders", href: "/profile" },
    { label: "Cart", href: "/cart" },
  ],
  Info: [
    { label: "About Us", href: "#" },
    { label: "Shipping Policy", href: "#" },
    { label: "Returns", href: "#" },
    { label: "Contact", href: "#" },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Dumbbell className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-black tracking-tight text-foreground">
                IRON<span className="text-primary">FUEL</span>
              </span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Premium supplements for serious athletes. Fuel your gains with
              science-backed nutrition.
            </p>
            <p className="mt-4 text-xs text-muted-foreground">
              🚚 Free shipping on orders over £50
            </p>
          </div>

          {/* Links */}
          {Object.entries(links).map(([section, items]) => (
            <div key={section}>
              <h3 className="mb-3 text-xs font-bold tracking-widest text-foreground uppercase">
                {section}
              </h3>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} IronFuel. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Built for champions 🏆
          </p>
        </div>
      </div>
    </footer>
  )
}
