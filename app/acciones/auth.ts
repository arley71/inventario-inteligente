'use server'

import { pool } from '@/lib/db';
import { User } from '@/lib/auth-context';
import bcrypt from 'bcryptjs';

export async function loginAction(username: string, password_plain: string): Promise<User | null> {
  try {
    const [rows]: any = await pool.query(
      'SELECT id, name, role, password_hash FROM users WHERE username = ?',
      [username.toLowerCase().trim()]
    );

    if (rows && rows.length > 0) {
      const userRecord = rows[0];
      // Verificar la contraseña cifrada
      const isValid = await bcrypt.compare(password_plain, userRecord.password_hash);
      
      if (isValid) {
        return {
          id: userRecord.id,
          name: userRecord.name,
          role: userRecord.role
        };
      }
    }
    
    return null;
  } catch (err) {
    console.error("Error en loginAction:", err);
    return null;
  }
}
