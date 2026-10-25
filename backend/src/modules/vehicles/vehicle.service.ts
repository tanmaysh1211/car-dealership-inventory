import { AppError } from '../../errors';
import * as repo from './vehicle.repository';
import type { CreateVehicle, SearchFilters, UpdateVehicle } from './vehicle.schemas';

const notFound = () => new AppError(404, 'Vehicle not found');

export const createVehicle = (data: CreateVehicle) => repo.insert(data);
export const listVehicles = () => repo.findAll();
export const searchVehicles = (filters: SearchFilters) => repo.search(filters);

export async function updateVehicle(id: number, changes: UpdateVehicle) {
  const vehicle = await repo.update(id, changes);
  if (!vehicle) throw notFound();
  return vehicle;
}

export async function deleteVehicle(id: number): Promise<void> {
  if (!(await repo.remove(id))) throw notFound();
}

export async function restockVehicle(id: number, amount: number) {
  const vehicle = await repo.addStock(id, amount);
  if (!vehicle) throw notFound();
  return vehicle;
}

export async function purchaseVehicle(userId: number, vehicleId: number) {
  const result = await repo.purchaseOne(userId, vehicleId);
  if (result) return result;
  // The atomic update failed: either the vehicle doesn't exist, or it's out of stock.
  if (!(await repo.findById(vehicleId))) throw notFound();
  throw new AppError(409, 'Vehicle is out of stock');
}
