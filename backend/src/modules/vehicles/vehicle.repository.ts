import { pool } from '../../db/pool';
import type { CreateVehicle, SearchFilters, UpdateVehicle } from './vehicle.schemas';

export interface Vehicle {
  id: number;
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Purchase { id: number; userId: number; vehicleId: number; unitPrice: number; createdAt: Date }

// NUMERIC columns come back from pg as strings; convert so the API returns real numbers.
const toVehicle = (r: any): Vehicle => ({
  id: r.id, make: r.make, model: r.model, category: r.category,
  price: Number(r.price), quantity: r.quantity, createdAt: r.created_at, updatedAt: r.updated_at,
});

const toPurchase = (r: any): Purchase => ({
  id: r.id, userId: r.user_id, vehicleId: r.vehicle_id, unitPrice: Number(r.unit_price), createdAt: r.created_at,
});

/** Escape LIKE wildcards so "100%" is searched literally. */
const escapeLike = (s: string) => s.replace(/[\\%_]/g, (c) => `\\${c}`);

export async function insert(v: CreateVehicle): Promise<Vehicle> {
  const { rows } = await pool.query(
    'INSERT INTO vehicles (make, model, category, price, quantity) VALUES ($1,$2,$3,$4,$5) RETURNING *',
    [v.make, v.model, v.category, v.price, v.quantity],
  );
  return toVehicle(rows[0]);
}

export async function findAll(): Promise<Vehicle[]> {
  const { rows } = await pool.query('SELECT * FROM vehicles ORDER BY id');
  return rows.map(toVehicle);
}

export async function findById(id: number): Promise<Vehicle | null> {
  const { rows } = await pool.query('SELECT * FROM vehicles WHERE id = $1', [id]);
  return rows[0] ? toVehicle(rows[0]) : null;
}

/** Builds a parameterised WHERE clause from whichever filters were supplied (no SQL injection). */
export async function search(f: SearchFilters): Promise<Vehicle[]> {
  const conditions: string[] = [];
  const params: unknown[] = [];
  const add = (clause: string, value: unknown) => {
    params.push(value);
    conditions.push(clause.replace('?', `$${params.length}`));
  };

  if (f.make) add("make ILIKE ? ESCAPE '\\'", `%${escapeLike(f.make)}%`);
  if (f.model) add("model ILIKE ? ESCAPE '\\'", `%${escapeLike(f.model)}%`);
  if (f.category) add('LOWER(category) = LOWER(?)', f.category);
  if (f.minPrice !== undefined) add('price >= ?', f.minPrice);
  if (f.maxPrice !== undefined) add('price <= ?', f.maxPrice);

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const { rows } = await pool.query(`SELECT * FROM vehicles ${where} ORDER BY id`, params);
  return rows.map(toVehicle);
}

export async function update(id: number, changes: UpdateVehicle): Promise<Vehicle | null> {
  const entries = Object.entries(changes);
  // Column names come from our own zod schema keys (never raw user input), values are parameterised.
  const sets = entries.map(([col], i) => `${col} = $${i + 2}`);
  const { rows } = await pool.query(
    `UPDATE vehicles SET ${sets.join(', ')}, updated_at = now() WHERE id = $1 RETURNING *`,
    [id, ...entries.map(([, v]) => v)],
  );
  return rows[0] ? toVehicle(rows[0]) : null;
}

export async function remove(id: number): Promise<boolean> {
  const { rowCount } = await pool.query('DELETE FROM vehicles WHERE id = $1', [id]);
  return (rowCount ?? 0) > 0;
}

export async function addStock(id: number, amount: number): Promise<Vehicle | null> {
  const { rows } = await pool.query(
    'UPDATE vehicles SET quantity = quantity + $2, updated_at = now() WHERE id = $1 RETURNING *',
    [id, amount],
  );
  return rows[0] ? toVehicle(rows[0]) : null;
}

/**
 * Atomic purchase. The stock check and decrement are ONE conditional UPDATE
 * (`WHERE quantity > 0`), so two simultaneous buyers can never take the last car.
 * Returns null when the vehicle is missing or out of stock.
 */
export async function purchaseOne(userId: number, vehicleId: number): Promise<{ vehicle: Vehicle; purchase: Purchase } | null> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const upd = await client.query(
      'UPDATE vehicles SET quantity = quantity - 1, updated_at = now() WHERE id = $1 AND quantity > 0 RETURNING *',
      [vehicleId],
    );
    if (upd.rowCount === 0) {
      await client.query('ROLLBACK');
      return null;
    }
    const vehicle = toVehicle(upd.rows[0]);
    const ins = await client.query(
      'INSERT INTO purchases (user_id, vehicle_id, unit_price) VALUES ($1,$2,$3) RETURNING *',
      [userId, vehicleId, vehicle.price],
    );
    await client.query('COMMIT');
    return { vehicle, purchase: toPurchase(ins.rows[0]) };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
