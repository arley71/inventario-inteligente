"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Leaf,
  Package,
  ShoppingCart,
  Store,
  Receipt,
  LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useInventory } from "@/lib/inventory-context"
import { useAuth } from "@/lib/auth-context"

const navItems = [
  { href: "/cajero/revuelteria", label: "Revuelteria", icon: Leaf, showBadge: true },
  { href: "/cajero/abarrotes", label: "Abarrotes", icon: Package },
  { href: "/cajero/ventas", label: "Registro de Ventas", icon: Receipt },
  { href: "/cajero/pos", label: "Nueva Venta", icon: ShoppingCart },
]

export function CajeroSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { revuelteria } = useInventory()
  const { user, logout } = useAuth()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  
  const badProductsCount = revuelteria.filter(p => p.freshness === "danado" || p.batches?.some(b => b.freshness === "danado")).length

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border lg:flex">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-primary">
            <Store className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-tight text-sidebar-foreground">
              Mi Tienda
            </h1>
            <p className="text-xs text-sidebar-foreground/60">Stock Control</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4">
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
            Menu
          </p>
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              const showBadge = item.showBadge && badProductsCount > 0
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <item.icon className="h-[18px] w-[18px]" />
                    {item.label}
                    {showBadge && (
                      <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-primary-foreground">
                        {badProductsCount}
                      </span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-accent text-xs font-bold text-sidebar-accent-foreground">
                CJ
              </div>
              <div>
                <p className="text-sm font-medium text-sidebar-foreground">Cajero</p>
                <p className="text-xs text-sidebar-foreground/50">Usuario</p>
              </div>
            </div>
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Logout Confirmation Modal */}
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 p-4">
            <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                  <LogOut className="h-6 w-6 text-destructive" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-card-foreground">Cerrar Sesión</h3>
                <p className="mb-6 text-sm text-muted-foreground">
                  ¿Estás seguro de que deseas cerrar sesión?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowLogoutConfirm(false)}
                    className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-card-foreground hover:bg-muted"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex-1 rounded-xl bg-destructive px-4 py-2.5 text-sm font-semibold text-destructive-foreground hover:bg-destructive/90"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  )
}
