"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Leaf,
  Package,
  ShoppingCart,
  Store,
  Menu,
  X,
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

export function CajeroMobileHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const { revuelteria } = useInventory()
  const { user, logout } = useAuth()
  
  const badProductsCount = revuelteria.filter(p => p.freshness === "danado" || p.batches?.some(b => b.freshness === "danado")).length

  const handleLogout = () => {
    logout()
    setShowLogoutConfirm(false)
    router.push("/login")
  }

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 flex h-14 items-center justify-between border-b border-border bg-card px-4 lg:hidden">
        <div className="flex items-center gap-2">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Store className="h-4 w-4 text-primary-foreground" />
            {badProductsCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-primary-foreground">
                {badProductsCount}
              </span>
            )}
          </div>
          <span className="text-sm font-semibold text-foreground">Mi Tienda</span>
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-foreground hover:bg-muted"
          aria-label={open ? "Cerrar menu" : "Abrir menu"}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {/* Mobile nav overlay */}
      {open && (
        <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)}>
          <nav
            className="absolute right-0 top-14 w-64 border-l border-border bg-card p-4 shadow-lg"
            style={{ height: "calc(100vh - 56px)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <ul className="flex flex-col gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                const showBadge = item.showBadge && badProductsCount > 0
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground/70 hover:bg-muted"
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
            
            {/* User info and logout */}
            <div className="absolute bottom-4 left-4 right-4 border-t border-border pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                    CJ
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Cajero</p>
                    <p className="text-xs text-muted-foreground">Usuario</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setOpen(false)
                    setShowLogoutConfirm(true)
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                  title="Cerrar sesión"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </nav>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <LogOut className="h-6 w-6 text-destructive" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-card-foreground">Cerrar Sesion</h3>
              <p className="mb-6 text-sm text-muted-foreground">
                Esta seguro de que desea cerrar sesion?
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
                  className="flex-1 rounded-xl bg-destructive px-4 py-2.5 text-sm font-semibold text-white hover:bg-destructive/90"
                >
                  Cerrar Sesion
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
