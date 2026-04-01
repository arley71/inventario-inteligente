'use server'

import { pool } from '@/lib/db';
import type { AbarrotesProduct, RevuelteriaProduct, StockBatch } from '@/lib/inventory-data';

export async function obtenerAbarrotes(): Promise<AbarrotesProduct[]> {
  try {
    const [rows]: any = await pool.query('SELECT * FROM abarrotes');
    return rows.map((r: any) => ({
      ...r,
      price: Number(r.price),
      stock: Number(r.stock)
    })) as AbarrotesProduct[];
  } catch (error) {
    console.error("Error obteniendo abarrotes:", error);
    return [];
  }
}

export async function obtenerRevuelteria(): Promise<RevuelteriaProduct[]> {
  try {
    const [products]: any = await pool.query('SELECT * FROM revuelteria');
    const [batches]: any = await pool.query('SELECT * FROM revuelteria_batches');

    return products.map((p: any) => {
      // Find batches for this product
      const productBatches = batches.filter((b: any) => b.product_id === p.id);
      
      const parsedBatches: StockBatch[] = productBatches.map((b: any) => ({
        id: b.id.replace(`-${p.id}`, ''), // Reverting to relative batch id like 'b1' if needed
        quantity: Number(b.quantity),
        arrivalDate: new Date(b.arrivalDate).toISOString().split('T')[0],
        freshness: b.freshness,
        aiConfidence: b.aiConfidence,
        aiLastScan: b.aiLastScan ? new Date(b.aiLastScan).toISOString().split('T')[0] : undefined
      }));

      return {
        ...p,
        pricePerKg: Number(p.pricePerKg),
        stockKg: Number(p.stockKg),
        batches: parsedBatches
      };
    }) as RevuelteriaProduct[];
  } catch (error) {
    console.error("Error obteniendo revuelteria:", error);
    return [];
  }
}

export async function registrarMermaRevuelteria(productId: string, amountKg: number) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    let remaining = amountKg;
    // Seleccionamos los lotes ordenados por fecha (FIFO para la merma) o dañados primero
    const [batches]: any = await connection.query(
      `SELECT id, quantity FROM revuelteria_batches WHERE product_id = ? ORDER BY freshness DESC, arrivalDate ASC FOR UPDATE`,
      [productId]
    );

    for (const batch of batches) {
      if (remaining <= 0) break;

      const qty = Number(batch.quantity);
      if (qty <= remaining) {
        remaining -= qty;
        await connection.query('UPDATE revuelteria_batches SET quantity = 0 WHERE id = ?', [batch.id]);
      } else {
        const newQty = qty - remaining;
        remaining = 0;
        await connection.query('UPDATE revuelteria_batches SET quantity = ? WHERE id = ?', [newQty, batch.id]);
      }
    }

    // Actualizamos el total en la tabla principal de productos
    await connection.query(
      `UPDATE revuelteria SET stockKg = (SELECT SUM(quantity) FROM revuelteria_batches WHERE product_id = ?) WHERE id = ?`,
      [productId, productId]
    );

    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    console.error("Error en registrarMermaRevuelteria:", error);
    throw error;
  } finally {
    connection.release();
  }
}
