"use client"

import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react"
import {
  type RevuelteriaProduct,
  type AbarrotesProduct,
  type Sale,
  type SaleItem,
  type FreshnessStatus,
  type Supplier,
  type SupplierStatus,
  type StockBatch,
  initialSuppliers,
} from "./inventory-data"
import { obtenerAbarrotes, obtenerRevuelteria, registrarMermaRevuelteria } from "@/app/acciones/productos"
import { addStockAction, updateFreshnessAction, addProductAction, updateProductAction, deleteProductAction } from "@/app/acciones/inventario"
import { registrarVentaAction, obtenerVentas } from "@/app/acciones/ventas"
import { obtenerProveedores, agregarProveedorAction, actualizarProveedorAction, eliminarProveedorAction } from "@/app/acciones/proveedores"
import { useAuth } from "./auth-context"

function getOldestBatchDate(batches?: StockBatch[]): string {
  if (!batches || batches.length === 0) return new Date().toISOString().split("T")[0]
  return batches.reduce((oldest, batch) => 
    batch.arrivalDate < oldest ? batch.arrivalDate : oldest
  , batches[0].arrivalDate)
}

function getOverallFreshness(batches?: StockBatch[]): FreshnessStatus {
  if (!batches || batches.length === 0) return "fresco"
  const hasBad = batches.some(b => b.freshness === "danado")
  return hasBad ? "danado" : "fresco"
}

function getAverageConfidence(batches?: StockBatch[]): number | undefined {
  if (!batches) return undefined
  const withConfidence = batches.filter(b => b.aiConfidence !== undefined)
  if (withConfidence.length === 0) return undefined
  const sum = withConfidence.reduce((acc, b) => acc + (b.aiConfidence || 0), 0)
  return Math.round(sum / withConfidence.length)
}

interface InventoryContextType {
  revuelteria: RevuelteriaProduct[]
  abarrotes: AbarrotesProduct[]
  sales: Sale[]
  suppliers: Supplier[]
  todaySalesTotal: number
  addSale: (items: SaleItem[], paymentMethod: "efectivo" | "tarjeta", amountReceived?: number) => Promise<Sale>
  updateFreshness: (productId: string, status: FreshnessStatus, confidence: number, batchId?: string) => Promise<void>
  registerLoss: (productId: string, amountKg: number) => Promise<void>
  addStock: (productId: string, amount: number, type: "revuelteria" | "abarrotes") => Promise<void>
  updateSupplierStatus: (supplierId: string, status: SupplierStatus) => Promise<void>
  addProduct: (product: any, type: "revuelteria" | "abarrotes") => Promise<void>
  updateProduct: (productId: string, updates: any, type: "revuelteria" | "abarrotes") => Promise<void>
  deleteProduct: (productId: string, type: "revuelteria" | "abarrotes") => Promise<void>
  addSupplier: (supplier: any) => Promise<void>
  updateSupplier: (id: string, updates: Partial<Supplier>) => Promise<void>
  deleteSupplier: (id: string) => Promise<void>
}

const InventoryContext = createContext<InventoryContextType | null>(null)

