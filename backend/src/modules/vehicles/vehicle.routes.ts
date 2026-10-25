import { Request, Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorizeAdmin } from '../../middleware/authorizeAdmin';
import { validate } from '../../validate';
import * as service from './vehicle.service';
import {
  createVehicleSchema, idParamSchema, restockSchema, searchSchema, updateVehicleSchema,
} from './vehicle.schemas';

export const vehicleRouter = Router();

/** Reads and validates the :id route parameter. */
const vehicleId = (req: Request) => validate(idParamSchema, req.params).id;

// Every vehicle endpoint requires a valid JWT.
vehicleRouter.use(authenticate);

vehicleRouter.get('/', async (_req, res) => {
  res.json({ vehicles: await service.listVehicles() });
});

// NOTE: /search must be registered BEFORE /:id, otherwise "search" is treated as an id.
vehicleRouter.get('/search', async (req, res) => {
  res.json({ vehicles: await service.searchVehicles(validate(searchSchema, req.query)) });
});

vehicleRouter.get('/:id', async (req, res) => {
  const id = vehicleId(req);
  res.json({ vehicle: await service.getVehicle(id) });
});

vehicleRouter.post('/', authorizeAdmin, async (req, res) => {
  res.status(201).json({ vehicle: await service.createVehicle(validate(createVehicleSchema, req.body)) });
});

vehicleRouter.put('/:id', authorizeAdmin, async (req, res) => {
  const id = vehicleId(req);
  res.json({ vehicle: await service.updateVehicle(id, validate(updateVehicleSchema, req.body)) });
});

vehicleRouter.delete('/:id', authorizeAdmin, async (req, res) => {
  const id = vehicleId(req);
  await service.deleteVehicle(id);
  res.status(204).end();
});

vehicleRouter.post('/:id/purchase', async (req, res) => {
  const id = vehicleId(req);
  res.status(201).json(await service.purchaseVehicle(req.user!.id, id));
});

vehicleRouter.post('/:id/restock', authorizeAdmin, async (req, res) => {
  const id = vehicleId(req);
  const { amount } = validate(restockSchema, req.body);
  res.json({ vehicle: await service.restockVehicle(id, amount) });
});
