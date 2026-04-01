export type FreshnessStatus = "fresco" | "danado"

export interface StockBatch {
  id: string
  quantity: number
  arrivalDate: string
  freshness: FreshnessStatus
  aiConfidence?: number
  aiLastScan?: string
}

export interface RevuelteriaProduct {
  id: string
  name: string
  image: string
  pricePerKg: number
  stockKg: number
  unit: "kg"
  category: "fruta" | "verdura"
  batches: StockBatch[]
  freshness?: FreshnessStatus
  arrivalDate?: string
  aiConfidence?: number
  aiLastScan?: string
}

export interface AbarrotesProduct {
  id: string
  name: string
  image: string
  price: number
  stock: number
  unit: "pza"
  sku: string
  minStock: number
  category: string
}

export type Product = RevuelteriaProduct | AbarrotesProduct

export interface SaleItem {
  productId: string
  name: string
  quantity: number
  unitPrice: number
  subtotal: number
  unit: "kg" | "pza"
}

export interface Sale {
  id: string
  items: SaleItem[]
  subtotal: number
  tax: number
  total: number
  paymentMethod: "efectivo" | "tarjeta"
  amountReceived?: number
  change?: number
  date: string
  time: string
}

export const initialRevuelteria: RevuelteriaProduct[] = [
  {
    id: "r1",
    name: "Manzana Roja",
    image: "/images/manzana.jpeg",
    pricePerKg: 38,
    stockKg: 45.5,
    unit: "kg",
    category: "fruta",
    batches: [
      { id: "b1", quantity: 20, arrivalDate: "2026-02-20", freshness: "danado" },
      { id: "b2", quantity: 25.5, arrivalDate: "2026-02-27", freshness: "fresco" },
    ],
  },
  {
    id: "r2",
    name: "Platano Tabasco",
    image: "/images/platano.jpeg",
    pricePerKg: 22,
    stockKg: 30,
    unit: "kg",
    category: "fruta",
    batches: [
      { id: "b1", quantity: 15, arrivalDate: "2026-02-25", freshness: "fresco" },
      { id: "b2", quantity: 15, arrivalDate: "2026-02-27", freshness: "fresco" },
    ],
  },
  {
    id: "r3",
    name: "Tomate Saladette",
    image: "/images/tomate.jpg",
    pricePerKg: 28,
    stockKg: 25,
    unit: "kg",
    category: "verdura",
    batches: [
      { id: "b1", quantity: 25, arrivalDate: "2026-02-27", freshness: "fresco" },
    ],
  },
  {
    id: "r4",
    name: "Aguacate Hass",
    image: "/images/aguacate.jpg",
    pricePerKg: 65,
    stockKg: 18.2,
    unit: "kg",
    category: "fruta",
    batches: [
      { id: "b1", quantity: 8, arrivalDate: "2026-02-22", freshness: "danado" },
      { id: "b2", quantity: 10.2, arrivalDate: "2026-02-27", freshness: "fresco" },
    ],
  },
  {
    id: "r5",
    name: "Limon",
    image: "/images/limon.webp",
    pricePerKg: 32,
    stockKg: 12,
    unit: "kg",
    category: "fruta",
    batches: [
      { id: "b1", quantity: 12, arrivalDate: "2026-02-26", freshness: "fresco" },
    ],
  },
  {
    id: "r6",
    name: "Cebolla Blanca",
    image: "/images/cebolla.png",
    pricePerKg: 18,
    stockKg: 35,
    unit: "kg",
    category: "verdura",
    batches: [
      { id: "b1", quantity: 20, arrivalDate: "2026-02-23", freshness: "danado" },
      { id: "b2", quantity: 15, arrivalDate: "2026-02-27", freshness: "fresco" },
    ],
  },
  {
    id: "r7",
    name: "Papaya Maradol",
    image: "/images/papaya.webp",
    pricePerKg: 28,
    stockKg: 8.5,
    unit: "kg",
    category: "fruta",
    batches: [
      { id: "b1", quantity: 8.5, arrivalDate: "2026-02-20", freshness: "danado" },
    ],
  },
  {
    id: "r8",
    name: "Chile Serrano",
    image: "/images/Chiles.jpg",
    pricePerKg: 42,
    stockKg: 5.2,
    unit: "kg",
    category: "verdura",
    batches: [
      { id: "b1", quantity: 5.2, arrivalDate: "2026-02-27", freshness: "fresco" },
    ],
  },
]

