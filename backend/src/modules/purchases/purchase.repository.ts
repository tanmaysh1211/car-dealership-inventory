import { pool } from '../../db/pool';

export interface PurchaseSummary {
  id: number;
  vehicleId: number | null;
  make: string | null;
  model: string | null;
  unitPrice: number;
  createdAt: Date;
}

/** A user's purchases, newest first. Vehicle details are null if the vehicle was deleted later. */
export async function findByUser(userId: number): Promise<PurchaseSummary[]> {
  const { rows } = await pool.query(
    `SELECT p.id, p.vehicle_id, v.make, v.model, p.unit_price, p.created_at
       FROM purchases p
       LEFT JOIN vehicles v ON v.id = p.vehicle_id
      WHERE p.user_id = $1
      ORDER BY p.created_at DESC, p.id DESC`,
    [userId],
  );
  return rows.map((r) => ({
    id: r.id,
    vehicleId: r.vehicle_id,
    make: r.make,
    model: r.model,
    unitPrice: Number(r.unit_price),
    createdAt: r.created_at,
  }));
}