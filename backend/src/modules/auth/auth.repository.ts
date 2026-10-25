import { pool } from '../../db/pool';
import type { Role } from '../../types/express';

export interface UserRecord {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
}

const toUser = (r: any): UserRecord => ({
  id: r.id, name: r.name, email: r.email, passwordHash: r.password_hash, role: r.role,
});

export async function findUserByEmail(email: string): Promise<UserRecord | null> {
  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return rows[0] ? toUser(rows[0]) : null;
}

export async function insertUser(u: Omit<UserRecord, 'id' | 'role'> & { role?: Role }): Promise<UserRecord> {
  const { rows } = await pool.query(
    'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING *',
    [u.name, u.email, u.passwordHash, u.role ?? 'USER'],
  );
  return toUser(rows[0]);
}
