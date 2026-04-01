'use server'

import { pool } from '@/lib/db';
import { FreshnessStatus } from '@/lib/inventory-data';

export async function addStockAction(productId: string, amount: number, type: "revuelteria" | "abarrotes") {
  if (type === "revuelteria") {
    // 1. Inserción de un nuevo lote hoy
    const batchId = `b-${Date.now()}-${productId}`;
    const today = new Date().toISOString().split('T')[0];
    await pool.query(
      `INSERT INTO revuelteria_batches (id, product_id, quantity, arrivalDate, freshness) VALUES (?, ?, ?, ?, 'fresco')`,
      [batchId, productId, amount, today]
    );
    // User Rule: Si cambio (agrego) el stock, significa que ya no es malo.
    await pool.query(
      `UPDATE revuelteria_batches SET freshness = 'fresco' WHERE product_id = ?`,
      [productId]
    );
    // 2. Acumular el stock general de la fruta
    await pool.query(
      `UPDATE revuelteria SET stockKg = stockKg + ? WHERE id = ?`,
      [amount, productId]
    );
  } else {
    // Abarrotes direct sum
    await pool.query(
      `UPDATE abarrotes SET stock = stock + ? WHERE id = ?`,
      [amount, productId]
    );
  }
}

export async function updateFreshnessAction(productId: string, status: FreshnessStatus, confidence: number, batchId?: string) {
  const today = new Date().toISOString().split('T')[0];
  if (batchId) {
    await pool.query(
      `UPDATE revuelteria_batches SET freshness = ?, aiConfidence = ?, aiLastScan = ? WHERE id = ?`,
      [status, confidence, today, batchId]
    );
  } else {
    await pool.query(
      `UPDATE revuelteria_batches SET freshness = ?, aiConfidence = ?, aiLastScan = ? WHERE product_id = ?`,
      [status, confidence, today, productId]
    );
  }
}

export async function addProductAction(product: any, type: "revuelteria" | "abarrotes") {
  const id = `${type === "abarrotes" ? "a" : "r"}-${Date.now()}`;
  if (type === "abarrotes") {
    await pool.query(
      `INSERT INTO abarrotes (id, name, image, price, stock, unit, sku, minStock, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, product.name, product.image, product.price, product.stock, product.unit, product.sku, product.minStock, product.category]
    );
  } else {
    await pool.query(
      `INSERT INTO revuelteria (id, name, image, pricePerKg, stockKg, category) VALUES (?, ?, ?, ?, ?, ?)`,
      [id, product.name, product.image, product.pricePerKg, product.stockKg, product.category]
    );
    // Insert initial batch
    const batchId = `b-${Date.now()}-${id}`;
    await pool.query(
      `INSERT INTO revuelteria_batches (id, product_id, quantity, arrivalDate, freshness) VALUES (?, ?, ?, ?, ?)`,
      [batchId, id, product.stockKg, product.arrivalDate, product.freshness || 'fresco']
    );
  }
  return id;
}

export async function updateProductAction(productId: string, updates: any, type: "revuelteria" | "abarrotes") {
  // Dynamic update query
  if(Object.keys(updates).length === 0) return;
  
  const table = type === "revuelteria" ? "revuelteria" : "abarrotes";
  const keys = Object.keys(updates).map(k => `${k} = ?`).join(", ");
  const values = Object.values(updates);
  values.push(productId);
  
  await pool.query(`UPDATE ${table} SET ${keys} WHERE id = ?`, values);
}

export async function deleteProductAction(productId: string, type: "revuelteria" | "abarrotes") {
  const table = type === "revuelteria" ? "revuelteria" : "abarrotes";
  if (type === "revuelteria") {
    await pool.query(`DELETE FROM revuelteria_batches WHERE product_id = ?`, [productId]);
    await pool.query(`DELETE FROM revuelteria WHERE id = ?`, [productId]);
  } else {
    await pool.query(`DELETE FROM abarrotes WHERE id = ?`, [productId]);
  }
}
