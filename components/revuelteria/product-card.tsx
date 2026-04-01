"use client"

import Image from "next/image"
import { Minus, Plus, Calendar, Pencil, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { RevuelteriaProduct } from "@/lib/inventory-data"

const freshnessConfig = {
  fresco: { label: "Bueno", className: "bg-primary/15 text-primary border-primary/30" },
  danado: { label: "Malo", className: "bg-destructive/15 text-destructive border-destructive/30" },
}

interface ProductCardProps {
  product: RevuelteriaProduct
  onAnalyze?: (product: RevuelteriaProduct) => void
  onRegisterLoss?: (product: RevuelteriaProduct) => void
  onAddStock?: (product: RevuelteriaProduct) => void
  onEdit?: (product: RevuelteriaProduct) => void
  onDelete?: (product: RevuelteriaProduct) => void
  showActions?: boolean
  showAdminActions?: boolean
}

export function ProductCard({ product, onAnalyze, onRegisterLoss, onAddStock, onEdit, onDelete, showActions = true, showAdminActions = false }: ProductCardProps) {
  const freshness = product.freshness || (product.batches?.some(b => b.freshness === "danado") ? "danado" : "fresco")
  const config = freshnessConfig[freshness]
  
  const oldestDate = product.arrivalDate || (product.batches?.length ? 
    product.batches.reduce((oldest, b) => b.arrivalDate < oldest ? b.arrivalDate : oldest, product.batches[0].arrivalDate) 
    : new Date().toISOString().split("T")[0])

  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform group-hover:scale-105"
        />

        {/* Freshness badge */}
        <div className="absolute bottom-2 left-2">
          <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold", config.className)}>
            {config.label}
            {product.aiConfidence && (
              <span className="ml-1 opacity-80">{product.aiConfidence}%</span>
            )}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="mb-3">
          <h3 className="text-sm font-semibold text-card-foreground">{product.name}</h3>
          <p className="text-lg font-bold text-primary">
            COP ${product.pricePerKg.toFixed(2)}
            <span className="text-xs font-normal text-muted-foreground"> / kg</span>
          </p>
        </div>

        {/* Stock bar */}
        <div className="mb-3">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Stock</span>
            <span className="text-xs font-semibold text-card-foreground">
              {product.stockKg.toFixed(1)} kg
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                product.stockKg > 20 ? "bg-primary" : product.stockKg > 10 ? "bg-warning" : "bg-destructive"
              )}
              style={{ width: `${Math.min(100, (product.stockKg / 50) * 100)}%` }}
            />
          </div>
        </div>

        {/* Batches info */}
        <div className="mb-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
            <Calendar className="h-3 w-3" />
            <span>Lotes:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {product.batches?.map((batch) => (
              <span
                key={batch.id}
                className={cn(
                  "inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium",
                  batch.freshness === "fresco" 
                    ? "bg-primary/10 text-primary border-primary/30" 
                    : "bg-destructive/10 text-destructive border-destructive/30"
                )}
              >
                {batch.arrivalDate.slice(5)} ({batch.quantity}kg)
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        {showActions && (
        <div className="flex gap-2">
          <button
            onClick={() => onRegisterLoss?.(product)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
          >
            <Minus className="h-3 w-3" />
            Merma
          </button>
          <button
            onClick={() => onAddStock?.(product)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
          >
            <Plus className="h-3 w-3" />
            Stock
          </button>
        </div>
        )}

        {/* Admin Actions */}
        {showAdminActions && (
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => onEdit?.(product)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border bg-muted px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted/80"
          >
            <Pencil className="h-3 w-3" />
            Editar
          </button>
          <button
            onClick={() => onDelete?.(product)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
          >
            <Trash2 className="h-3 w-3" />
            Eliminar
          </button>
        </div>
        )}
      </div>
    </div>
  )
}
