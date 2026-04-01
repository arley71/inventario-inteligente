"use client"

import { useState, useMemo } from "react"
import { Search, Leaf, Apple, Camera, X } from "lucide-react"
import { useInventory } from "@/lib/inventory-context"
import { ProductCard } from "@/components/revuelteria/product-card"
import { AiScanner } from "@/components/revuelteria/ai-scanner"
import type { RevuelteriaProduct, FreshnessStatus } from "@/lib/inventory-data"

export default function RevuelteriaCajeroPage() {
  const { revuelteria, updateFreshness } = useInventory()
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<"all" | "fruta" | "verdura">("all")
  const [scanningProduct, setScanningProduct] = useState<RevuelteriaProduct | null>(null)
  const [showProductSelect, setShowProductSelect] = useState(false)

  const filtered = useMemo(() => {
    return revuelteria.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
      const matchCategory = categoryFilter === "all" || p.category === categoryFilter
      return matchSearch && matchCategory
    })
  }, [revuelteria, search, categoryFilter])

  const handleSaveAnalysis = (productId: string, status: FreshnessStatus, confidence: number, batchId?: string) => {
    updateFreshness(productId, status, confidence, batchId)
  }

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-foreground lg:text-2xl">
            <Leaf className="h-6 w-6 text-primary" />
            Revuelteria
          </h2>
          <p className="text-sm text-muted-foreground">Frutas, verduras y productos frescos</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6 relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar producto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 w-full rounded-xl border border-input bg-card pl-10 pr-4 text-sm text-card-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
        />
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        {[
          { value: "all" as const, label: "Todos", icon: null },
          { value: "fruta" as const, label: "Frutas", icon: Apple },
          { value: "verdura" as const, label: "Verduras", icon: Leaf },
        ].map((filter) => (
          <button
            key={filter.value}
            onClick={() => setCategoryFilter(filter.value)}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              categoryFilter === filter.value
                ? "bg-primary text-primary-foreground"
                : "bg-card text-card-foreground border border-border hover:bg-muted"
            }`}
          >
            {filter.icon && <filter.icon className="h-3.5 w-3.5" />}
            {filter.label}
          </button>
        ))}
        <button
          onClick={() => setShowProductSelect(true)}
          className="ml-auto flex items-center gap-1.5 rounded-lg bg-chart-2 px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-chart-2/90"
        >
          <Camera className="h-4 w-4" />
          Analizar calidad
        </button>
      </div>

      {/* Products grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            showActions={false}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-16 text-center">
          <Search className="h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No se encontraron productos.</p>
        </div>
      )}

      {/* Product Selection Modal for Analysis */}
      {showProductSelect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md max-h-[80vh] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <h3 className="text-sm font-semibold text-card-foreground">Seleccionar Producto</h3>
                <p className="text-xs text-muted-foreground">Elige un producto para analizar</p>
              </div>
              <button
                onClick={() => setShowProductSelect(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-card-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="border-b border-border px-4 pb-3">
              <input
                type="text"
                placeholder="Buscar producto..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm text-card-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none"
              />
            </div>
            <div className="overflow-y-auto p-2" style={{ maxHeight: 'calc(80vh - 140px)' }}>
              <div className="space-y-1">
                {filtered.length === 0 ? (
                  <p className="p-4 text-center text-sm text-muted-foreground">No se encontraron productos</p>
                ) : (
                  filtered.map((product) => {
                    const freshness = product.freshness || (product.batches?.some(b => b.freshness === "danado") ? "danado" : "fresco")
                    return (
                    <button
                      key={product.id}
                      onClick={() => {
                        setShowProductSelect(false)
                        setScanningProduct(product)
                        setSearch("")
                      }}
                      className="flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-muted"
                    >
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-card-foreground truncate">{product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {product.batches?.length || 1} lote(s) • 
                          <span className={freshness === "fresco" ? "text-primary" : "text-destructive ml-1"}>
                            {freshness === "fresco" ? "Bueno" : "Malo"}
                          </span>
                        </p>
                      </div>
                    </button>
                  )})
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Scanner Modal */}
      {scanningProduct && (
        <AiScanner
          product={scanningProduct}
          onClose={() => {
            setScanningProduct(null)
            setSearch("")
          }}
          onSave={handleSaveAnalysis}
        />
      )}
    </div>
  )
}
