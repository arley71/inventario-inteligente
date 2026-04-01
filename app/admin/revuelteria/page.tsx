"use client"

import { useState, useMemo } from "react"
import { Search, Leaf, Apple, Plus, X, Upload, ImageIcon, Camera } from "lucide-react"
import { useInventory } from "@/lib/inventory-context"
import { ProductCard } from "@/components/revuelteria/product-card"
import { AiScanner } from "@/components/revuelteria/ai-scanner"
import type { RevuelteriaProduct, FreshnessStatus } from "@/lib/inventory-data"
import { toast } from "sonner"

export default function RevuelteriaPage() {
  const { revuelteria, updateFreshness, registerLoss, addStock, updateProduct, deleteProduct, addProduct } = useInventory()
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<"all" | "fruta" | "verdura">("all")
  const [scanningProduct, setScanningProduct] = useState<RevuelteriaProduct | null>(null)
  const [showProductSelect, setShowProductSelect] = useState(false)
  const [actionModal, setActionModal] = useState<{
    type: "loss" | "stock"
    product: RevuelteriaProduct
  } | null>(null)
  const [actionAmount, setActionAmount] = useState("")
  const [addProductModal, setAddProductModal] = useState(false)
  const [newProductImage, setNewProductImage] = useState<string | null>(null)
  const [newProduct, setNewProduct] = useState({
    name: "",
    pricePerKg: "",
    stockKg: "",
    freshness: "fresco" as FreshnessStatus,
    arrivalDate: new Date().toISOString().split("T")[0],
    category: "fruta" as "fruta" | "verdura",
  })
  const [editProduct, setEditProduct] = useState<RevuelteriaProduct | null>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<RevuelteriaProduct | null>(null)

  const filtered = useMemo(() => {
    return revuelteria.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
      const matchCategory = categoryFilter === "all" || p.category === categoryFilter
      return matchSearch && matchCategory
    })
  }, [revuelteria, search, categoryFilter])

  const handleSaveAnalysis = (productId: string, status: FreshnessStatus, confidence: number, batchId?: string) => {
    updateFreshness(productId, status, confidence, batchId)
  }

  const handleConfirmAction = async () => {
    if (!actionModal || !actionAmount) return
    const amount = parseFloat(actionAmount)
    if (isNaN(amount) || amount <= 0) return

    if (actionModal.type === "loss") {
      await registerLoss(actionModal.product.id, amount)
      toast.success("Merma registrada", { description: "Se reportó a la base de datos." })
    } else {
      await addStock(actionModal.product.id, amount, "revuelteria")
      toast.success("Stock agregado", { description: "Se registró exitosamente." })
    }
    setActionModal(null)
    setActionAmount("")
  }

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-foreground lg:text-2xl">
            <Leaf className="h-6 w-6 text-primary" />
            Revuelteria
          </h2>
          <p className="text-sm text-muted-foreground">Frutas, verduras y productos frescos</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6 relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar producto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 w-full rounded-xl border border-input bg-card pl-10 pr-4 text-sm text-card-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
        />
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        {[
          { value: "all" as const, label: "Todos", icon: null },
          { value: "fruta" as const, label: "Frutas", icon: Apple },
          { value: "verdura" as const, label: "Verduras", icon: Leaf },
        ].map((filter) => (
          <button
            key={filter.value}
            onClick={() => setCategoryFilter(filter.value)}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${categoryFilter === filter.value
              ? "bg-primary text-primary-foreground"
              : "bg-card text-card-foreground border border-border hover:bg-muted"
              }`}
          >
            {filter.icon && <filter.icon className="h-3.5 w-3.5" />}
            {filter.label}
          </button>
        ))}
        <button
          onClick={() => setAddProductModal(true)}
          className="ml-auto flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Agregar producto
        </button>
        <button
          onClick={() => setShowProductSelect(true)}
          className="flex items-center gap-1.5 rounded-lg bg-chart-2 px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-chart-2/90"
        >
          <Camera className="h-4 w-4" />
          Analizar calidad
        </button>
      </div>

      {/* Products grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onRegisterLoss={(p) => setActionModal({ type: "loss", product: p })}
            onAddStock={(p) => setActionModal({ type: "stock", product: p })}
            showAdminActions={true}
            onEdit={(p) => { setEditProduct(p); setEditModalOpen(true) }}
            onDelete={(p) => setDeleteConfirm(p)}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-16 text-center">
          <Search className="h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No se encontraron productos.</p>
        </div>
      )}

      {/* Product Selection Modal for Analysis */}
      {showProductSelect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md max-h-[80vh] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <h3 className="text-sm font-semibold text-card-foreground">Seleccionar Producto</h3>
                <p className="text-xs text-muted-foreground">Elige un producto para analizar</p>
              </div>
              <button
                onClick={() => setShowProductSelect(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-card-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="border-b border-border px-4 pb-3">
              <input
                type="text"
                placeholder="Buscar producto..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm text-card-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none"
              />
            </div>
            <div className="overflow-y-auto p-2" style={{ maxHeight: 'calc(80vh - 140px)' }}>
              <div className="space-y-1">
                {filtered.length === 0 ? (
                  <p className="p-4 text-center text-sm text-muted-foreground">No se encontraron productos</p>
                ) : (
                  filtered.map((product) => {
                    const freshness = product.freshness || (product.batches?.some(b => b.freshness === "danado") ? "danado" : "fresco")
                    return (
                      <button
                        key={product.id}
                        onClick={() => {
                          setShowProductSelect(false)
                          setScanningProduct(product)
                          setSearch("")
                        }}
                        className="flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-muted"
                      >
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-card-foreground truncate">{product.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {product.batches?.length || 1} lote(s) •
                            <span className={freshness === "fresco" ? "text-primary" : "text-destructive ml-1"}>
                              {freshness === "fresco" ? "Bueno" : "Malo"}
                            </span>
                          </p>
                        </div>
                      </button>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Scanner Modal */}
      {scanningProduct && (
        <AiScanner
          product={scanningProduct}
          onClose={() => {
            setScanningProduct(null)
            setSearch("")
          }}
          onSave={handleSaveAnalysis}
        />
      )}

      {/* Action Modal (Loss / Add Stock) */}
      {actionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <h3 className="mb-1 text-base font-semibold text-card-foreground">
              {actionModal.type === "loss" ? "Registrar Merma" : "Agregar Stock"}
            </h3>
            <p className="mb-4 text-sm text-muted-foreground">
              {actionModal.product.name} - Stock actual: {actionModal.product.stockKg.toFixed(1)} kg
            </p>

            <div className="mb-4">
              <label htmlFor="action-amount" className="mb-1 block text-xs font-medium text-card-foreground">
                Cantidad (kg)
              </label>
              <input
                id="action-amount"
                type="number"
                step="0.1"
                min="0"
                value={actionAmount}
                onChange={(e) => setActionAmount(e.target.value)}
                placeholder="Ej: 2.5"
                className="h-10 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                autoFocus
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setActionModal(null)
                  setActionAmount("")
                }}
                className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-card-foreground hover:bg-muted"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmAction}
                className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors ${actionModal.type === "loss"
                  ? "bg-destructive hover:bg-destructive/90"
                  : "bg-primary hover:bg-primary/90"
                  }`}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {addProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-card-foreground">Agregar Nuevo Producto</h3>
              <button
                onClick={() => {
                  setAddProductModal(false)
                  setNewProductImage(null)
                  setNewProduct({
                    name: "",
                    pricePerKg: "",
                    stockKg: "",
                    freshness: "fresco",
                    arrivalDate: new Date().toISOString().split("T")[0],
                    category: "fruta",
                  })
                }}
                className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-card-foreground">
                  Nombre del producto *
                </label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="Ej: Mango Manila"
                  className="h-10 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-card-foreground">
                  Imagen del producto
                </label>
                <div className="flex flex-col items-center gap-3">
                  <div className="relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-input bg-muted/30">
                    {newProductImage ? (
                      <>
                        <img
                          src={newProductImage}
                          alt="Preview"
                          className="h-full w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setNewProductImage(null)}
                          className="absolute right-1 top-1 rounded-full bg-destructive/90 p-1 text-white transition-colors hover:bg-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-muted-foreground">
                        <ImageIcon className="h-8 w-8" />
                        <span className="text-xs">Sin imagen</span>
                      </div>
                    )}
                  </div>
                  <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10">
                    <Upload className="h-4 w-4" />
                    <span>Seleccionar imagen</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          const reader = new FileReader()
                          reader.onloadend = () => {
                            setNewProductImage(reader.result as string)
                          }
                          reader.readAsDataURL(file)
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-card-foreground">
                    Precio por kg *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={newProduct.pricePerKg}
                      onChange={(e) => setNewProduct({ ...newProduct, pricePerKg: e.target.value })}
                      placeholder="0.00"
                      className="h-10 w-full rounded-xl border border-input bg-background pl-7 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-card-foreground">
                    Stock (kg) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={newProduct.stockKg}
                    onChange={(e) => setNewProduct({ ...newProduct, stockKg: e.target.value })}
                    placeholder="0.0"
                    className="h-10 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-card-foreground">
                    Categoria *
                  </label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value as "fruta" | "verdura" })}
                    className="h-10 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                  >
                    <option value="fruta">Fruta</option>
                    <option value="verdura">Verdura</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-card-foreground">
                    Estado de frescura
                  </label>
                  <select
                    value={newProduct.freshness}
                    onChange={(e) => setNewProduct({ ...newProduct, freshness: e.target.value as FreshnessStatus })}
                    className="h-10 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                  >
                    <option value="fresco">Bueno</option>
                    <option value="danado">Malo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-card-foreground">
                  Fecha de llegada
                </label>
                <input
                  type="date"
                  value={newProduct.arrivalDate}
                  onChange={(e) => setNewProduct({ ...newProduct, arrivalDate: e.target.value })}
                  className="h-10 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setAddProductModal(false)
                  setNewProductImage(null)
                  setNewProduct({
                    name: "",
                    pricePerKg: "",
                    stockKg: "",
                    freshness: "fresco",
                    arrivalDate: new Date().toISOString().split("T")[0],
                    category: "fruta",
                  })
                }}
                className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-card-foreground transition-colors hover:bg-muted"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  setAddProductModal(false)
                  await addProduct({ ...newProduct, image: newProductImage || "/images/placeholder.jpg", unit: "kg" }, "revuelteria")
                  toast.success("Producto agregado correctamente")
                  setNewProductImage(null)
                  setNewProduct({
                    name: "",
                    pricePerKg: "",
                    stockKg: "",
                    freshness: "fresco",
                    arrivalDate: new Date().toISOString().split("T")[0],
                    category: "fruta",
                  })
                }}
                disabled={!newProduct.name || !newProduct.pricePerKg || !newProduct.stockKg}
                className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Agregar producto
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editModalOpen && editProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <h3 className="mb-4 text-lg font-semibold text-card-foreground">Editar Producto</h3>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-card-foreground">Nombre</label>
                <input
                  type="text"
                  defaultValue={editProduct.name}
                  id="edit-name"
                  className="h-10 w-full rounded-xl border border-input bg-background px-4 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-card-foreground">Precio por kg</label>
                <input
                  type="number"
                  step="0.01"
                  defaultValue={editProduct.pricePerKg}
                  id="edit-price"
                  className="h-10 w-full rounded-xl border border-input bg-background px-4 text-sm"
                />
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => { setEditModalOpen(false); setEditProduct(null) }}
                className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  const name = (document.getElementById("edit-name") as HTMLInputElement).value
                  const price = parseFloat((document.getElementById("edit-price") as HTMLInputElement).value)
                  if (name && !isNaN(price)) {
                    await updateProduct(editProduct.id, { name, pricePerKg: price }, "revuelteria")
                    toast.success("Producto actualizado correctamente")
                    setEditModalOpen(false)
                    setEditProduct(null)
                  }
                }}
                className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <h3 className="mb-2 text-lg font-semibold text-card-foreground">Eliminar Producto</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Esta seguro de que desea eliminar <strong>{deleteConfirm.name}</strong>? Esta accion no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  await deleteProduct(deleteConfirm.id, "revuelteria")
                  toast.success("Producto eliminado correctamente")
                  setDeleteConfirm(null)
                }}
                className="flex-1 rounded-xl bg-destructive px-4 py-2.5 text-sm font-semibold text-white"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
