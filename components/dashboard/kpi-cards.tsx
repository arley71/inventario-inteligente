"use client"

import { useInventory } from "@/lib/inventory-context"
import {
  DollarSign,
  Package,
  TrendingUp,
} from "lucide-react"

export function KpiCards() {
  const { revuelteria, abarrotes, todaySalesTotal } = useInventory()

  const totalProducts = revuelteria.length + abarrotes.length

  const damagedCount = revuelteria.filter((p) => p.freshness === "danado" || p.batches?.some(b => b.freshness === "danado")).length

  const cards = [
    {
      label: "Ventas del Dia",
      value: `COP $${todaySalesTotal.toLocaleString("es-CO", { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: "bg-primary/10 text-primary",
      trend: "+12%",
    },
    {
      label: "Total Productos",
      value: totalProducts.toString(),
      icon: Package,
      color: "bg-chart-5/10 text-chart-5",
      trend: null,
    },
    {
      label: "Productos por Revisar",
      value: damagedCount.toString(),
      icon: TrendingUp,
      color: damagedCount > 0 ? "bg-warning/10 text-warning" : "bg-primary/10 text-primary",
      trend: null,
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-sm"
        >
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${card.color}`}>
            <card.icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground">{card.label}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-card-foreground">{card.value}</p>
              {card.trend && (
                <span className="text-xs font-medium text-primary">{card.trend}</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
