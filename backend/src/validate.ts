import { ZodType } from 'zod';
import { AppError } from './errors';

/** Parse `data` with a zod schema or throw a 400 AppError listing every problem. */
export function validate<T>(schema: ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const details = result.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message }));
    throw new AppError(400, 'Validation failed', details);
  }
  return result.data;
}
