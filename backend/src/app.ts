import cors from 'cors';
import express from 'express';
import { env } from './config/env';
import { errorHandler, notFound } from './middleware/errorHandler';
import { purchaseRouter } from './modules/purchases/purchase.routes';
import { authRouter } from './modules/auth/auth.routes';
import { vehicleRouter } from './modules/vehicles/vehicle.routes';

/** Builds the Express app (separate from server.ts so tests can import it without listening). */
export function createApp() {
  const app = express();
  app.use(cors({ origin: env.corsOrigin }));
  app.use(express.json());

  app.get('/api/health', (_req, res) => { res.json({ status: 'ok' }); });
  app.use('/api/auth', authRouter);
  app.use('/api/vehicles', vehicleRouter);
  app.use('/api/purchases', purchaseRouter);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
