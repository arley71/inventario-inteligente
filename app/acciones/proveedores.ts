'use server'

import { pool } from '@/lib/db';

export async function obtenerProveedores() {
  const [rows]: any = await pool.query('SELECT * FROM suppliers');
  return rows.map((r: any) => ({
    ...r,
    rating: Number(r.rating),
    productsSupplied: typeof r.productsSupplied === "string"
      ? JSON.parse(r.productsSupplied)
      : (r.productsSupplied || [])
  }));
}

export async function agregarProveedorAction(supplier: any) {
  const id = `s-${Date.now()}`;
  await pool.query(
    `INSERT INTO suppliers (id, name, contactPerson, phone, email, address, city, rfc, type, status, productsSupplied, rating, deliveryDays, paymentTerms, notes) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id, supplier.name || "", supplier.contactPerson || null, supplier.phone || null, supplier.email || null,
      supplier.address || null, supplier.city || null, supplier.rfc || null, supplier.type || "ambos", supplier.status || "activo",
      JSON.stringify(supplier.productsSupplied || []), supplier.rating || 0, supplier.deliveryDays || null,
      supplier.paymentTerms || null, supplier.notes || null
    ]
  );
  return id;
}

export async function actualizarProveedorAction(id: string, updates: any) {
  const updatesData = { ...updates };

  // Filter out invalid columns like "orders" that might be present in frontend models
  const allowed = [
    'name', 'contactPerson', 'phone', 'email', 'address', 'city', 'rfc', 'type',
    'status', 'productsSupplied', 'rating', 'deliveryDays', 'paymentTerms', 'notes',
    'lastDelivery', 'totalOrders', 'totalSpent'
  ];

  for (const key of Object.keys(updatesData)) {
    if (!allowed.includes(key)) {
      delete updatesData[key];
    }
  }

  if (Object.keys(updatesData).length === 0) return;

  if (updatesData.productsSupplied !== undefined) {
    updatesData.productsSupplied = JSON.stringify(updatesData.productsSupplied);
  }

  const keys = Object.keys(updatesData).map(k => `\`${k}\` = ?`).join(', ');
  const values = Object.values(updatesData);
  values.push(id);

  await pool.query(`UPDATE suppliers SET ${keys} WHERE id = ?`, values);
}

export async function eliminarProveedorAction(id: string) {
  await pool.query(`DELETE FROM suppliers WHERE id = ?`, [id]);
}
