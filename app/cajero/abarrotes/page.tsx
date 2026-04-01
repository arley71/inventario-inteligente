"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import { Search, Package, AlertTriangle } from "lucide-react"
import { useInventory } from "@/lib/inventory-context"
import { cn } from "@/lib/utils"

export default function AbarrotesCajeroPage() {
  const { abarrotes } = useInventory()
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")

  const categories = useMemo(() => {
    const cats = new Set(abarrotes.map((p) => p.category))
    return ["all", ...Array.from(cats)]
  }, [abarrotes])

  const filtered = useMemo(() => {
    return abarrotes.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase())
      const matchCategory = categoryFilter === "all" || p.category === categoryFilter
      return matchSearch && matchCategory
    })
  }, [abarrotes, search, categoryFilter])

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-foreground lg:text-2xl">
            <Package className="h-6 w-6 text-chart-5" />
            Abarrotes
          </h2>
          <p className="text-sm text-muted-foreground">Productos empacados y de almacen</p>
        </div>

        {/* Search */}
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nombre o SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-xl border border-input bg-card pl-10 pr-4 text-sm text-card-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
          />
        </div>
      </div>

      {/* Category filter */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              categoryFilter === cat
                ? "bg-chart-5 text-primary-foreground"
                : "border border-border bg-card text-card-foreground hover:bg-muted"
            }`}
          >
            {cat === "all" ? "Todos" : cat}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Producto
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  SKU
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Categoria
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Precio
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Stock
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((product) => {
                const isLow = product.stock <= product.minStock
                const isCritical = product.stock <= product.minStock / 2
                return (
                  <tr key={product.id} className="transition-colors hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Image
                          src={product.image}
                          alt={product.name}
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                        <span className="text-sm font-medium text-card-foreground">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-muted-foreground">{product.sku}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-card-foreground">
                      COP ${product.price.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={cn(
                          "text-sm font-semibold",
                          isCritical ? "text-destructive" : isLow ? "text-warning-foreground" : "text-card-foreground"
                        )}
                      >
                        {product.stock} pzas
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {isCritical ? (
                        <span className="inline-flex items-center gap-1 rounded-md border border-destructive/30 bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive">
                          <AlertTriangle className="h-3 w-3" />
                          Critico
                        </span>
                      ) : isLow ? (
                        <span className="inline-flex items-center gap-1 rounded-md border border-warning/30 bg-warning/10 px-2 py-0.5 text-xs font-semibold text-warning-foreground">
                          <AlertTriangle className="h-3 w-3" />
                          Bajo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                          OK
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <Search className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No se encontraron productos.</p>
          </div>
        )}
      </div>
    </div>
  )
}
