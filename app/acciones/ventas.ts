'use server'

import { pool } from '@/lib/db';
import { SaleItem } from '@/lib/inventory-data';

export async function registrarVentaAction(
  userId: string,
  items: SaleItem[],
  paymentMethod: "efectivo" | "tarjeta",
  amountReceived?: number
) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const tax = subtotal * 0.16;
    const total = subtotal + tax;
    const changeAmount = amountReceived ? amountReceived - total : 0;

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0];

    const saleId = `V-${Date.now()}`;
    await connection.query(
      `INSERT INTO sales (id, user_id, subtotal, tax, total, paymentMethod, amountReceived, change_amount, date, time)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [saleId, userId, subtotal, tax, total, paymentMethod, amountReceived || null, changeAmount, dateStr, timeStr]
    );

    for (const item of items) {
      // Diferenciar el tipo de producto. En tu estructura, Revueltería usa KG y Abarrotes PZA.
      const pType = item.unit === "kg" ? "revuelteria" : "abarrotes";

      await connection.query(
        `INSERT INTO sale_items (sale_id, product_id, product_type, name, quantity, unitPrice, subtotal, unit)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [saleId, item.productId, pType, item.name, item.quantity, item.unitPrice, item.subtotal, item.unit]
      );

      // Decrementar stock
      if (pType === "abarrotes") {
        await connection.query(
          `UPDATE abarrotes SET stock = GREATEST(0, stock - ?) WHERE id = ?`,
          [item.quantity, item.productId]
        );
      } else {
        // Descarga de Lotes (FIFO) para Frutas/Verduras
        let remaining = item.quantity;
        const [batches]: any = await connection.query(
          `SELECT id, quantity FROM revuelteria_batches WHERE product_id = ? ORDER BY arrivalDate ASC FOR UPDATE`,
          [item.productId]
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

        // Actualizar el valor total general de stockKg en revuelteria
        await connection.query(
          `UPDATE revuelteria SET stockKg = (SELECT SUM(quantity) FROM revuelteria_batches WHERE product_id = ?) WHERE id = ?`,
          [item.productId, item.productId]
        );
      }
    }

    await connection.commit();
    return { success: true, saleId };
  } catch (err) {
    await connection.rollback();
    console.error("Error en registrarVentaAction:", err);
    throw err;
  } finally {
    connection.release();
  }
}

export async function obtenerVentas() {
  const [salesRows]: any = await pool.query('SELECT * FROM sales ORDER BY id DESC LIMIT 100');

  if (salesRows.length === 0) return [];

  const [itemsRows]: any = await pool.query('SELECT * FROM sale_items WHERE sale_id IN (?)', [salesRows.map((s: any) => s.id)]);

  const itemsMap = itemsRows.reduce((acc: any, item: any) => {
    if (!acc[item.sale_id]) acc[item.sale_id] = [];
    acc[item.sale_id].push({
      id: item.id.toString(),
      productId: item.product_id,
      name: item.name,
      unitPrice: Number(item.unitPrice),
      quantity: Number(item.quantity),
      subtotal: Number(item.subtotal),
      unit: item.unit
    });
    return acc;
  }, {});

  return salesRows.map((s: any) => {
    // MySQL might return s.date as a JS Date object instead of a string.
    const dateStr = s.date instanceof Date ? s.date.toISOString().split('T')[0] : s.date;
    return {
      id: s.id,
      date: dateStr,
      time: s.time,
      subtotal: Number(s.subtotal),
      tax: Number(s.tax),
      total: Number(s.total),
      paymentMethod: s.paymentMethod,
      amountReceived: s.amountReceived ? Number(s.amountReceived) : undefined,
      change: s.change_amount ? Number(s.change_amount) : undefined,
      items: itemsMap[s.id] || []
    }
  });
}
