import { afterAll, beforeEach } from 'vitest';
import { pool } from '../db/pool';
import { resetDb } from './helpers';

beforeEach(resetDb);          // every test starts from an empty database
afterAll(() => pool.end());   // let the process exit cleanly
