import { z } from 'zod';

// Unknown keys (e.g. `role`) are stripped by zod, so nobody can self-register as ADMIN.
export const registerSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  email: z.string().trim().toLowerCase().email('Invalid email'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Za-z]/, 'Password must contain a letter')
    .regex(/\d/, 'Password must contain a number'),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});
