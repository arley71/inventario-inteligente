"use client"

import { Phone, MapPin, Clock, Package, Leaf, ArrowUpDown } from "lucide-react"
import type { Supplier } from "@/lib/inventory-data"
import { cn } from "@/lib/utils"

const statusConfig = {
  activo: { label: "Activo", className: "border-primary/30 bg-primary/10 text-primary" },
  inactivo: { label: "Inactivo", className: "border-destructive/30 bg-destructive/10 text-destructive" },
}

const typeConfig = {
  revuelteria: { label: "Revuelteria", icon: Leaf, className: "text-primary" },
  abarrotes: { label: "Abarrotes", icon: Package, className: "text-chart-5" },
  ambos: { label: "Ambos", icon: ArrowUpDown, className: "text-accent" },
}

interface SupplierCardProps {
  supplier: Supplier
  isSelected: boolean
  onClick: () => void
}

export function SupplierCard({ supplier, isSelected, onClick }: SupplierCardProps) {
  const status = statusConfig[supplier.status]
  const type = typeConfig[supplier.type]
  const TypeIcon = type.icon

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full rounded-xl border bg-card p-4 text-left transition-all hover:shadow-md",
        isSelected
          ? "border-primary ring-2 ring-primary/20 shadow-md"
          : "border-border hover:border-primary/40"
      )}
    >
      {/* Header row */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="truncate text-sm font-semibold text-card-foreground">{supplier.name}</h3>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{supplier.contactPerson}</p>
        </div>
        <span className={cn("shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide", status.className)}>
          {status.label}
        </span>
      </div>

      {/* Type */}
      <div className="mb-3">
        <div className={cn("flex items-center gap-1.5 text-xs font-medium", type.className)}>
          <TypeIcon className="h-3.5 w-3.5" />
          {type.label}
        </div>
      </div>

      {/* Quick info */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Phone className="h-3 w-3 shrink-0" />
          <span className="truncate">{supplier.phone}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{supplier.city}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3 shrink-0" />
          <span className="truncate">Entrega: {supplier.deliveryDays}</span>
        </div>
      </div>
    </button>
  )
}
