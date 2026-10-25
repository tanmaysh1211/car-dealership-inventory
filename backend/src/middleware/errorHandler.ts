import { NextFunction, Request, Response } from 'express';
import { AppError } from '../errors';

export function notFound(_req: Request, _res: Response, next: NextFunction): void {
  next(new AppError(404, 'Route not found'));
}

// Express recognises error handlers by their 4-argument signature.
export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.status).json({ error: err.message, ...(err.details ? { details: err.details } : {}) });
    return;
  }
  if (err?.type === 'entity.parse.failed') {
    res.status(400).json({ error: 'Malformed JSON body' });
    return;
  }
  if (!process.env.VITEST) console.error(err);
  res.status(500).json({ error: 'Internal server error' });
}
