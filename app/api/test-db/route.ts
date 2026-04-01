import { pool } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS result');
    return NextResponse.json({ 
      status: 'success', 
      message: 'Conexión a la base de datos exitosa!',
      data: rows 
    });
  } catch (error: any) {
    console.error('Database connection error:', error);
    return NextResponse.json({ 
      status: 'error', 
      message: 'Fallo al conectar a la base de datos.',
      error: error.message 
    }, { status: 500 });
  }
}
