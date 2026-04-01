"use client"

import { useState } from "react"
import { Trash2, Plus, Minus, Receipt, Settings, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { SaleItem } from "@/lib/inventory-data"

interface SaleTicketProps {
  items: SaleItem[]
  onUpdateQuantity: (productId: string, delta: number) => void
  onRemoveItem: (productId: string) => void
  onCheckout: () => void
  ivaRate?: number
  onIvaChange?: (rate: number) => void
  isAdmin?: boolean
}

export function SaleTicket({ 
  items, 
  onUpdateQuantity, 
  onRemoveItem, 
  onCheckout,
  ivaRate = 16,
  onIvaChange,
  isAdmin = false
}: SaleTicketProps) {
  const [showIvaModal, setShowIvaModal] = useState(false)
  const [tempIvaRate, setTempIvaRate] = useState(ivaRate)

  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0)
  const tax = subtotal * (ivaRate / 100)
  const total = subtotal + tax

  const openIvaModal = () => {
    setTempIvaRate(ivaRate)
    setShowIvaModal(true)
  }

  const saveIvaRate = () => {
    if (onIvaChange) {
      onIvaChange(tempIvaRate)
    }
    setShowIvaModal(false)
  }

  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card shadow-sm">
      {/* Header */}
      <div className="border-b border-border px-4 py-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-card-foreground">
          <Receipt className="h-4 w-4 text-primary" />
          Ticket de Venta
        </h3>
        <p className="text-xs text-muted-foreground">
          {items.length > 0 ? `${items.length} producto(s)` : "Agrega productos del catalogo"}
        </p>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto p-3">
        {items.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Receipt className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              Selecciona un producto para iniciar la venta
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {items.map((item) => (
              <li
                key={item.productId}
                className="rounded-lg border border-border bg-background p-3"
              >
                <div className="mb-2 flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-card-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      COP ${item.unitPrice.toFixed(2)} / {item.unit}
                    </p>
                  </div>
                  <button
                    onClick={() => onRemoveItem(item.productId)}
                    className="ml-2 flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    aria-label={`Eliminar ${item.name}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onUpdateQuantity(item.productId, item.unit === "kg" ? -0.5 : -1)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-card text-card-foreground hover:bg-muted"
                      aria-label="Disminuir cantidad"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="min-w-[40px] text-center text-sm font-semibold text-card-foreground">
                      {item.unit === "kg" ? `${item.quantity.toFixed(1)}` : item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.productId, item.unit === "kg" ? 0.5 : 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-card text-card-foreground hover:bg-muted"
                      aria-label="Aumentar cantidad"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                    <span className="text-xs text-muted-foreground">{item.unit}</span>
                  </div>
                  <span className="text-sm font-bold text-card-foreground">COP ${item.subtotal.toFixed(2)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Totals */}
      <div className="border-t border-border p-4">
        <div className="mb-3 flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Subtotal</span>
            <span>COP ${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            {isAdmin && onIvaChange ? (
              <button
                onClick={openIvaModal}
                className="flex items-center gap-1 text-primary hover:underline"
              >
                <Settings className="h-3 w-3" />
                IVA ({ivaRate}%)
              </button>
            ) : (
              <span>IVA ({ivaRate}%)</span>
            )}
            <span>COP ${tax.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-border pt-1.5 text-base font-bold text-card-foreground">
            <span>Total</span>
            <span className="text-primary">COP ${total.toFixed(2)}</span>
          </div>
        </div>

        <button
          onClick={onCheckout}
          disabled={items.length === 0}
          className={cn(
            "w-full rounded-xl py-3 text-sm font-semibold transition-colors",
            items.length > 0
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "cursor-not-allowed bg-muted text-muted-foreground"
          )}
        >
          Cobrar COP ${total.toFixed(2)}
        </button>
      </div>

      {/* IVA Modal */}
      {showIvaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-card-foreground">Configurar IVA</h3>
              <button
                onClick={() => setShowIvaModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-card-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="mb-4">
              <label htmlFor="iva-rate" className="mb-1 block text-xs font-medium text-card-foreground">
                Porcentaje de IVA (%)
              </label>
              <input
                id="iva-rate"
                type="number"
                step="0.5"
                min="0"
                max="100"
                value={tempIvaRate}
                onChange={(e) => setTempIvaRate(parseFloat(e.target.value) || 0)}
                className="h-10 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                autoFocus
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowIvaModal(false)}
                className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-card-foreground hover:bg-muted"
              >
                Cancelar
              </button>
              <button
                onClick={saveIvaRate}
                className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
