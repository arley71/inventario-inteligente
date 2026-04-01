"use client"

import Image from "next/image"
import { useInventory } from "@/lib/inventory-context"
import { AlertTriangle, ArrowRight } from "lucide-react"
import Link from "next/link"

export function UrgentList() {
  const { revuelteria, abarrotes } = useInventory()

  const lowStockAbarrotes = abarrotes
    .filter((p) => p.stock <= p.minStock)
    .map((p) => ({
      id: p.id,
      name: p.name,
      image: p.image,
      reason: `Stock: ${p.stock} pzas (min: ${p.minStock})`,
      severity: p.stock <= p.minStock / 2 ? "critical" : "warning",
      link: "/admin/abarrotes",
    }))

  const lowStockRevuelteria = revuelteria
    .filter((p) => p.stockKg < 10)
    .map((p) => ({
      id: p.id,
      name: p.name,
      image: p.image,
      reason: `Stock: ${p.stockKg.toFixed(1)} kg`,
      severity: p.stockKg < 5 ? "critical" : "warning",
      link: "/admin/revuelteria",
    }))

  const damagedProducts = revuelteria
    .filter((p) => p.freshness === "danado" || p.batches?.some(b => b.freshness === "danado"))
    .map((p) => ({
      id: p.id,
      name: p.name,
      image: p.image,
      reason: "Producto en mal estado",
      severity: "critical" as const,
      link: "/admin/revuelteria",
    }))

  const allUrgent = [...damagedProducts, ...lowStockAbarrotes, ...lowStockRevuelteria].slice(0, 6)

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-card-foreground">Reposicion Urgente</h3>
          <p className="text-xs text-muted-foreground">Productos que requieren atencion</p>
        </div>
        <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-destructive/10 px-2 text-xs font-bold text-destructive">
          {allUrgent.length}
        </span>
      </div>

      {allUrgent.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Todo en orden. No hay productos urgentes.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {allUrgent.map((item) => (
            <li key={item.id}>
              <Link
                href={item.link}
                className="flex items-center gap-3 rounded-lg p-2.5 transition-colors hover:bg-muted"
              >
                <Image
                  src={item.image}
                  alt={item.name}
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-card-foreground">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.reason}</p>
                </div>
                <div className="flex items-center gap-2">
                  {item.severity === "critical" ? (
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-warning" />
                  )}
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
