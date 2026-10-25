import dotenv from 'dotenv';

// Tests load .env.test so they never touch the development database.
const isTest = process.env.NODE_ENV === 'test' || Boolean(process.env.VITEST);
dotenv.config({ path: isTest ? '.env.test' : '.env' });

export const env = {
  databaseUrl: process.env.DATABASE_URL ?? '',
  jwtSecret: process.env.JWT_SECRET ?? 'dev-only-secret-change-me',
  jwtExpiresInSeconds: 60 * 60, // 1 hour
  port: Number(process.env.PORT ?? 5000),
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
};
