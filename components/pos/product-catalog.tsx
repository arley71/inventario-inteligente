"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import { Search, Leaf, Package, AlertTriangle } from "lucide-react"
import { useInventory } from "@/lib/inventory-context"
import { cn } from "@/lib/utils"

interface CatalogItem {
  id: string
  name: string
  image: string
  price: number
  stock: number
  unit: "kg" | "pza"
  type: "revuelteria" | "abarrotes"
}

interface ProductCatalogProps {
  onAddItem: (item: CatalogItem) => void
}

export function ProductCatalog({ onAddItem }: ProductCatalogProps) {
  const { revuelteria, abarrotes } = useInventory()
  const [search, setSearch] = useState("")
  const [tab, setTab] = useState<"all" | "revuelteria" | "abarrotes">("all")

  const allProducts: CatalogItem[] = useMemo(() => {
    const rev = revuelteria.map((p) => ({
      id: p.id,
      name: p.name,
      image: p.image,
      price: p.pricePerKg,
      stock: p.stockKg,
      unit: "kg" as const,
      type: "revuelteria" as const,
    }))
    const abr = abarrotes.map((p) => ({
      id: p.id,
      name: p.name,
      image: p.image,
      price: p.price,
      stock: p.stock,
      unit: "pza" as const,
      type: "abarrotes" as const,
    }))
    return [...rev, ...abr]
  }, [revuelteria, abarrotes])

  const filtered = useMemo(() => {
    return allProducts.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
      const matchTab = tab === "all" || p.type === tab
      return matchSearch && matchTab
    })
  }, [allProducts, search, tab])

  return (
    <div className="flex h-full flex-col">
      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar producto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 w-full rounded-xl border border-input bg-card pl-10 pr-4 text-sm text-card-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
        />
      </div>

      {/* Tabs */}
      <div className="mb-3 flex gap-1.5">
        {[
          { value: "all" as const, label: "Todos" },
          { value: "revuelteria" as const, label: "Revuelteria", icon: Leaf },
          { value: "abarrotes" as const, label: "Abarrotes", icon: Package },
        ].map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={cn(
              "flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              tab === t.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-card-foreground"
            )}
          >
            {t.icon && <t.icon className="h-3 w-3" />}
            {t.label}
          </button>
        ))}
      </div>

      {/* Product grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-3">
          {filtered.map((item) => {
            const isLowStock = item.unit === "kg" ? item.stock < 5 : item.stock < 3
            return (
              <button
                key={item.id}
                onClick={() => onAddItem(item)}
                disabled={item.stock <= 0}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-all",
                  item.stock <= 0
                    ? "cursor-not-allowed border-border bg-muted/50 opacity-50"
                    : "border-border bg-card hover:border-primary/50 hover:shadow-sm active:scale-[0.98]"
                )}
              >
                <div className="relative">
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={56}
                    height={56}
                    className="h-14 w-14 rounded-lg object-cover"
                  />
                  {isLowStock && item.stock > 0 && (
                    <div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive">
                      <AlertTriangle className="h-2.5 w-2.5 text-primary-foreground" />
                    </div>
                  )}
                </div>
                <span className="line-clamp-1 text-xs font-medium text-card-foreground">{item.name}</span>
                <span className="text-xs font-bold text-primary">
                  COP ${item.price.toFixed(2)}/{item.unit}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {item.unit === "kg" ? `${item.stock.toFixed(1)} kg` : `${item.stock} pzas`}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
