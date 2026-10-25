import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from '../errors';

/** Requires `Authorization: Bearer <jwt>`; attaches `req.user` on success. */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) throw new AppError(401, 'Authentication required');

  try {
    const payload = jwt.verify(header.slice(7), env.jwtSecret) as jwt.JwtPayload;
    const id = Number(payload.sub);
    if (!Number.isInteger(id) || (payload.role !== 'USER' && payload.role !== 'ADMIN')) {
      throw new Error('bad payload');
    }
    req.user = { id, role: payload.role };
    next();
  } catch {
    throw new AppError(401, 'Invalid or expired token');
  }
}
