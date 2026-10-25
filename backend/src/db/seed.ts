import bcrypt from 'bcryptjs';
import { pool } from './pool';

/** Creates an admin, a demo user and sample vehicles. Safe to re-run. */
async function seed() {
  const adminEmail = (process.env.ADMIN_EMAIL ?? 'admin@dealership.com').toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'Admin@12345';

  const users: [string, string, string, string][] = [
    ['Admin', adminEmail, adminPassword, 'ADMIN'],
    ['Demo User', 'user@dealership.com', 'User@12345', 'USER'],
  ];
  for (const [name, email, password, role] of users) {
    await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1,$2,$3,$4) ON CONFLICT (email) DO NOTHING',
      [name, email, await bcrypt.hash(password, 10), role],
    );
  }

  const { rows } = await pool.query('SELECT COUNT(*)::int AS n FROM vehicles');
  if (rows[0].n === 0) {
    const cars: [string, string, string, number, number][] = [
      ['Toyota', 'Corolla', 'Sedan', 18000, 5],
      ['Honda', 'Civic', 'Sedan', 22000, 3],
      ['Hyundai', 'Creta', 'SUV', 25000, 4],
      ['Tesla', 'Model 3', 'Electric', 35000, 0],
      ['Ford', 'Mustang', 'Coupe', 42000, 2],
      ['Kia', 'Seltos', 'SUV', 24000, 6],
      ['BMW', '3 Series', 'Sedan', 45000, 1],
      ['Nissan', 'Leaf', 'Electric', 29000, 3],
      ['Jeep', 'Wrangler', 'SUV', 38000, 2],
      ['Mazda', 'MX-5', 'Convertible', 31000, 0],
    ];
    for (const c of cars) {
      await pool.query('INSERT INTO vehicles (make, model, category, price, quantity) VALUES ($1,$2,$3,$4,$5)', c);
    }
  }
  console.log(`Seeded. Admin login: ${adminEmail} / ${adminPassword}   |   User login: user@dealership.com / User@12345`);
}

seed().catch((e) => { console.error(e); process.exitCode = 1; }).finally(() => pool.end());