export const initialAbarrotes: AbarrotesProduct[] = [
  {
    id: "a1",
    name: "Aceite Vegetal 1L",
    image: "/images/Aceite.webp",
    price: 42.5,
    stock: 24,
    unit: "pza",
    sku: "ABR-001",
    minStock: 10,
    category: "Aceites",
  },
  {
    id: "a2",
    name: "Arroz SOS 1kg",
    image: "/images/arroz.jpg",
    price: 28,
    stock: 45,
    unit: "pza",
    sku: "ABR-002",
    minStock: 15,
    category: "Granos",
  },
  {
    id: "a3",
    name: "Frijol Negro 1kg",
    image: "/images/frijol.webp",
    price: 32,
    stock: 38,
    unit: "pza",
    sku: "ABR-003",
    minStock: 12,
    category: "Granos",
  },
  {
    id: "a4",
    name: "Azucar Estandar 1kg",
    image: "/images/azucar.webp",
    price: 30,
    stock: 5,
    unit: "pza",
    sku: "ABR-004",
    minStock: 10,
    category: "Reposteria",
  },
  {
    id: "a5",
    name: "Atun en Agua 140g",
    image: "/images/atun.webp",
    price: 22,
    stock: 60,
    unit: "pza",
    sku: "ABR-005",
    minStock: 20,
    category: "Enlatados",
  },
  {
    id: "a6",
    name: "Jabon de Barra",
    image: "/images/jabon.webp",
    price: 18,
    stock: 3,
    unit: "pza",
    sku: "ABR-006",
    minStock: 8,
    category: "Limpieza",
  },
]

export type SupplierStatus = "activo" | "inactivo"
export type OrderStatus = "entregado" | "en_camino" | "pendiente" | "cancelado"

export interface SupplierOrder {
  id: string
  date: string
  products: string[]
  total: number
  status: OrderStatus
  deliveryDate?: string
}

export interface Supplier {
  id: string
  name: string
  contactPerson: string
  phone: string
  email: string
  address: string
  city: string
  rfc: string
  type: "revuelteria" | "abarrotes" | "ambos"
  status: SupplierStatus
  productsSupplied: string[]
  rating: number
  deliveryDays: string
  paymentTerms: string
  lastDelivery: string
  totalOrders: number
  totalSpent: number
  orders: SupplierOrder[]
  notes?: string
}

