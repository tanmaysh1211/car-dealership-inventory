import { Pool } from 'pg';
import { env } from '../config/env';

/** One shared connection pool for the whole app. */
export const pool = new Pool({ connectionString: env.databaseUrl });