export function InventoryProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [revuelteria, setRevuelteria] = useState<RevuelteriaProduct[]>([])
  const [abarrotes, setAbarrotes] = useState<AbarrotesProduct[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers)

  useEffect(() => {
    async function initDBData() {
      try {
        const dbAbarrotes = await obtenerAbarrotes()
        const dbRevuelteria = await obtenerRevuelteria()
        const dbVentas = await obtenerVentas()
        const dbProveedores = await obtenerProveedores()
        setAbarrotes(dbAbarrotes)
        setRevuelteria(dbRevuelteria)
        setSales(dbVentas)
        setSuppliers(dbProveedores)
      } catch (err) {
        console.error("No se pudo cargar de la BD", err)
      }
    }
    initDBData()
  }, [])

  const todaySalesTotal = sales.reduce((sum, s) => sum + s.total, 0)

  const revuelteriaWithCalculated = useMemo(() => {
    return revuelteria.map(p => ({
      ...p,
      freshness: getOverallFreshness(p.batches),
      arrivalDate: getOldestBatchDate(p.batches),
      aiConfidence: getAverageConfidence(p.batches),
    }))
  }, [revuelteria])

  const addSale = useCallback(
    async (items: SaleItem[], paymentMethod: "efectivo" | "tarjeta", amountReceived?: number): Promise<Sale> => {
      if (!user) throw new Error("Debes iniciar sesión para registrar una venta")

      // Enviar la venta a la base de datos real (transaccional)
      const { saleId } = await registrarVentaAction(user.id, items, paymentMethod, amountReceived)

      const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0)
      const tax = subtotal * 0.16
      const total = subtotal + tax
      const now = new Date()

      const sale: Sale = {
        id: saleId,
        items,
        subtotal,
        tax,
        total,
        paymentMethod,
        amountReceived,
        change: amountReceived ? amountReceived - total : 0,
        date: now.toLocaleDateString("es-CO"),
        time: now.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }),
      }

      // Deduct stock using FIFO
      for (const item of items) {
        if (item.unit === "kg") {
          setRevuelteria((prev) =>
            prev.map((p) => {
              if (p.id !== item.productId) return p
              
              let remaining = item.quantity
              const newBatches = [...p.batches].sort((a, b) => 
                a.arrivalDate.localeCompare(b.arrivalDate)
              )
              
              const updatedBatches = newBatches.map(batch => {
                if (remaining <= 0) return batch
                if (batch.quantity <= remaining) {
                  remaining -= batch.quantity
                  return { ...batch, quantity: 0 }
                } else {
                  const newQty = batch.quantity - remaining
                  remaining = 0
                  return { ...batch, quantity: newQty }
                }
              }).filter(b => b.quantity > 0)
              
              const totalRemaining = updatedBatches.reduce((sum, b) => sum + b.quantity, 0)
              
              return { ...p, batches: updatedBatches, stockKg: totalRemaining }
            })
          )
        } else {
          setAbarrotes((prev) =>
            prev.map((p) =>
              p.id === item.productId
                ? { ...p, stock: Math.max(0, p.stock - item.quantity) }
                : p
            )
          )
        }
      }

      setSales((prev) => [sale, ...prev])
      return sale
    },
    [user]
  )

  const updateFreshness = useCallback(
    async (productId: string, status: FreshnessStatus, confidence: number, batchId?: string) => {
      await updateFreshnessAction(productId, status, confidence, batchId)
      setRevuelteria((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p
        
        const today = new Date().toISOString().split("T")[0]
        
        if (batchId) {
          // Update specific batch
          const updatedBatches = p.batches.map(b => 
            b.id === batchId 
              ? { ...b, freshness: status, aiConfidence: confidence, aiLastScan: today }
              : b
          )
          return { ...p, batches: updatedBatches }
        } else {
          // Update all batches
          const updatedBatches = p.batches.map(b => ({
            ...b,
            freshness: status,
            aiConfidence: confidence,
            aiLastScan: today
          }))
          return { ...p, batches: updatedBatches }
        }
      })
    )
  }, [])

  const registerLoss = useCallback(async (productId: string, amountKg: number) => {
    await registrarMermaRevuelteria(productId, amountKg)
    setRevuelteria((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p
        
        let remaining = amountKg
        const sortedBatches = [...p.batches].sort((a, b) => 
          a.arrivalDate.localeCompare(b.arrivalDate)
        )
        
        const updatedBatches = sortedBatches.map(batch => {
          if (remaining <= 0) return batch
          if (batch.quantity <= remaining) {
            remaining -= batch.quantity
            return { ...batch, quantity: 0 }
          } else {
            const newQty = batch.quantity - remaining
            remaining = 0
            return { ...batch, quantity: newQty }
          }
        }).filter(b => b.quantity > 0)
        
        const totalRemaining = updatedBatches.reduce((sum, b) => sum + b.quantity, 0)
        
        return { ...p, batches: updatedBatches, stockKg: totalRemaining }
      })
    )
  }, [])

  const updateSupplierStatus = useCallback(async (supplierId: string, status: SupplierStatus) => {
    await actualizarProveedorAction(supplierId, { status })
    setSuppliers((prev) =>
      prev.map((s) => (s.id === supplierId ? { ...s, status } : s))
    )
  }, [])

  const addSupplier = useCallback(async (supplier: any) => {
    const newId = await agregarProveedorAction(supplier)
    setSuppliers((prev) => [{ ...supplier, id: newId } as Supplier, ...prev])
  }, [])

  const updateSupplier = useCallback(async (id: string, updates: Partial<Supplier>) => {
    await actualizarProveedorAction(id, updates)
    setSuppliers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    )
  }, [])

  const deleteSupplier = useCallback(async (id: string) => {
    await eliminarProveedorAction(id)
    setSuppliers((prev) => prev.filter((s) => s.id !== id))
  }, [])

  const addStock = useCallback(async (productId: string, amount: number, type: "revuelteria" | "abarrotes") => {
    await addStockAction(productId, amount, type)
    if (type === "revuelteria") {
      setRevuelteria((prev) =>
        prev.map((p) => {
          if (p.id !== productId) return p
          
          const today = new Date().toISOString().split("T")[0]
          const newBatch: StockBatch = {
            id: `b-${Date.now()}`,
            quantity: amount,
            arrivalDate: today,
            freshness: "fresco"
          }
          
          return {
            ...p,
            stockKg: p.stockKg + amount,
            batches: [...p.batches, newBatch]
          }
        })
      )
    } else {
      setAbarrotes((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, stock: p.stock + amount } : p))
      )
    }
  }, [])

  const addProduct = useCallback(async (product: any, type: "revuelteria" | "abarrotes") => {
    const newId = await addProductAction(product, type)
    if (type === "abarrotes") {
      setAbarrotes((prev) => [...prev, { ...product, id: newId }])
    } else {
      setRevuelteria((prev) => [
        ...prev,
        {
          ...product,
          id: newId,
          batches: product.stockKg > 0 ? [{
            id: `b-${Date.now()}-${newId}`,
            quantity: product.stockKg,
            arrivalDate: product.arrivalDate || new Date().toISOString().split('T')[0],
            freshness: product.freshness || "fresco"
          }] : []
        },
      ])
    }
  }, [])

  const updateProduct = useCallback(async (productId: string, updates: any, type: "revuelteria" | "abarrotes") => {
    await updateProductAction(productId, updates, type)
    if (type === "abarrotes") {
      setAbarrotes((prev) => prev.map((p) => (p.id === productId ? { ...p, ...updates } : p)))
    } else {
      setRevuelteria((prev) => prev.map((p) => (p.id === productId ? { ...p, ...updates } : p)))
    }
  }, [])

  const deleteProduct = useCallback(async (productId: string, type: "revuelteria" | "abarrotes") => {
    await deleteProductAction(productId, type)
    if (type === "abarrotes") {
      setAbarrotes((prev) => prev.filter((p) => p.id !== productId))
    } else {
      setRevuelteria((prev) => prev.filter((p) => p.id !== productId))
    }
  }, [])

  return (
    <InventoryContext.Provider
      value={{
        revuelteria: revuelteriaWithCalculated,
        abarrotes,
        sales,
        suppliers,
        todaySalesTotal,
        addSale,
        updateFreshness,
        registerLoss,
        addStock,
        updateSupplierStatus,
        addProduct,
        updateProduct,
        deleteProduct,
        addSupplier,
        updateSupplier,
        deleteSupplier,
      }}
    >
      {children}
    </InventoryContext.Provider>
  )
}

export function useInventory() {
  const ctx = useContext(InventoryContext)
  if (!ctx) throw new Error("useInventory must be used within InventoryProvider")
  return ctx
}
