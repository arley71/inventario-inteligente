// lib/db.ts
import mysql from 'mysql2/promise';

// Creamos un "Pool" de conexiones para mejorar el rendimiento.
export const pool = mysql.createPool({
    uri: process.env.DATABASE_URL,
    waitForConnections: true,
    connectionLimit: 10, // Máximo 10 conexiones simultáneas
    queueLimit: 0,
});
