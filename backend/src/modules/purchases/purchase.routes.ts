import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import * as service from './puchase.service';

export const purchaseRouter = Router();

// Every purchase endpoint requires a valid JWT.
purchaseRouter.use(authenticate);

purchaseRouter.get('/mine', async (req, res) => {
  res.json({ purchases: await service.listMyPurchases(req.user!.id) });
});