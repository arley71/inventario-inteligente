"use client"

import { useMemo, useState } from "react"
import { Receipt, CreditCard, Banknote, TrendingUp, X } from "lucide-react"
import { useInventory } from "@/lib/inventory-context"
import { cn } from "@/lib/utils"
import type { Sale, SaleItem } from "@/lib/inventory-data"

function parseSpanishDate(dateStr: string, timeStr: string): Date {
  const parts = dateStr.split("/")
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10)
    const month = parseInt(parts[1], 10) - 1
    const year = parseInt(parts[2], 10)
    const timeParts = timeStr.split(":")
    const hours = timeParts.length > 0 ? parseInt(timeParts[0], 10) : 0
    const minutes = timeParts.length > 1 ? parseInt(timeParts[1], 10) : 0
    return new Date(year, month, day, hours, minutes)
  }
  return new Date(dateStr + " " + timeStr)
}

export default function VentasCajeroPage() {
  const { sales } = useInventory()
  const [paymentFilter, setPaymentFilter] = useState<"all" | "efectivo" | "tarjeta">("all")
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)

  const filteredSales = useMemo(() => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    return sales.filter(sale => {
      const saleDate = parseSpanishDate(sale.date, sale.time)
      if (saleDate < today || saleDate > now) return false
      if (paymentFilter !== "all" && sale.paymentMethod !== paymentFilter) return false
      return true
    }).sort((a, b) => {
      const dateA = parseSpanishDate(a.date, a.time)
      const dateB = parseSpanishDate(b.date, b.time)
      return dateB.getTime() - dateA.getTime()
    })
  }, [sales, paymentFilter])

  const stats = useMemo(() => {
    const totalVentas = filteredSales.length
    const totalIngresos = filteredSales.reduce((sum, s) => sum + s.total, 0)
    const efectivo = filteredSales.filter(s => s.paymentMethod === "efectivo").reduce((sum, s) => sum + s.total, 0)
    const tarjeta = filteredSales.filter(s => s.paymentMethod === "tarjeta").reduce((sum, s) => sum + s.total, 0)
    return { totalVentas, totalIngresos, efectivo, tarjeta }
  }, [filteredSales])

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-foreground lg:text-2xl">
            <Receipt className="h-6 w-6 text-chart-2" />
            Registro de Ventas
          </h2>
          <p className="text-sm text-muted-foreground">Ventas del dia de hoy</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        {[
          { value: "all" as const, label: "Todos" },
          { value: "efectivo" as const, label: "Efectivo" },
          { value: "tarjeta" as const, label: "Tarjeta" },
        ].map((method) => (
          <button
            key={method.value}
            onClick={() => setPaymentFilter(method.value)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              paymentFilter === method.value
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-card text-card-foreground hover:bg-muted"
            }`}
          >
            {method.label}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <TrendingUp className="h-3 w-3" />
            Transacciones
          </div>
          <p className="mt-1 text-2xl font-bold text-card-foreground">{stats.totalVentas}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Receipt className="h-3 w-3" />
            Ingresos
          </div>
          <p className="mt-1 text-2xl font-bold text-primary">COP ${stats.totalIngresos.toLocaleString("es-CO")}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Banknote className="h-3 w-3" />
            Efectivo
          </div>
          <p className="mt-1 text-2xl font-bold text-chart-5">COP ${stats.efectivo.toLocaleString("es-CO")}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <CreditCard className="h-3 w-3" />
            Tarjeta
          </div>
          <p className="mt-1 text-2xl font-bold text-chart-2">COP ${stats.tarjeta.toLocaleString("es-CO")}</p>
        </div>
      </div>

      {/* Sales List */}
      {filteredSales.length > 0 ? (
        <div className="rounded-xl border bg-card">
          <div className="border-b border-border p-4">
            <h3 className="text-sm font-semibold text-card-foreground">
              Transacciones de hoy ({filteredSales.length})
            </h3>
          </div>
          <div className="divide-y divide-border max-h-[500px] overflow-y-auto">
            {filteredSales.map((sale) => (
              <button
                key={sale.id}
                onClick={() => setSelectedSale(sale)}
                className="flex w-full items-center justify-between p-4 text-left hover:bg-muted/50"
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full",
                    sale.paymentMethod === "efectivo" ? "bg-chart-5/10" : "bg-chart-2/10"
                  )}>
                    {sale.paymentMethod === "efectivo" ? (
                      <Banknote className="h-5 w-5 text-chart-5" />
                    ) : (
                      <CreditCard className="h-5 w-5 text-chart-2" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-card-foreground">{sale.id}</p>
                    <p className="text-xs text-muted-foreground">
                      {sale.date} • {sale.time} • {sale.items.length} producto(s)
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-card-foreground">COP ${sale.total.toLocaleString("es-CO", { minimumFractionDigits: 2 })}</p>
                  <p className="text-xs text-muted-foreground capitalize">{sale.paymentMethod}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 rounded-xl border bg-card py-16 text-center">
          <Receipt className="h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No hay ventas hoy.</p>
        </div>
      )}

      {/* Sale Detail Modal */}
      {selectedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md max-h-[80vh] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <h3 className="text-base font-semibold text-card-foreground">Detalle de Venta</h3>
                <p className="text-xs text-muted-foreground">{selectedSale.id}</p>
              </div>
              <button
                onClick={() => setSelectedSale(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-card-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="overflow-y-auto p-5" style={{ maxHeight: 'calc(80vh - 140px)' }}>
              <div className="mb-4 rounded-lg bg-muted/50 p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">Fecha</span>
                  <span className="text-sm font-medium text-card-foreground">{selectedSale.date}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">Hora</span>
                  <span className="text-sm font-medium text-card-foreground">{selectedSale.time}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Metodo de Pago</span>
                  <span className="text-sm font-medium text-card-foreground capitalize">{selectedSale.paymentMethod}</span>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-xs font-semibold text-muted-foreground mb-2">PRODUCTOS</h4>
                <ul className="flex flex-col gap-2">
                  {selectedSale.items.map((item: SaleItem, index: number) => (
                    <li key={index} className="flex items-center justify-between rounded-lg border border-border p-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-card-foreground truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.unit === "kg" ? `${item.quantity.toFixed(1)} kg` : `${item.quantity} pza`} x COP ${item.unitPrice.toFixed(2)}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-card-foreground">COP ${item.subtotal.toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-border pt-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-muted-foreground">Subtotal</span>
                  <span className="text-sm text-card-foreground">COP ${(selectedSale.total - selectedSale.tax).toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-muted-foreground">IVA</span>
                  <span className="text-sm text-card-foreground">COP ${selectedSale.tax.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-base font-bold text-card-foreground">Total</span>
                  <span className="text-base font-bold text-primary">COP ${selectedSale.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
