import { pool } from '../lib/db';
import { initialRevuelteria, initialAbarrotes, initialSuppliers } from '../lib/inventory-data';

async function run() {
  try {
    console.log("Conectando a Clever Cloud y creando tablas...");

    // 0. Users
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(50) PRIMARY KEY,
          username VARCHAR(50) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          name VARCHAR(100) NOT NULL,
          role ENUM('admin', 'cajero') NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 1. Abarrotes
    await pool.query(`
      CREATE TABLE IF NOT EXISTS abarrotes (
          id VARCHAR(50) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          image LONGTEXT,
          price DECIMAL(10,2) NOT NULL,
          stock DECIMAL(10,2) NOT NULL DEFAULT 0,
          unit VARCHAR(10) DEFAULT 'pza',
          sku VARCHAR(50) UNIQUE,
          minStock INT DEFAULT 0,
          category VARCHAR(100)
      )
    `);

    // 2. Revuelteria
    await pool.query(`
      CREATE TABLE IF NOT EXISTS revuelteria (
          id VARCHAR(50) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          image LONGTEXT,
          pricePerKg DECIMAL(10,2) NOT NULL,
          stockKg DECIMAL(10,2) NOT NULL DEFAULT 0,
          unit VARCHAR(10) DEFAULT 'kg',
          category ENUM('fruta', 'verdura') NOT NULL
      )
    `);

    // 3. Batches
    await pool.query(`
      CREATE TABLE IF NOT EXISTS revuelteria_batches (
          id VARCHAR(50) PRIMARY KEY,
          product_id VARCHAR(50) NOT NULL,
          quantity DECIMAL(10,2) NOT NULL,
          arrivalDate DATE NOT NULL,
          freshness ENUM('fresco', 'danado') DEFAULT 'fresco',
          aiConfidence INT DEFAULT NULL,
          aiLastScan DATE DEFAULT NULL,
          FOREIGN KEY (product_id) REFERENCES revuelteria(id) ON DELETE CASCADE
      )
    `);

    // 4. Suppliers
    await pool.query(`
      CREATE TABLE IF NOT EXISTS suppliers (
          id VARCHAR(50) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          contactPerson VARCHAR(255),
          phone VARCHAR(50),
          email VARCHAR(255),
          address TEXT,
          city VARCHAR(100),
          rfc VARCHAR(50),
          type ENUM('revuelteria', 'abarrotes', 'ambos') NOT NULL,
          status ENUM('activo', 'inactivo') DEFAULT 'activo',
          rating DECIMAL(3,1) DEFAULT 0,
          deliveryDays VARCHAR(255),
          paymentTerms VARCHAR(100),
          lastDelivery DATE,
          totalOrders INT DEFAULT 0,
          totalSpent DECIMAL(12,2) DEFAULT 0,
          notes TEXT
      )
    `);

    // 5. Sales
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sales (
          id VARCHAR(50) PRIMARY KEY,
          user_id VARCHAR(50),
          subtotal DECIMAL(10,2) NOT NULL,
          tax DECIMAL(10,2) NOT NULL,
          total DECIMAL(10,2) NOT NULL,
          paymentMethod ENUM('efectivo', 'tarjeta') NOT NULL,
          amountReceived DECIMAL(10,2),
          change_amount DECIMAL(10,2),
          date DATE NOT NULL,
          time TIME NOT NULL,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // 6. Sale Items
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sale_items (
          id INT AUTO_INCREMENT PRIMARY KEY,
          sale_id VARCHAR(50) NOT NULL,
          product_id VARCHAR(50) NOT NULL,
          product_type ENUM('abarrotes', 'revuelteria') NOT NULL,
          name VARCHAR(255) NOT NULL,
          quantity DECIMAL(10,2) NOT NULL,
          unitPrice DECIMAL(10,2) NOT NULL,
          subtotal DECIMAL(10,2) NOT NULL,
          unit ENUM('kg', 'pza') NOT NULL,
          FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE
      )
    `);
    
    console.log("✅ Tablas creadas correctamente.");
    console.log("Inyectando datos semilla desde inventory-data.ts...");

    // Insertar usuarios iniciales
    await pool.query(`INSERT IGNORE INTO users (id, username, password_hash, name, role) VALUES ('u1', 'admin', 'admin123', 'Administrador', 'admin')`);
    await pool.query(`INSERT IGNORE INTO users (id, username, password_hash, name, role) VALUES ('u2', 'cajero', 'cajero123', 'Cajero', 'cajero')`);

    // Insertar Abarrotes
    for (const item of initialAbarrotes) {
      await pool.query(
        `INSERT IGNORE INTO abarrotes (id, name, image, price, stock, unit, sku, minStock, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [item.id, item.name, item.image, item.price, item.stock, item.unit, item.sku, item.minStock, item.category]
      );
    }

    // Insertar Revuelteria y sus Lotes
    for (const item of initialRevuelteria) {
      await pool.query(
        `INSERT IGNORE INTO revuelteria (id, name, image, pricePerKg, stockKg, unit, category) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [item.id, item.name, item.image, item.pricePerKg, item.stockKg, item.unit, item.category]
      );
      
      for (const batch of item.batches) {
        await pool.query(
          `INSERT IGNORE INTO revuelteria_batches (id, product_id, quantity, arrivalDate, freshness) VALUES (?, ?, ?, ?, ?)`,
          [`${batch.id}-${item.id}`, item.id, batch.quantity, batch.arrivalDate, batch.freshness]
        );
      }
    }

    // Insertar Proveedores
    for (const sup of initialSuppliers) {
      await pool.query(
        `INSERT IGNORE INTO suppliers (id, name, contactPerson, phone, email, address, city, rfc, type, status, rating, deliveryDays, paymentTerms, lastDelivery, totalOrders, totalSpent, notes) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [sup.id, sup.name, sup.contactPerson, sup.phone, sup.email, sup.address, sup.city, sup.rfc, sup.type, sup.status, sup.rating, sup.deliveryDays, sup.paymentTerms, sup.lastDelivery, sup.totalOrders, sup.totalSpent, sup.notes]
      );
    }

    console.log("🚀 ¡Inicialización de base de datos terminada con éxito!");
  } catch (error) {
    console.error("❌ Error ejecutando queries:", error);
  } finally {
    process.exit(0);
  }
}

run();
