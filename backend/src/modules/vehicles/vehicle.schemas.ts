import { z } from 'zod';

export const createVehicleSchema = z.object({
  make: z.string().trim().min(1, 'Make is required'),
  model: z.string().trim().min(1, 'Model is required'),
  category: z.string().trim().min(1, 'Category is required'),
  price: z.number({ error: 'Price must be a number' }).positive('Price must be greater than 0'),
  quantity: z.number({ error: 'Quantity must be a number' }).int('Quantity must be a whole number').min(0, 'Quantity cannot be negative'),
});

export const updateVehicleSchema = createVehicleSchema
  .partial()
  .refine((v) => Object.keys(v).length > 0, { message: 'Provide at least one field to update' });

export const searchSchema = z
  .object({
    make: z.string().trim().min(1).optional(),
    model: z.string().trim().min(1).optional(),
    category: z.string().trim().min(1).optional(),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
  })
  .refine((f) => f.minPrice === undefined || f.maxPrice === undefined || f.minPrice <= f.maxPrice, {
    message: 'minPrice cannot be greater than maxPrice',
  });

export const restockSchema = z.object({
  amount: z.number({ error: 'Amount must be a number' }).int('Amount must be a whole number').positive('Amount must be greater than 0'),
});

export const idParamSchema = z.object({ id: z.coerce.number().int().positive('Invalid vehicle id') });

export type CreateVehicle = z.infer<typeof createVehicleSchema>;
export type UpdateVehicle = z.infer<typeof updateVehicleSchema>;
export type SearchFilters = z.infer<typeof searchSchema>;
