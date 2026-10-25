import bcrypt from 'bcryptjs';
import request from 'supertest';
import { createApp } from '../app';
import { pool } from '../db/pool';
import { env } from '../config/env';
import { signToken } from '../modules/auth/auth.service';
import { insertUser } from '../modules/auth/auth.repository';
import * as vehicleRepo from '../modules/vehicles/vehicle.repository';

export const app = createApp();
export const api = () => request(app);

/** Wipes every table. Refuses to run unless the DB name ends in `_test`. */
export async function resetDb() {
  if (!/_test$/.test(new URL(env.databaseUrl).pathname.slice(1))) {
    throw new Error('Refusing to wipe a database whose name does not end in _test');
  }
  await pool.query('TRUNCATE purchases, vehicles, users RESTART IDENTITY CASCADE');
}

let counter = 0;
/** Inserts a user directly and returns it with a ready-to-use JWT. */
export async function createUser(role: 'USER' | 'ADMIN' = 'USER') {
  counter += 1;
  const user = await insertUser({
    name: `${role} ${counter}`,
    email: `${role.toLowerCase()}${counter}@test.com`,
    passwordHash: await bcrypt.hash('Password1', 4), // low cost = fast tests
    role,
  });
  return { user, token: signToken(user) };
}

export const bearer = (token: string) => ({ Authorization: `Bearer ${token}` });

export const createVehicle = (overrides: Partial<Parameters<typeof vehicleRepo.insert>[0]> = {}) =>
  vehicleRepo.insert({ make: 'Toyota', model: 'Corolla', category: 'Sedan', price: 18000, quantity: 5, ...overrides });
