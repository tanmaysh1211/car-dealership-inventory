import { runMigrations } from '../db/migrate';
import { pool } from '../db/pool';

/** Runs once before the suite: make sure the test database has the schema. */
export default async function setup() {
  await runMigrations();
  await pool.end();
}
