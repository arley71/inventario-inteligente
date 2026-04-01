"use client"

import { useState } from "react"
import { useInventory } from "@/lib/inventory-context"
import { Receipt, CreditCard, Banknote, X } from "lucide-react"
import type { Sale, SaleItem } from "@/lib/inventory-data"

export function RecentSales() {
  const { sales } = useInventory()
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)

  const recent = sales.slice(0, 5)

  return (
    <>
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-card-foreground">Ventas Recientes</h3>
          <p className="text-xs text-muted-foreground">Ultimas transacciones del dia</p>
        </div>

        {recent.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <Receipt className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              Aun no hay ventas hoy. Ve al POS para registrar la primera venta.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {recent.map((sale) => (
              <li key={sale.id}>
                <button
                  onClick={() => setSelectedSale(sale)}
                  className="flex w-full items-center gap-3 rounded-lg p-2.5 transition-colors hover:bg-muted text-left"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    {sale.paymentMethod === "efectivo" ? (
                      <Banknote className="h-4 w-4" />
                    ) : (
                      <CreditCard className="h-4 w-4" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-card-foreground">
                      {sale.id}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {sale.time} - {sale.items.length} producto(s)
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-card-foreground">
                    COP ${sale.total.toFixed(2)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

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
              {/* Sale Info */}
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

              {/* Products */}
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

              {/* Totals */}
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
    </>
  )
}
