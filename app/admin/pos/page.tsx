"use client"

import { useState, useCallback } from "react"
import { ShoppingCart, CheckCircle, Banknote, CreditCard, X, Printer } from "lucide-react"
import { useInventory } from "@/lib/inventory-context"
import { ProductCatalog } from "@/components/pos/product-catalog"
import { SaleTicket } from "@/components/pos/sale-ticket"
import type { SaleItem, Sale } from "@/lib/inventory-data"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export default function PosPage() {
  const { addSale } = useInventory()
  const [ticketItems, setTicketItems] = useState<SaleItem[]>([])
  const [checkoutModal, setCheckoutModal] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<"efectivo" | "tarjeta">("efectivo")
  const [amountReceived, setAmountReceived] = useState("")
  const [completedSale, setCompletedSale] = useState<Sale | null>(null)
  const [ivaRate, setIvaRate] = useState(16)

  const subtotal = ticketItems.reduce((sum, item) => sum + item.subtotal, 0)
  const tax = subtotal * (ivaRate / 100)
  const total = subtotal + tax

  const handleAddItem = useCallback(
    (item: { id: string; name: string; price: number; unit: "kg" | "pza" }) => {
      setTicketItems((prev) => {
        const existing = prev.find((i) => i.productId === item.id)
        if (existing) {
          return prev.map((i) =>
            i.productId === item.id
              ? {
                  ...i,
                  quantity: i.quantity + (item.unit === "kg" ? 0.5 : 1),
                  subtotal: (i.quantity + (item.unit === "kg" ? 0.5 : 1)) * i.unitPrice,
                }
              : i
          )
        }
        const qty = item.unit === "kg" ? 1 : 1
        return [
          ...prev,
          {
            productId: item.id,
            name: item.name,
            quantity: qty,
            unitPrice: item.price,
            subtotal: qty * item.price,
            unit: item.unit,
          },
        ]
      })
    },
    []
  )

  const handleUpdateQuantity = useCallback((productId: string, delta: number) => {
    setTicketItems((prev) =>
      prev
        .map((i) => {
          if (i.productId !== productId) return i
          const newQty = Math.max(0, i.quantity + delta)
          return { ...i, quantity: newQty, subtotal: newQty * i.unitPrice }
        })
        .filter((i) => i.quantity > 0)
    )
  }, [])

  const handleRemoveItem = useCallback((productId: string) => {
    setTicketItems((prev) => prev.filter((i) => i.productId !== productId))
  }, [])

  const handleCheckout = () => {
    if (ticketItems.length === 0) return
    setCheckoutModal(true)
  }

  const handleConfirmPayment = async () => {
    if (paymentMethod === "efectivo") {
      const received = parseFloat(amountReceived)
      if (isNaN(received) || received < total) return
      
      try {
        const sale = await addSale(ticketItems, "efectivo", received)
        setCompletedSale(sale)
        toast.success(`Venta completada: ${sale.id}`, {
          description: `Total: COP $${sale.total.toLocaleString("es-CO", { minimumFractionDigits: 2 })}`,
        })
      } catch (err) {
        toast.error("Error al procesar la venta en el servidor")
        return
      }
    } else {
      try {
        const sale = await addSale(ticketItems, "tarjeta")
        setCompletedSale(sale)
        toast.success(`Venta completada: ${sale.id}`, {
          description: `Total: COP $${sale.total.toLocaleString("es-CO", { minimumFractionDigits: 2 })}`,
        })
      } catch (err) {
        toast.error("Error al procesar la venta en el servidor")
        return
      }
    }
    setTicketItems([])
    setCheckoutModal(false)
    setAmountReceived("")
  }

  const handleNewSale = () => {
    setCompletedSale(null)
  }

  // Quick amounts for cash payment
  const quickAmounts = [
    Math.ceil(total / 10) * 10,
    Math.ceil(total / 50) * 50,
    Math.ceil(total / 100) * 100,
    Math.ceil(total / 500) * 500,
  ].filter((v, i, a) => a.indexOf(v) === i && v >= total)

  return (
    <div className="flex h-[calc(100vh-56px)] flex-col lg:h-screen">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3 lg:px-6">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
            <ShoppingCart className="h-5 w-5 text-primary" />
            Punto de Venta
          </h2>
          <p className="text-xs text-muted-foreground">Registra ventas rapidamente</p>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
        {/* Product catalog */}
        <div className="flex-1 overflow-hidden p-4">
          <ProductCatalog onAddItem={handleAddItem} />
        </div>

        {/* Sale ticket */}
        <div className="h-80 w-full border-t border-border lg:h-auto lg:w-96 lg:border-l lg:border-t-0">
          <div className="h-full p-4">
            <SaleTicket
              items={ticketItems}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onCheckout={handleCheckout}
              ivaRate={ivaRate}
              onIvaChange={setIvaRate}
              isAdmin={true}
            />
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {checkoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h3 className="text-base font-semibold text-card-foreground">Cobrar Venta</h3>
              <button
                onClick={() => setCheckoutModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-card-foreground"
                aria-label="Cerrar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5">
              {/* Total */}
              <div className="mb-5 rounded-xl bg-primary/10 p-4 text-center">
                <p className="text-xs font-medium text-muted-foreground">Total a cobrar</p>
                <p className="text-3xl font-bold text-primary">COP ${total.toFixed(2)}</p>
              </div>

              {/* Payment method */}
              <div className="mb-5">
                <p className="mb-2 text-xs font-medium text-card-foreground">Metodo de Pago</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setPaymentMethod("efectivo")}
                    className={cn(
                      "flex flex-1 flex-col items-center gap-1.5 rounded-xl border p-4 transition-colors",
                      paymentMethod === "efectivo"
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border bg-card text-card-foreground hover:bg-muted"
                    )}
                  >
                    <Banknote className="h-6 w-6" />
                    <span className="text-sm font-medium">Efectivo</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod("tarjeta")}
                    className={cn(
                      "flex flex-1 flex-col items-center gap-1.5 rounded-xl border p-4 transition-colors",
                      paymentMethod === "tarjeta"
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border bg-card text-card-foreground hover:bg-muted"
                    )}
                  >
                    <CreditCard className="h-6 w-6" />
                    <span className="text-sm font-medium">Tarjeta</span>
                  </button>
                </div>
              </div>

              {/* Cash amount */}
              {paymentMethod === "efectivo" && (
                <div className="mb-5">
                  <label
                    htmlFor="cash-amount"
                    className="mb-1.5 block text-xs font-medium text-card-foreground"
                  >
                    Monto recibido
                  </label>
                  <input
                    id="cash-amount"
                    type="number"
                    step="0.01"
                    min={total}
                    value={amountReceived}
                    onChange={(e) => setAmountReceived(e.target.value)}
                    placeholder={`Min: COP $${total.toFixed(2)}`}
                    className="h-12 w-full rounded-xl border border-input bg-background px-4 text-lg font-semibold text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                    autoFocus
                  />

                  {/* Quick amounts */}
                  <div className="mt-2 flex flex-wrap gap-2">
                    {quickAmounts.slice(0, 4).map((amount) => (
                      <button
                        key={amount}
                        onClick={() => setAmountReceived(amount.toString())}
                        className="rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-xs font-medium text-card-foreground transition-colors hover:bg-muted"
                      >
                        COP ${amount}
                      </button>
                    ))}
                  </div>

                  {/* Change display */}
                  {amountReceived && parseFloat(amountReceived) >= total && (
                    <div className="mt-3 rounded-lg bg-primary/10 p-3 text-center">
                      <p className="text-xs text-muted-foreground">Cambio</p>
                      <p className="text-xl font-bold text-primary">
                        COP ${(parseFloat(amountReceived) - total).toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={handleConfirmPayment}
                disabled={
                  paymentMethod === "efectivo" &&
                  (!amountReceived || parseFloat(amountReceived) < total)
                }
                className={cn(
                  "w-full rounded-xl py-3 text-sm font-semibold transition-colors",
                  paymentMethod === "efectivo" &&
                    (!amountReceived || parseFloat(amountReceived) < total)
                    ? "cursor-not-allowed bg-muted text-muted-foreground"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
              >
                Confirmar Pago
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sale completed modal */}
      {completedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card shadow-2xl">
            <div className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-1 text-lg font-bold text-card-foreground">Venta Exitosa</h3>
              <p className="mb-4 text-sm text-muted-foreground">Folio: {completedSale.id}</p>

              <div className="mb-4 rounded-xl bg-muted/50 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-bold text-card-foreground">
                    COP ${completedSale.total.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Metodo</span>
                  <span className="font-medium capitalize text-card-foreground">
                    {completedSale.paymentMethod}
                  </span>
                </div>
                {completedSale.paymentMethod === "efectivo" && completedSale.change !== undefined && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Cambio</span>
                    <span className="font-bold text-primary">COP ${completedSale.change.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleNewSale}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-card-foreground hover:bg-muted"
                >
                  <Printer className="h-4 w-4" />
                  Imprimir
                </button>
                <button
                  onClick={handleNewSale}
                  className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  Nueva Venta
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
