import fs from 'fs';
import path from 'path';
import { pool } from './pool';

/** Applies sql/schema.sql (idempotent). Run from the backend/ folder. */
export async function runMigrations(): Promise<void> {
  const sql = fs.readFileSync(path.resolve(process.cwd(), 'sql/schema.sql'), 'utf8');
  await pool.query(sql);
}

if (require.main === module) {
  runMigrations()
    .then(() => console.log('Migrations applied.'))
    .catch((err) => { console.error(err); process.exitCode = 1; })
    .finally(() => pool.end());
}
