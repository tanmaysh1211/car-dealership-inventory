import { NextFunction, Request, Response } from 'express';
import { AppError } from '../errors';

/** Must run after `authenticate`. Rejects anyone who is not an ADMIN. */
export function authorizeAdmin(req: Request, _res: Response, next: NextFunction): void {
  if (req.user?.role !== 'ADMIN') throw new AppError(403, 'Admin access required');
  next();
}
