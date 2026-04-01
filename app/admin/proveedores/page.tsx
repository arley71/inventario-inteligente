"use client"

import { useState, useMemo } from "react"
import { Users, Plus, X, Leaf, Package, ArrowUpDown, Pencil, Trash2, ChevronDown } from "lucide-react"
import { useInventory } from "@/lib/inventory-context"
import { SupplierCard } from "@/components/proveedores/supplier-card"
import { SupplierDetail } from "@/components/proveedores/supplier-detail"
import { cn } from "@/lib/utils"
import type { Supplier, SupplierStatus } from "@/lib/inventory-data"
import { toast } from "sonner"

const weekDays = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"]

export default function ProveedoresPage() {
  const { suppliers, updateSupplierStatus, revuelteria, abarrotes, addSupplier, updateSupplier, deleteSupplier } = useInventory()

  const existingProducts = useMemo(() => {
    const products = [...revuelteria.map(p => p.name), ...abarrotes.map(p => p.name)]
    return [...new Set(products)].sort()
  }, [revuelteria, abarrotes])

  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [statusFilter, setStatusFilter] = useState<"all" | SupplierStatus>("all")
  const [typeFilter, setTypeFilter] = useState<"all" | "revuelteria" | "abarrotes" | "ambos">("all")
  const [addModal, setAddModal] = useState(false)
  const [editModal, setEditModal] = useState<Supplier | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Supplier | null>(null)
  const [addDeliveryDaysOpen, setAddDeliveryDaysOpen] = useState(false)
  const [editDeliveryDaysOpen, setEditDeliveryDaysOpen] = useState(false)
  const [selectedDays, setSelectedDays] = useState<string[]>([])
  const [editSelectedDays, setEditSelectedDays] = useState<string[]>([])
  const [addProductDropdownOpen, setAddProductDropdownOpen] = useState(false)
  const [editProductDropdownOpen, setEditProductDropdownOpen] = useState(false)
  const [newProductInput, setNewProductInput] = useState("")

  const [newSupplier, setNewSupplier] = useState({
    name: "",
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    rfc: "",
    type: "revuelteria" as "revuelteria" | "abarrotes" | "ambos",
    status: "activo" as SupplierStatus,
    productsSupplied: [] as string[],
    rating: 5,
    deliveryDays: "",
    paymentTerms: "",
    notes: "",
  })

  const [addProductSearch, setAddProductSearch] = useState("")
  const [editProductSearch, setEditProductSearch] = useState("")

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((s) => {
      const matchStatus = statusFilter === "all" || s.status === statusFilter
      const matchType = typeFilter === "all" || s.type === typeFilter
      return matchStatus && matchType
    })
  }, [suppliers, statusFilter, typeFilter])

  const handleUpdateStatus = async (supplierId: string, status: SupplierStatus) => {
    await updateSupplierStatus(supplierId, status)
    if (selectedSupplier?.id === supplierId) {
      setSelectedSupplier({ ...selectedSupplier, status })
    }
    if (editModal?.id === supplierId) {
      setEditModal({ ...editModal, status })
    }
  }

  const handleDeleteSupplier = async (supplierId: string) => {
    await deleteSupplier(supplierId)
    setDeleteConfirm(null)
    if (selectedSupplier?.id === supplierId) {
      setSelectedSupplier(null)
    }
    toast.success("Proveedor eliminado correctamente")
  }

  const handleEditSupplier = async (supplier: Supplier) => {
    await updateSupplier(supplier.id, supplier)
    setEditModal(null)
    setSelectedSupplier(supplier)
    toast.success("Proveedor actualizado correctamente")
  }

  const handleAddProductToSupplier = (product: string, isEdit: boolean) => {
    if (isEdit && editModal) {
      setEditModal({ ...editModal, productsSupplied: [...editModal.productsSupplied, product] })
    } else {
      setNewSupplier({ ...newSupplier, productsSupplied: [...newSupplier.productsSupplied, product] })
    }
  }

  const handleRemoveProductFromSupplier = (index: number, isEdit: boolean) => {
    if (isEdit && editModal) {
      setEditModal({ ...editModal, productsSupplied: editModal.productsSupplied.filter((_, i) => i !== index) })
    } else {
      setNewSupplier({ ...newSupplier, productsSupplied: newSupplier.productsSupplied.filter((_, i) => i !== index) })
    }
  }

  const filteredExistingProducts = (isEdit: boolean) => {
    const currentProducts = isEdit && editModal ? editModal.productsSupplied : newSupplier.productsSupplied
    const searchTerm = isEdit ? editProductSearch.toLowerCase() : addProductSearch.toLowerCase()
    return existingProducts.filter(p =>
      !currentProducts.includes(p) &&
      p.toLowerCase().includes(searchTerm)
    )
  }

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-foreground lg:text-2xl">
            <Users className="h-6 w-6 text-chart-2" />
            Proveedores
          </h2>
          <p className="text-sm text-muted-foreground">Gestion de proveedores y pedidos</p>
        </div>

        <button
          onClick={() => {
            setAddModal(true)
            setSelectedDays([])
          }}
          className="flex items-center gap-1.5 rounded-lg bg-chart-2 px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-chart-2/90"
        >
          <Plus className="h-4 w-4" />
          Agregar proveedor
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <div className="flex gap-1">
          {[
            { value: "all" as const, label: "Todos" },
            { value: "activo" as const, label: "Activos" },
            { value: "inactivo" as const, label: "Inactivos" },
          ].map((status) => (
            <button
              key={status.value}
              onClick={() => setStatusFilter(status.value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${statusFilter === status.value
                  ? "bg-chart-2 text-primary-foreground"
                  : "border border-border bg-card text-card-foreground hover:bg-muted"
                }`}
            >
              {status.label}
            </button>
          ))}
        </div>

        <div className="flex gap-1">
          {[
            { value: "all" as const, label: "Todos", icon: null },
            { value: "revuelteria" as const, label: "Revuelteria", icon: Leaf },
            { value: "abarrotes" as const, label: "Abarrotes", icon: Package },
            { value: "ambos" as const, label: "Ambos", icon: ArrowUpDown },
          ].map((type) => (
            <button
              key={type.value}
              onClick={() => setTypeFilter(type.value)}
              className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${typeFilter === type.value
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-card text-card-foreground hover:bg-muted"
                }`}
            >
              {type.icon && <type.icon className="h-3 w-3" />}
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {filteredSuppliers.map((supplier) => (
          <SupplierCard
            key={supplier.id}
            supplier={supplier}
            isSelected={selectedSupplier?.id === supplier.id}
            onClick={() => setSelectedSupplier(supplier)}
          />
        ))}
      </div>

      {filteredSuppliers.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-16 text-center">
          <Users className="h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No se encontraron proveedores.</p>
        </div>
      )}

      {/* Supplier Detail Modal */}
      {selectedSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 p-4 backdrop-blur-sm">
          <div className="h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
            <SupplierDetail
              supplier={selectedSupplier}
              onClose={() => setSelectedSupplier(null)}
              onUpdateStatus={handleUpdateStatus}
              onEdit={(supplier) => {
                setSelectedSupplier(null)
                setEditModal(supplier)
                if (supplier.deliveryDays) {
                  setEditSelectedDays(supplier.deliveryDays.split(", ").filter(d => weekDays.includes(d)))
                } else {
                  setEditSelectedDays([])
                }
              }}
              onDelete={(supplier) => setDeleteConfirm(supplier)}
            />
          </div>
        </div>
      )}

      {/* Add Supplier Modal */}
      {addModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-card-foreground">Agregar Nuevo Proveedor</h3>
              <button
                onClick={() => {
                  setAddModal(false)
                  setSelectedDays([])
                  setNewSupplier({
                    name: "",
                    contactPerson: "",
                    phone: "",
                    email: "",
                    address: "",
                    city: "",
                    rfc: "",
                    type: "revuelteria",
                    status: "activo",
                    productsSupplied: [],
                    rating: 5,
                    deliveryDays: "",
                    paymentTerms: "",
                    notes: "",
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
                  Nombre de la empresa *
                </label>
                <input
                  type="text"
                  value={newSupplier.name}
                  onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                  placeholder="Ej: Distribuidora ABC"
                  className="h-10 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-card-foreground">
                  Persona de contacto *
                </label>
                <input
                  type="text"
                  value={newSupplier.contactPerson}
                  onChange={(e) => setNewSupplier({ ...newSupplier, contactPerson: e.target.value })}
                  placeholder="Ej: Juan Perez"
                  className="h-10 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-card-foreground">
                    Telefono *
                  </label>
                  <input
                    type="tel"
                    value={newSupplier.phone}
                    onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                    placeholder="301 123 4567"
                    className="h-10 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-card-foreground">
                    Correo electronico
                  </label>
                  <input
                    type="email"
                    value={newSupplier.email}
                    onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
                    placeholder="correo@ejemplo.com"
                    className="h-10 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-card-foreground">
                  Direccion
                </label>
                <input
                  type="text"
                  value={newSupplier.address}
                  onChange={(e) => setNewSupplier({ ...newSupplier, address: e.target.value })}
                  placeholder="Calle, numero, colonia"
                  className="h-10 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-card-foreground">
                    Ciudad
                  </label>
                  <input
                    type="text"
                    value={newSupplier.city}
                    onChange={(e) => setNewSupplier({ ...newSupplier, city: e.target.value })}
                    placeholder="Bogota"
                    className="h-10 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-card-foreground">
                    RFC
                  </label>
                  <input
                    type="text"
                    value={newSupplier.rfc}
                    onChange={(e) => setNewSupplier({ ...newSupplier, rfc: e.target.value })}
                    placeholder="AAA-123456-XYZ"
                    className="h-10 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-card-foreground">
                    Tipo de proveedor *
                  </label>
                  <select
                    value={newSupplier.type}
                    onChange={(e) => setNewSupplier({ ...newSupplier, type: e.target.value as "revuelteria" | "abarrotes" | "ambos" })}
                    className="h-10 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                  >
                    <option value="revuelteria">Revuelteria</option>
                    <option value="abarrotes">Abarrotes</option>
                    <option value="ambos">Ambos</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-card-foreground">
                    Dias de entrega
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setAddDeliveryDaysOpen(!addDeliveryDaysOpen)}
                      className="flex h-10 w-full items-center justify-between rounded-xl border border-input bg-background px-4 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                    >
                      <span className={selectedDays.length > 0 ? "text-foreground" : "text-muted-foreground"}>
                        {selectedDays.length > 0 ? `${selectedDays.length} dia(s) seleccionado(s)` : "Seleccionar dias..."}
                      </span>
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </button>
                    {addDeliveryDaysOpen && (
                      <div className="absolute z-10 mt-1 w-full rounded-xl border border-border bg-card p-2 shadow-lg">
                        {weekDays.map((day) => (
                          <label
                            key={day}
                            className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 hover:bg-muted"
                          >
                            <input
                              type="checkbox"
                              checked={selectedDays.includes(day)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  const newDays = [...selectedDays, day]
                                  setSelectedDays(newDays)
                                  setNewSupplier({ ...newSupplier, deliveryDays: newDays.join(", ") })
                                } else {
                                  const newDays = selectedDays.filter((d) => d !== day)
                                  setSelectedDays(newDays)
                                  setNewSupplier({ ...newSupplier, deliveryDays: newDays.join(", ") })
                                }
                              }}
                              className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
                            />
                            <span className="text-sm text-foreground">{day}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-card-foreground">
                  Terminos de pago
                </label>
                <select
                  value={newSupplier.paymentTerms}
                  onChange={(e) => setNewSupplier({ ...newSupplier, paymentTerms: e.target.value })}
                  className="h-10 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                >
                  <option value="">Seleccionar...</option>
                  <option value="Contado">Contado</option>
                  <option value="Credito 7 dias">Credito 7 dias</option>
                  <option value="Credito 15 dias">Credito 15 dias</option>
                  <option value="Credito 30 dias">Credito 30 dias</option>
                  <option value="Pago contra entrega">Pago contra entrega</option>
                  <option value="Pago anticipado">Pago anticipado</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-card-foreground">
                  Productos que suministra
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={addProductSearch}
                    onChange={(e) => {
                      setAddProductSearch(e.target.value)
                      if (!addProductDropdownOpen) setAddProductDropdownOpen(true)
                    }}
                    onFocus={() => setAddProductDropdownOpen(true)}
                    placeholder="Buscar o escribir producto..."
                    className="h-10 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                  />
                  {addProductDropdownOpen && addProductSearch && (
                    <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-xl border border-border bg-card p-1 shadow-lg">
                      {filteredExistingProducts(false).length > 0 ? (
                        filteredExistingProducts(false).map((product) => (
                          <button
                            key={product}
                            type="button"
                            onClick={() => {
                              handleAddProductToSupplier(product, false)
                              setAddProductSearch("")
                              setAddProductDropdownOpen(false)
                            }}
                            className="w-full rounded-lg px-3 py-2 text-left text-sm text-foreground hover:bg-muted"
                          >
                            {product}
                          </button>
                        ))
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            handleAddProductToSupplier(addProductSearch.trim(), false)
                            setAddProductSearch("")
                            setAddProductDropdownOpen(false)
                          }}
                          className="w-full rounded-lg px-3 py-2 text-left text-sm text-primary hover:bg-muted"
                        >
                          + Agregar "{addProductSearch}"
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {newSupplier.productsSupplied.map((product, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 rounded-lg bg-muted px-2 py-1 text-xs font-medium text-foreground"
                    >
                      {product}
                      <button
                        type="button"
                        onClick={() => handleRemoveProductFromSupplier(index, false)}
                        className="ml-1 text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-card-foreground">
                  Notas
                </label>
                <textarea
                  value={newSupplier.notes}
                  onChange={(e) => setNewSupplier({ ...newSupplier, notes: e.target.value })}
                  placeholder="Notas adicionales sobre el proveedor..."
                  rows={3}
                  className="w-full rounded-xl border border-input bg-background px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setAddModal(false)
                  setNewSupplier({
                    name: "",
                    contactPerson: "",
                    phone: "",
                    email: "",
                    address: "",
                    city: "",
                    rfc: "",
                    type: "revuelteria",
                    status: "activo",
                    productsSupplied: [],
                    rating: 5,
                    deliveryDays: "",
                    paymentTerms: "",
                    notes: "",
                  })
                }}
                className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-card-foreground transition-colors hover:bg-muted"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  await addSupplier(newSupplier)
                  setAddModal(false)
                  setNewSupplier({
                    name: "",
                    contactPerson: "",
                    phone: "",
                    email: "",
                    address: "",
                    city: "",
                    rfc: "",
                    type: "revuelteria",
                    status: "activo",
                    productsSupplied: [],
                    rating: 5,
                    deliveryDays: "",
                    paymentTerms: "",
                    notes: "",
                  })
                  toast.success("Proveedor agregado correctamente")
                }}
                disabled={!newSupplier.name || !newSupplier.contactPerson || !newSupplier.phone}
                className="flex-1 rounded-xl bg-chart-2 px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-chart-2/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Agregar proveedor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Supplier Modal */}
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-card-foreground">Editar Proveedor</h3>
              <button
                onClick={() => setEditModal(null)}
                className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-card-foreground">
                  Nombre de la empresa *
                </label>
                <input
                  type="text"
                  value={editModal.name}
                  onChange={(e) => setEditModal({ ...editModal, name: e.target.value })}
                  className="h-10 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-card-foreground">
                  Persona de contacto *
                </label>
                <input
                  type="text"
                  value={editModal.contactPerson}
                  onChange={(e) => setEditModal({ ...editModal, contactPerson: e.target.value })}
                  className="h-10 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-card-foreground">
                    Telefono *
                  </label>
                  <input
                    type="tel"
                    value={editModal.phone}
                    onChange={(e) => setEditModal({ ...editModal, phone: e.target.value })}
                    className="h-10 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-card-foreground">
                    Correo electronico
                  </label>
                  <input
                    type="email"
                    value={editModal.email}
                    onChange={(e) => setEditModal({ ...editModal, email: e.target.value })}
                    className="h-10 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-card-foreground">
                  Direccion
                </label>
                <input
                  type="text"
                  value={editModal.address}
                  onChange={(e) => setEditModal({ ...editModal, address: e.target.value })}
                  className="h-10 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-card-foreground">
                    Ciudad
                  </label>
                  <input
                    type="text"
                    value={editModal.city}
                    onChange={(e) => setEditModal({ ...editModal, city: e.target.value })}
                    className="h-10 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-card-foreground">
                    RFC
                  </label>
                  <input
                    type="text"
                    value={editModal.rfc}
                    onChange={(e) => setEditModal({ ...editModal, rfc: e.target.value })}
                    className="h-10 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-card-foreground">
                    Tipo de proveedor
                  </label>
                  <select
                    value={editModal.type}
                    onChange={(e) => setEditModal({ ...editModal, type: e.target.value as "revuelteria" | "abarrotes" | "ambos" })}
                    className="h-10 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                  >
                    <option value="revuelteria">Revuelteria</option>
                    <option value="abarrotes">Abarrotes</option>
                    <option value="ambos">Ambos</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-card-foreground">
                    Estado
                  </label>
                  <select
                    value={editModal.status}
                    onChange={(e) => setEditModal({ ...editModal, status: e.target.value as SupplierStatus })}
                    className="h-10 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-card-foreground">
                    Dias de entrega
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setEditDeliveryDaysOpen(!editDeliveryDaysOpen)}
                      className="flex h-10 w-full items-center justify-between rounded-xl border border-input bg-background px-4 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                    >
                      <span className={editSelectedDays.length > 0 ? "text-foreground" : "text-muted-foreground"}>
                        {editSelectedDays.length > 0 ? `${editSelectedDays.length} dia(s) seleccionado(s)` : "Seleccionar dias..."}
                      </span>
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </button>
                    {editDeliveryDaysOpen && (
                      <div className="absolute z-10 mt-1 w-full rounded-xl border border-border bg-card p-2 shadow-lg">
                        {weekDays.map((day) => (
                          <label
                            key={day}
                            className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 hover:bg-muted"
                          >
                            <input
                              type="checkbox"
                              checked={editSelectedDays.includes(day)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  const newDays = [...editSelectedDays, day]
                                  setEditSelectedDays(newDays)
                                  setEditModal({ ...editModal, deliveryDays: newDays.join(", ") })
                                } else {
                                  const newDays = editSelectedDays.filter((d) => d !== day)
                                  setEditSelectedDays(newDays)
                                  setEditModal({ ...editModal, deliveryDays: newDays.join(", ") })
                                }
                              }}
                              className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
                            />
                            <span className="text-sm text-foreground">{day}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-card-foreground">
                    Terminos de pago
                  </label>
                  <select
                    value={editModal.paymentTerms}
                    onChange={(e) => setEditModal({ ...editModal, paymentTerms: e.target.value })}
                    className="h-10 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="Contado">Contado</option>
                    <option value="Credito 7 dias">Credito 7 dias</option>
                    <option value="Credito 15 dias">Credito 15 dias</option>
                    <option value="Credito 30 dias">Credito 30 dias</option>
                    <option value="Pago contra entrega">Pago contra entrega</option>
                    <option value="Pago anticipado">Pago anticipado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-card-foreground">
                  Productos que suministro
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={editProductSearch}
                    onChange={(e) => {
                      setEditProductSearch(e.target.value)
                      if (!editProductDropdownOpen) setEditProductDropdownOpen(true)
                    }}
                    onFocus={() => setEditProductDropdownOpen(true)}
                    placeholder="Buscar o escribir producto..."
                    className="h-10 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                  />
                  {editProductDropdownOpen && editProductSearch && (
                    <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-xl border border-border bg-card p-1 shadow-lg">
                      {filteredExistingProducts(true).length > 0 ? (
                        filteredExistingProducts(true).map((product) => (
                          <button
                            key={product}
                            type="button"
                            onClick={() => {
                              handleAddProductToSupplier(product, true)
                              setEditProductSearch("")
                              setEditProductDropdownOpen(false)
                            }}
                            className="w-full rounded-lg px-3 py-2 text-left text-sm text-foreground hover:bg-muted"
                          >
                            {product}
                          </button>
                        ))
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            handleAddProductToSupplier(editProductSearch.trim(), true)
                            setEditProductSearch("")
                            setEditProductDropdownOpen(false)
                          }}
                          className="w-full rounded-lg px-3 py-2 text-left text-sm text-primary hover:bg-muted"
                        >
                          + Agregar "{editProductSearch}"
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {editModal.productsSupplied.map((product, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 rounded-lg bg-muted px-2 py-1 text-xs font-medium text-foreground"
                    >
                      {product}
                      <button
                        type="button"
                        onClick={() => handleRemoveProductFromSupplier(index, true)}
                        className="ml-1 text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-card-foreground">
                  Notas
                </label>
                <textarea
                  value={editModal.notes || ""}
                  onChange={(e) => setEditModal({ ...editModal, notes: e.target.value })}
                  rows={3}
                  className="w-full rounded-xl border border-input bg-background px-4 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setEditModal(null)}
                className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-card-foreground transition-colors hover:bg-muted"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleEditSupplier(editModal)}
                disabled={!editModal.name || !editModal.contactPerson || !editModal.phone}
                className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-card-foreground">Confirmar Eliminacion</h3>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <Trash2 className="h-6 w-6 text-destructive" />
              </div>
              <p className="text-sm text-card-foreground">
                Estas seguro de que deseas eliminar al proveedor <strong>{deleteConfirm.name}</strong>?
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Esta accion no se puede deshacer. Se eliminaran todos los datos asociados.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-card-foreground transition-colors hover:bg-muted"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteSupplier(deleteConfirm.id)}
                className="flex-1 rounded-xl bg-destructive px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-destructive/90"
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
