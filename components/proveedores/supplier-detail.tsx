"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Star,
  Phone,
  Mail,
  MapPin,
  Clock,
  CreditCard,
  FileText,
  Package,
  Leaf,
  ArrowUpDown,
  TrendingUp,
  X,
  CalendarDays,
  Hash,
  Truck as TruckIcon,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Timer,
  Pencil,
  Trash2,
  Plus,
} from "lucide-react"
import type { Supplier, SupplierOrder, SupplierStatus } from "@/lib/inventory-data"
import { cn } from "@/lib/utils"

const statusConfig = {
  activo: { label: "Activo", className: "border-primary/30 bg-primary/10 text-primary" },
  inactivo: { label: "Inactivo", className: "border-destructive/30 bg-destructive/10 text-destructive" },
}

const orderStatusConfig = {
  entregado: { label: "Entregado", icon: CheckCircle2, className: "text-primary" },
  en_camino: { label: "En Camino", icon: TruckIcon, className: "text-chart-5" },
  pendiente: { label: "Pendiente", icon: Timer, className: "text-warning-foreground" },
  cancelado: { label: "Cancelado", icon: XCircle, className: "text-destructive" },
}

const typeConfig = {
  revuelteria: { label: "Revuelteria", icon: Leaf, className: "text-primary bg-primary/10" },
  abarrotes: { label: "Abarrotes", icon: Package, className: "text-chart-5 bg-chart-5/10" },
  ambos: { label: "Ambos", icon: ArrowUpDown, className: "text-accent bg-accent/10" },
}

interface SupplierDetailProps {
  supplier: Supplier
  onClose: () => void
  onUpdateStatus: (supplierId: string, status: SupplierStatus) => void
  onEdit: (supplier: Supplier) => void
  onDelete: (supplier: Supplier) => void
}

export function SupplierDetail({ supplier, onClose, onUpdateStatus, onEdit, onDelete }: SupplierDetailProps) {
  const status = statusConfig[supplier.status]
  const type = typeConfig[supplier.type]
  const TypeIcon = type.icon

  const avgOrderValue = supplier.totalOrders > 0 ? supplier.totalSpent / supplier.totalOrders : 0
  const activeOrders = (supplier.orders || []).filter(
    (o) => o.status === "en_camino" || o.status === "pendiente"
  ).length

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      {/* Header */}
      <div className="border-b border-border bg-muted/30 px-5 py-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-card-foreground">{supplier.name}</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">{supplier.contactPerson}</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Cerrar detalle"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn("rounded-md border px-2.5 py-1 text-xs font-semibold", status.className)}>
            {status.label}
          </span>
          <span className={cn("inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold", type.className)}>
            <TypeIcon className="h-3 w-3" />
            {type.label}
          </span>
          <div className="flex items-center gap-1 rounded-md bg-accent/10 px-2.5 py-1">
            <Star className="h-3 w-3 fill-accent text-accent" />
            <span className="text-xs font-semibold text-accent">{supplier.rating.toFixed(1)}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {/* Contact Info */}
        <div className="mb-5">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Informacion de Contacto</h3>
          <div className="grid gap-2.5 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-lg border border-border p-3">
              <Phone className="h-4 w-4 shrink-0 text-primary" />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Telefono</p>
                <p className="text-sm font-medium text-card-foreground">{supplier.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-border p-3">
              <Mail className="h-4 w-4 shrink-0 text-primary" />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Email</p>
                <p className="truncate text-sm font-medium text-card-foreground">{supplier.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-border p-3">
              <MapPin className="h-4 w-4 shrink-0 text-primary" />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Direccion</p>
                <p className="text-sm font-medium text-card-foreground">{supplier.address}</p>
                <p className="text-xs text-muted-foreground">{supplier.city}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-border p-3">
              <FileText className="h-4 w-4 shrink-0 text-primary" />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">RFC</p>
                <p className="font-mono text-sm font-medium text-card-foreground">{supplier.rfc}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Terms */}
        <div className="mb-5 flex flex-wrap gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Dias de Entrega</p>
              <p className="text-xs font-semibold text-card-foreground">{supplier.deliveryDays}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-2">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Terminos de Pago</p>
              <p className="text-xs font-semibold text-card-foreground">{supplier.paymentTerms}</p>
            </div>
          </div>
        </div>

        {/* Products Supplied */}
        <div className="mb-5">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Productos que Suministra</h3>
          <div className="flex flex-wrap gap-2">
            {supplier.productsSupplied.map((product) => (
              <span
                key={product}
                className="rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-xs font-medium text-card-foreground"
              >
                {product}
              </span>
            ))}
          </div>
        </div>

        {/* Notes */}
        {supplier.notes && (
          <div className="mb-5 rounded-lg border border-primary/20 bg-primary/5 p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <AlertCircle className="h-3.5 w-3.5 text-primary" />
              <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">Notas</p>
            </div>
            <p className="text-sm text-card-foreground leading-relaxed">{supplier.notes}</p>
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="border-t border-border bg-muted/30 px-5 py-3">
        <div className="flex flex-wrap gap-2">
          {supplier.status === "inactivo" && (
            <button
              onClick={() => onUpdateStatus(supplier.id, "activo")}
              className="flex items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/10 px-4 py-2.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
            >
              <CheckCircle2 className="h-3 w-3" />
              Activar
            </button>
          )}
          {supplier.status === "activo" && (
            <button
              onClick={() => onUpdateStatus(supplier.id, "inactivo")}
              className="flex items-center gap-1.5 rounded-lg border border-yellow-500/40 bg-yellow-500/10 px-4 py-2.5 text-xs font-semibold text-yellow-600 transition-colors hover:bg-yellow-500/20"
            >
              <AlertCircle className="h-3 w-3" />
              Desactivar
            </button>
          )}
          <button
            onClick={() => onEdit(supplier)}
            className="flex items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/10 px-4 py-2.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
          >
            <Pencil className="h-3 w-3" />
            Editar
          </button>
          <button
            onClick={() => onDelete(supplier)}
            className="flex items-center gap-1.5 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-2.5 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/20"
          >
            <Trash2 className="h-3 w-3" />
            Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}
