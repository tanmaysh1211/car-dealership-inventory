import { describe, expect, it } from 'vitest';
import { api, bearer, createUser, createVehicle } from './helpers';

describe('GET /api/purchases/mine', () => {
  it('401 without a token', async () => {
    expect((await api().get('/api/purchases/mine')).status).toBe(401);
  });

  it('returns an empty list when the user has bought nothing', async () => {
    const { token } = await createUser('USER');
    const res = await api().get('/api/purchases/mine').set(bearer(token));
    expect(res.status).toBe(200);
    expect(res.body.purchases).toEqual([]);
  });

  it('returns only my purchases, newest first, with the price paid', async () => {
    const me = await createUser('USER');
    const other = await createUser('USER');
    const corolla = await createVehicle({ make: 'Toyota', model: 'Corolla', price: 18000 });
    const civic = await createVehicle({ make: 'Honda', model: 'Civic', price: 22000 });
    await api().post(`/api/vehicles/${corolla.id}/purchase`).set(bearer(me.token));
    await api().post(`/api/vehicles/${civic.id}/purchase`).set(bearer(me.token));
    await api().post(`/api/vehicles/${civic.id}/purchase`).set(bearer(other.token));

    const res = await api().get('/api/purchases/mine').set(bearer(me.token));
    expect(res.status).toBe(200);
    expect(res.body.purchases).toHaveLength(2);
    expect(res.body.purchases.map((p: { model: string }) => p.model)).toEqual(['Civic', 'Corolla']);
    expect(res.body.purchases[0]).toMatchObject({ make: 'Honda', unitPrice: 22000 });
  });

  it('keeps a purchase in the list after its vehicle is deleted (details become null)', async () => {
    const admin = await createUser('ADMIN');
    const car = await createVehicle({ quantity: 1 });
    await api().post(`/api/vehicles/${car.id}/purchase`).set(bearer(admin.token));
    await api().delete(`/api/vehicles/${car.id}`).set(bearer(admin.token));

    const res = await api().get('/api/purchases/mine').set(bearer(admin.token));
    expect(res.body.purchases).toHaveLength(1);
    expect(res.body.purchases[0]).toMatchObject({ vehicleId: null, make: null, model: null });
  });
});