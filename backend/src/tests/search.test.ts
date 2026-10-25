import { beforeEach, describe, expect, it } from 'vitest';
import { api, bearer, createUser, createVehicle } from './helpers';

let token: string;

beforeEach(async () => {
  ({ token } = await createUser('USER'));
  await createVehicle({ make: 'Toyota', model: 'Corolla', category: 'Sedan', price: 18000 });
  await createVehicle({ make: 'Honda', model: 'Civic', category: 'Sedan', price: 22000 });
  await createVehicle({ make: 'Hyundai', model: 'Creta', category: 'SUV', price: 25000 });
  await createVehicle({ make: 'Tesla', model: 'Model 3', category: 'Electric', price: 35000, quantity: 0 });
});

const search = async (query: Record<string, string>) => {
  const res = await api().get('/api/vehicles/search').query(query).set(bearer(token));
  return { status: res.status, models: (res.body.vehicles ?? []).map((v: any) => v.model) as string[] };
};

describe('GET /api/vehicles/search', () => {
  it('requires authentication', async () => {
    expect((await api().get('/api/vehicles/search')).status).toBe(401);
  });

  it('with no filters returns everything', async () => {
    expect((await search({})).models).toHaveLength(4);
  });

  it('filters by make (case-insensitive, partial)', async () => {
    expect((await search({ make: 'toy' })).models).toEqual(['Corolla']);
  });

  it('filters by model (partial)', async () => {
    expect((await search({ model: 'civ' })).models).toEqual(['Civic']);
  });

  it('filters by category (case-insensitive)', async () => {
    expect((await search({ category: 'suv' })).models).toEqual(['Creta']);
  });

  it('filters by min price', async () => {
    expect((await search({ minPrice: '25000' })).models).toEqual(['Creta', 'Model 3']);
  });

  it('filters by max price', async () => {
    expect((await search({ maxPrice: '20000' })).models).toEqual(['Corolla']);
  });

  it('filters by a price range (inclusive)', async () => {
    expect((await search({ minPrice: '18000', maxPrice: '22000' })).models).toEqual(['Corolla', 'Civic']);
  });

  it('combines filters', async () => {
    expect((await search({ category: 'Sedan', maxPrice: '20000' })).models).toEqual(['Corolla']);
  });

  it('returns an empty list when nothing matches', async () => {
    expect((await search({ make: 'Ferrari' })).models).toEqual([]);
  });

  it('treats % literally instead of as a wildcard', async () => {
    expect((await search({ make: '%' })).models).toEqual([]);
  });

  it('is not shadowed by the /:id route', async () => {
    expect((await search({ make: 'Tesla' })).status).toBe(200);
  });

  it('400 for a non-numeric or inverted price range', async () => {
    expect((await search({ minPrice: 'abc' })).status).toBe(400);
    expect((await search({ minPrice: '30000', maxPrice: '10000' })).status).toBe(400);
  });
});