export const initialSuppliers: Supplier[] = [
  {
    id: "s1",
    name: "Frutas y Verduras del Campo",
    contactPerson: "Roberto Hernandez",
    phone: "301 123 4567",
    email: "roberto@frutasdelcampo.co",
    address: "Mercado Mayorista Nave B, Local 45",
    city: "Bogota",
    rfc: "FVC-210315-AB1",
    type: "revuelteria",
    status: "activo",
    productsSupplied: ["Manzana Roja", "Platano Tabasco", "Tomate Saladette", "Aguacate Hass", "Papaya Maradol"],
    rating: 4.8,
    deliveryDays: "Lun, Mie, Vie",
    paymentTerms: "Pago contra entrega",
    lastDelivery: "2026-02-16",
    totalOrders: 142,
    totalSpent: 287450,
    orders: [
      { id: "o1", date: "2026-02-16", products: ["Manzana Roja", "Aguacate Hass"], total: 3250, status: "entregado", deliveryDate: "2026-02-16" },
      { id: "o2", date: "2026-02-14", products: ["Tomate Saladette", "Platano Tabasco", "Papaya Maradol"], total: 4100, status: "entregado", deliveryDate: "2026-02-14" },
      { id: "o3", date: "2026-02-18", products: ["Manzana Roja", "Tomate Saladette", "Aguacate Hass"], total: 5200, status: "en_camino" },
      { id: "o4", date: "2026-02-11", products: ["Platano Tabasco"], total: 1800, status: "entregado", deliveryDate: "2026-02-11" },
    ],
    notes: "Proveedor principal de frutas. Excelente calidad y puntualidad.",
  },
  {
    id: "s2",
    name: "Citricos y Chiles del Valle",
    contactPerson: "Maria Elena Torres",
    phone: "312 987 6543",
    email: "ventas@citricosvalle.co",
    "address": "Km 12 Carretera Bogota-Cali",
    city: "Cali",
    rfc: "CCG-190820-XY2",
    type: "revuelteria",
    status: "activo",
    productsSupplied: ["Limon", "Chile Serrano", "Cebolla Blanca"],
    rating: 4.5,
    deliveryDays: "Mar, Jue, Sab",
    paymentTerms: "Credito 7 dias",
    lastDelivery: "2026-02-15",
    totalOrders: 89,
    totalSpent: 156200,
    orders: [
      { id: "o5", date: "2026-02-15", products: ["Limon", "Chile Serrano"], total: 2800, status: "entregado", deliveryDate: "2026-02-15" },
      { id: "o6", date: "2026-02-13", products: ["Cebolla Blanca", "Limon"], total: 1950, status: "entregado", deliveryDate: "2026-02-13" },
      { id: "o7", date: "2026-02-20", products: ["Chile Serrano", "Limon", "Cebolla Blanca"], total: 3400, status: "pendiente" },
    ],
    notes: "Envios desde el Valle del Cauca. Calidad superior en citricos.",
  },
  {
    id: "s3",
    name: "Distribuidora La Esperanza S.A.",
    contactPerson: "Carlos Martinez Lopez",
    phone: "601 987 6543",
    email: "pedidos@laesperanza.co",
    address: "Av. Industrial 234, Barrio Industrial",
    city: "Medellin",
    rfc: "DLE-150410-KL9",
    type: "abarrotes",
    status: "activo",
    productsSupplied: ["Aceite Vegetal 1L", "Arroz SOS 1kg", "Frijol Negro 1kg", "Azucar Estandar 1kg"],
    rating: 4.3,
    deliveryDays: "Lun, Jue",
    paymentTerms: "Credito 15 dias",
    lastDelivery: "2026-02-13",
    totalOrders: 210,
    totalSpent: 524800,
    orders: [
      { id: "o8", date: "2026-02-13", products: ["Aceite Vegetal 1L", "Arroz SOS 1kg", "Azucar Estandar 1kg"], total: 8200, status: "entregado", deliveryDate: "2026-02-13" },
      { id: "o9", date: "2026-02-10", products: ["Frijol Negro 1kg", "Arroz SOS 1kg"], total: 5600, status: "entregado", deliveryDate: "2026-02-10" },
      { id: "o10", date: "2026-02-17", products: ["Aceite Vegetal 1L", "Frijol Negro 1kg", "Azucar Estandar 1kg"], total: 9100, status: "en_camino" },
    ],
  },
  {
    id: "s4",
    name: "Alimentos del Mar S. de R.L.",
    contactPerson: "Javier Rios Perez",
    phone: "602 456 7890",
    email: "jrios@alimentosdelmar.co",
    address: "Puerto Multimodal 567",
    city: "Barranquilla",
    rfc: "ADM-180605-QR3",
    type: "abarrotes",
    status: "activo",
    productsSupplied: ["Atun en Agua 140g"],
    rating: 4.6,
    deliveryDays: "Mie",
    paymentTerms: "Pago anticipado",
    lastDelivery: "2026-02-12",
    totalOrders: 45,
    totalSpent: 89700,
    orders: [
      { id: "o11", date: "2026-02-12", products: ["Atun en Agua 140g"], total: 4400, status: "entregado", deliveryDate: "2026-02-12" },
      { id: "o12", date: "2026-02-19", products: ["Atun en Agua 140g"], total: 5500, status: "pendiente" },
    ],
  },
  {
    id: "s5",
    name: "Productos de Limpieza Brisa",
    contactPerson: "Ana Lucia Gomez",
    phone: "301 234 5678",
    email: "ana@brisalimpieza.co",
    address: "Calle Reforma 89, Centro",
    city: "Cali",
    rfc: "PLB-200115-MN7",
    type: "abarrotes",
    status: "inactivo",
    productsSupplied: ["Jabon de Barra"],
    rating: 3.8,
    deliveryDays: "Vie",
    paymentTerms: "Pago contra entrega",
    lastDelivery: "2026-01-31",
    totalOrders: 28,
    totalSpent: 34200,
    orders: [
      { id: "o13", date: "2026-01-31", products: ["Jabon de Barra"], total: 1260, status: "entregado", deliveryDate: "2026-01-31" },
      { id: "o14", date: "2026-01-24", products: ["Jabon de Barra"], total: 1080, status: "entregado", deliveryDate: "2026-01-24" },
    ],
    notes: "Proveedor en pausa por demoras recurrentes en entregas. Buscar alternativa.",
  },
  {
    id: "s6",
    name: "Abarrotes Mayoristas del Centro",
    contactPerson: "Fernando Castillo",
    phone: "301 678 9012",
    email: "fernando@mayoristascentro.co",
    address: "Mercado Central, Nave 3",
    city: "Bogota",
    rfc: "AMC-170830-FG5",
    type: "ambos",
    status: "inactivo",
    productsSupplied: ["Arroz SOS 1kg", "Frijol Negro 1kg", "Cebolla Blanca", "Limon"],
    rating: 3.2,
    deliveryDays: "Lun a Sab",
    paymentTerms: "Credito 30 dias",
    lastDelivery: "2025-12-15",
    totalOrders: 67,
    totalSpent: 178400,
    orders: [
      { id: "o15", date: "2025-12-15", products: ["Arroz SOS 1kg", "Frijol Negro 1kg"], total: 4200, status: "entregado", deliveryDate: "2025-12-15" },
      { id: "o16", date: "2025-12-08", products: ["Cebolla Blanca", "Limon"], total: 2100, status: "entregado", deliveryDate: "2025-12-08" },
    ],
    notes: "Desactivado por mala calidad en ultimos pedidos. Evaluar en 3 meses.",
  },
]

export const weeklySalesData = [
  { day: "Lun", ventas: 4250 },
  { day: "Mar", ventas: 3800 },
  { day: "Mie", ventas: 5100 },
  { day: "Jue", ventas: 4600 },
  { day: "Vie", ventas: 6200 },
  { day: "Sab", ventas: 7800 },
  { day: "Dom", ventas: 3200 },
]
