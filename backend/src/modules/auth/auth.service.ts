import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { AppError } from '../../errors';
import type { Role } from '../../types/express';
import * as repo from './auth.repository';

export interface PublicUser { id: number; name: string; email: string; role: Role }

const toPublic = (u: repo.UserRecord): PublicUser => ({ id: u.id, name: u.name, email: u.email, role: u.role });

/** The token holds only the user id (sub) and role, never anything sensitive. */
export function signToken(user: { id: number; role: Role }): string {
  return jwt.sign({ role: user.role }, env.jwtSecret, {
    subject: String(user.id),
    expiresIn: env.jwtExpiresInSeconds,
  });
}

export async function register(input: { name: string; email: string; password: string }): Promise<PublicUser> {
  if (await repo.findUserByEmail(input.email)) throw new AppError(409, 'Email already registered');
  const passwordHash = await bcrypt.hash(input.password, 10);
  try {
    // Role is never taken from input: public registration always creates a USER.
    return toPublic(await repo.insertUser({ name: input.name, email: input.email, passwordHash }));
  } catch (err: any) {
    if (err.code === '23505') throw new AppError(409, 'Email already registered'); // race condition
    throw err;
  }
}

export async function login(input: { email: string; password: string }): Promise<{ token: string; user: PublicUser }> {
  const user = await repo.findUserByEmail(input.email);
  // Same message for "no such user" and "wrong password" so emails can't be enumerated.
  if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
    throw new AppError(401, 'Invalid email or password');
  }
  return { token: signToken(user), user: toPublic(user) };
}
