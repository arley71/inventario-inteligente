"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import Image from "next/image"
import { Search, Package, AlertTriangle, Plus, Minus, X, Upload, ImageIcon, ChevronDown, Check, Pencil, Trash2 } from "lucide-react"
import { useInventory } from "@/lib/inventory-context"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function AbarrotesPage() {
  const { abarrotes, addStock, addProduct, updateProduct, deleteProduct } = useInventory()
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [stockModal, setStockModal] = useState<{ id: string; name: string; currentStock: number } | null>(null)
  const [stockAmount, setStockAmount] = useState("")
  const [addProductModal, setAddProductModal] = useState(false)
  const [editProduct, setEditProduct] = useState<typeof abarrotes[0] | null>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<typeof abarrotes[0] | null>(null)
  const [newProductImage, setNewProductImage] = useState<string | null>(null)
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false)
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    stock: "",
    sku: "",
    minStock: "",
    category: "",
  })

  const categoryInputRef = useRef<HTMLDivElement>(null)

  const existingCategories = useMemo(() => {
    const cats = new Set(abarrotes.map((p) => p.category.toLowerCase()))
    return Array.from(cats)
  }, [abarrotes])

  const filteredCategories = useMemo(() => {
    if (!newProduct.category) return existingCategories.slice(0, 5)
    const input = newProduct.category.toLowerCase()
    return existingCategories.filter(c => c.includes(input)).slice(0, 5)
  }, [existingCategories, newProduct.category])

  const showCreateNew = newProduct.category &&
    !existingCategories.includes(newProduct.category.toLowerCase())

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryInputRef.current && !categoryInputRef.current.contains(event.target as Node)) {
        setCategoryDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const categories = useMemo(() => {
    const cats = new Set(abarrotes.map((p) => p.category))
    return ["all", ...Array.from(cats)]
  }, [abarrotes])

  const filtered = useMemo(() => {
    return abarrotes.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase())
      const matchCategory = categoryFilter === "all" || p.category === categoryFilter
      return matchSearch && matchCategory
    })
  }, [abarrotes, search, categoryFilter])

  const handleAddStock = async () => {
    if (!stockModal || !stockAmount) return
    const amount = parseInt(stockAmount, 10)
    if (isNaN(amount) || amount <= 0) return
    await addStock(stockModal.id, amount, "abarrotes")
    setStockModal(null)
    setStockAmount("")
  }

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-foreground lg:text-2xl">
            <Package className="h-6 w-6 text-chart-5" />
            Abarrotes
          </h2>
          <p className="text-sm text-muted-foreground">Productos empacados y de almacen</p>
        </div>

        {/* Search */}
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nombre o SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-xl border border-input bg-card pl-10 pr-4 text-sm text-card-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
          />
        </div>
      </div>

      {/* Category filter */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${categoryFilter === cat
              ? "bg-chart-5 text-primary-foreground"
              : "border border-border bg-card text-card-foreground hover:bg-muted"
              }`}
          >
            {cat === "all" ? "Todos" : cat}
          </button>
        ))}
        <button
          onClick={() => setAddProductModal(true)}
          className="ml-auto flex items-center gap-1.5 rounded-lg bg-chart-5 px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-chart-5/90"
        >
          <Plus className="h-4 w-4" />
          Agregar producto
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Producto
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  SKU
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Categoria
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Precio
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Stock
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Estado
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((product) => {
                const isLow = product.stock <= product.minStock
                const isCritical = product.stock <= product.minStock / 2
                return (
                  <tr key={product.id} className="transition-colors hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Image
                          src={product.image}
                          alt={product.name}
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                        <span className="text-sm font-medium text-card-foreground">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-muted-foreground">{product.sku}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-card-foreground">
                      COP ${product.price.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={cn(
                          "text-sm font-semibold",
                          isCritical ? "text-destructive" : isLow ? "text-warning-foreground" : "text-card-foreground"
                        )}
                      >
                        {product.stock} pzas
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {isCritical ? (
                        <span className="inline-flex items-center gap-1 rounded-md border border-destructive/30 bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive">
                          <AlertTriangle className="h-3 w-3" />
                          Critico
                        </span>
                      ) : isLow ? (
                        <span className="inline-flex items-center gap-1 rounded-md border border-warning/30 bg-warning/10 px-2 py-0.5 text-xs font-semibold text-warning-foreground">
                          <AlertTriangle className="h-3 w-3" />
                          Bajo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                          OK
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() =>
                            setStockModal({
                              id: product.id,
                              name: product.name,
                              currentStock: product.stock,
                            })
                          }
                          className="inline-flex items-center gap-1 rounded-lg border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
                        >
                          <Plus className="h-3 w-3" />
                          Reabastecer
                        </button>
                        <button
                          onClick={() => { setEditProduct(product); setEditModalOpen(true) }}
                          className="inline-flex items-center rounded-lg border border-chart-5/30 bg-chart-5/5 px-2 py-1.5 text-xs font-medium text-chart-5 transition-colors hover:bg-chart-5/10"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(product)}
                          className="inline-flex items-center rounded-lg border border-destructive/30 bg-destructive/5 px-2 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <Search className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No se encontraron productos.</p>
          </div>
        )}
      </div>

      {/* Stock Modal */}
      {stockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <h3 className="mb-1 text-base font-semibold text-card-foreground">Reabastecer Producto</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              {stockModal.name} - Stock actual: {stockModal.currentStock} pzas
            </p>

            <div className="mb-4">
              <label htmlFor="stock-amount" className="mb-1 block text-xs font-medium text-card-foreground">
                Cantidad a agregar (piezas)
              </label>
              <input
                id="stock-amount"
                type="number"
                step="1"
                min="1"
                value={stockAmount}
                onChange={(e) => setStockAmount(e.target.value)}
                placeholder="Ej: 20"
                className="h-10 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                autoFocus
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setStockModal(null)
                  setStockAmount("")
                }}
                className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-card-foreground hover:bg-muted"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddStock}
                className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
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
                    price: "",
                    stock: "",
                    sku: "",
                    minStock: "",
                    category: "",
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
                  placeholder="Ej: Leche Entera 1L"
                  className="h-10 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-card-foreground">
                  SKU *
                </label>
                <input
                  type="text"
                  value={newProduct.sku}
                  onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                  placeholder="Ej: ABR-007"
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
                  <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-chart-5/30 bg-chart-5/5 px-4 py-2 text-sm font-medium text-chart-5 transition-colors hover:bg-chart-5/10">
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
                    Precio *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                      placeholder="0.00"
                      className="h-10 w-full rounded-xl border border-input bg-background pl-7 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-card-foreground">
                    Stock inicial *
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    placeholder="0"
                    className="h-10 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-card-foreground">
                    Stock mínimo *
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={newProduct.minStock}
                    onChange={(e) => setNewProduct({ ...newProduct, minStock: e.target.value })}
                    placeholder="0"
                    className="h-10 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                  />
                </div>

                <div ref={categoryInputRef} className="relative">
                  <label className="mb-1 block text-xs font-medium text-card-foreground">
                    Categoria *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={newProduct.category}
                      onChange={(e) => {
                        setNewProduct({ ...newProduct, category: e.target.value })
                        setCategoryDropdownOpen(true)
                      }}
                      onFocus={() => setCategoryDropdownOpen(true)}
                      placeholder="Escribe o selecciona una categoria"
                      className="h-10 w-full rounded-xl border border-input bg-background px-4 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                    />
                    <button
                      type="button"
                      onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <ChevronDown className={cn("h-4 w-4 transition-transform", categoryDropdownOpen && "rotate-180")} />
                    </button>
                  </div>

                  {categoryDropdownOpen && (
                    <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-border bg-card shadow-lg">
                      {filteredCategories.length > 0 && (
                        <div className="p-1">
                          {filteredCategories.map((cat) => (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => {
                                setNewProduct({ ...newProduct, category: cat.charAt(0).toUpperCase() + cat.slice(1) })
                                setCategoryDropdownOpen(false)
                              }}
                              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-card-foreground hover:bg-muted"
                            >
                              <span>{cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
                              {newProduct.category.toLowerCase() === cat && <Check className="h-4 w-4 text-primary" />}
                            </button>
                          ))}
                        </div>
                      )}

                      {showCreateNew && (
                        <div className="border-t border-border p-1">
                          <button
                            type="button"
                            onClick={() => {
                              const newCat = newProduct.category.trim()
                              if (newCat) {
                                setNewProduct({ ...newProduct, category: newCat.charAt(0).toUpperCase() + newCat.slice(1) })
                                setCategoryDropdownOpen(false)
                              }
                            }}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-primary hover:bg-muted"
                          >
                            <Plus className="h-4 w-4" />
                            Crear "{newProduct.category}"
                          </button>
                        </div>
                      )}

                      {!showCreateNew && filteredCategories.length === 0 && newProduct.category && (
                        <div className="p-2 text-xs text-muted-foreground text-center">
                          Escribe para crear una nueva categoria
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setAddProductModal(false)
                  setNewProductImage(null)
                  setNewProduct({
                    name: "",
                    price: "",
                    stock: "",
                    sku: "",
                    minStock: "",
                    category: "",
                  })
                }}
                className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-card-foreground transition-colors hover:bg-muted"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  const newProd = {
                    name: newProduct.name,
                    image: newProductImage || "/images/placeholder.jpg",
                    price: parseFloat(newProduct.price),
                    stock: parseInt(newProduct.stock, 10),
                    sku: newProduct.sku,
                    minStock: parseInt(newProduct.minStock, 10),
                    category: newProduct.category,
                    unit: "pza" as const,
                  }
                  await addProduct(newProd, "abarrotes")
                  toast.success("Producto agregado correctamente")
                  setAddProductModal(false)
                  setNewProductImage(null)
                  setNewProduct({
                    name: "",
                    price: "",
                    stock: "",
                    sku: "",
                    minStock: "",
                    category: "",
                  })
                }}
                disabled={!newProduct.name || !newProduct.sku || !newProduct.price || !newProduct.stock || !newProduct.minStock || !newProduct.category}
                className="flex-1 rounded-xl bg-chart-5 px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-chart-5/90 disabled:cursor-not-allowed disabled:opacity-50"
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

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-card-foreground">
                  Nombre del producto
                </label>
                <input
                  type="text"
                  id="edit-name"
                  defaultValue={editProduct.name}
                  className="h-10 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-card-foreground">
                  Precio (COP)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    id="edit-price"
                    defaultValue={editProduct.price}
                    className="h-10 w-full rounded-xl border border-input bg-background pl-7 pr-4 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => { setEditModalOpen(false); setEditProduct(null) }}
                className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-card-foreground hover:bg-muted"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  const nameInput = document.getElementById("edit-name") as HTMLInputElement
                  const priceInput = document.getElementById("edit-price") as HTMLInputElement
                  if (nameInput && priceInput) {
                    await updateProduct(editProduct.id, {
                      name: nameInput.value,
                      price: parseFloat(priceInput.value),
                    }, "abarrotes")
                    toast.success("Producto actualizado correctamente")
                    setEditModalOpen(false)
                    setEditProduct(null)
                  }
                }}
                className="flex-1 rounded-xl bg-chart-5 px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-chart-5/90"
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
            <div className="mb-4 flex items-center justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <Trash2 className="h-6 w-6 text-destructive" />
              </div>
            </div>
            <h3 className="mb-2 text-center text-lg font-semibold text-card-foreground">Eliminar Producto</h3>
            <p className="mb-4 text-center text-sm text-muted-foreground">
              ¿Estás seguro de que deseas eliminar "{deleteConfirm.name}"? Esta acción no se puede deshacer.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-card-foreground hover:bg-muted"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  await deleteProduct(deleteConfirm.id, "abarrotes")
                  toast.success("Producto eliminado correctamente")
                  setDeleteConfirm(null)
                }}
                className="flex-1 rounded-xl bg-destructive px-4 py-2.5 text-sm font-semibold text-destructive-foreground hover:bg-destructive/90"
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
