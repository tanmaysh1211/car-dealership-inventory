import { describe, expect, it } from 'vitest';
import { api, bearer, createUser, createVehicle } from './helpers';

const newCar = { make: 'Honda', model: 'Civic', category: 'Sedan', price: 22000, quantity: 3 };

describe('POST /api/vehicles', () => {
  it('lets an admin add a vehicle', async () => {
    const { token } = await createUser('ADMIN');
    const res = await api().post('/api/vehicles').set(bearer(token)).send(newCar);
    expect(res.status).toBe(201);
    expect(res.body.vehicle).toMatchObject(newCar);
    expect(res.body.vehicle.id).toEqual(expect.any(Number));
  });

  it('forbids a normal user (403)', async () => {
    const { token } = await createUser('USER');
    expect((await api().post('/api/vehicles').set(bearer(token)).send(newCar)).status).toBe(403);
  });

  it('requires authentication (401)', async () => {
    expect((await api().post('/api/vehicles').send(newCar)).status).toBe(401);
  });

  it.each([
    ['zero price', { ...newCar, price: 0 }],
    ['negative price', { ...newCar, price: -5 }],
    ['negative quantity', { ...newCar, quantity: -1 }],
    ['fractional quantity', { ...newCar, quantity: 1.5 }],
    ['string price', { ...newCar, price: 'cheap' }],
    ['missing make', { ...newCar, make: '' }],
    ['missing category', { model: 'X', make: 'Y', price: 1, quantity: 1 }],
  ])('returns 400 for %s', async (_label, body) => {
    const { token } = await createUser('ADMIN');
    expect((await api().post('/api/vehicles').set(bearer(token)).send(body)).status).toBe(400);
  });
});

describe('GET /api/vehicles', () => {
  it('lists all vehicles, including out-of-stock ones', async () => {
    const { token } = await createUser('USER');
    await createVehicle({ model: 'Corolla', quantity: 5 });
    await createVehicle({ model: 'Model 3', quantity: 0 });
    const res = await api().get('/api/vehicles').set(bearer(token));
    expect(res.status).toBe(200);
    expect(res.body.vehicles).toHaveLength(2);
    expect(res.body.vehicles.map((v: any) => v.quantity)).toEqual([5, 0]);
  });

  it('returns price as a number', async () => {
    const { token } = await createUser('USER');
    await createVehicle({ price: 18000.5 });
    const res = await api().get('/api/vehicles').set(bearer(token));
    expect(res.body.vehicles[0].price).toBe(18000.5);
  });

  it('returns an empty list when there are no vehicles', async () => {
    const { token } = await createUser('USER');
    expect((await api().get('/api/vehicles').set(bearer(token))).body.vehicles).toEqual([]);
  });
});

describe('PUT /api/vehicles/:id', () => {
  it('lets an admin update some fields', async () => {
    const { token } = await createUser('ADMIN');
    const car = await createVehicle();
    const res = await api().put(`/api/vehicles/${car.id}`).set(bearer(token)).send({ price: 19999, quantity: 9 });
    expect(res.status).toBe(200);
    expect(res.body.vehicle).toMatchObject({ id: car.id, make: 'Toyota', price: 19999, quantity: 9 });
  });

  it('404 for an unknown id', async () => {
    const { token } = await createUser('ADMIN');
    expect((await api().put('/api/vehicles/9999').set(bearer(token)).send({ price: 1 })).status).toBe(404);
  });

  it('400 for invalid values, an empty body, or a bad id', async () => {
    const { token } = await createUser('ADMIN');
    const car = await createVehicle();
    expect((await api().put(`/api/vehicles/${car.id}`).set(bearer(token)).send({ price: -1 })).status).toBe(400);
    expect((await api().put(`/api/vehicles/${car.id}`).set(bearer(token)).send({})).status).toBe(400);
    expect((await api().put('/api/vehicles/abc').set(bearer(token)).send({ price: 1 })).status).toBe(400);
  });

  it('403 for a normal user', async () => {
    const { token } = await createUser('USER');
    const car = await createVehicle();
    expect((await api().put(`/api/vehicles/${car.id}`).set(bearer(token)).send({ price: 1 })).status).toBe(403);
  });
});

describe('DELETE /api/vehicles/:id', () => {
  it('lets an admin delete a vehicle (204) and it is gone', async () => {
    const { token } = await createUser('ADMIN');
    const car = await createVehicle();
    expect((await api().delete(`/api/vehicles/${car.id}`).set(bearer(token))).status).toBe(204);
    expect((await api().get('/api/vehicles').set(bearer(token))).body.vehicles).toEqual([]);
  });

  it('404 for an unknown id', async () => {
    const { token } = await createUser('ADMIN');
    expect((await api().delete('/api/vehicles/9999').set(bearer(token))).status).toBe(404);
  });

  it('403 for a normal user', async () => {
    const { token } = await createUser('USER');
    const car = await createVehicle();
    expect((await api().delete(`/api/vehicles/${car.id}`).set(bearer(token))).status).toBe(403);
  });

  it('keeps purchase history when a purchased vehicle is deleted', async () => {
    const admin = await createUser('ADMIN');
    const car = await createVehicle();
    await api().post(`/api/vehicles/${car.id}/purchase`).set(bearer(admin.token));
    expect((await api().delete(`/api/vehicles/${car.id}`).set(bearer(admin.token))).status).toBe(204);
  });
});


describe('GET /api/vehicles/:id', () => {
  it('returns one vehicle', async () => {
    const { token } = await createUser('USER');
    const car = await createVehicle({ make: 'Kia', model: 'Seltos' });
    const res = await api().get(`/api/vehicles/${car.id}`).set(bearer(token));
    expect(res.status).toBe(200);
    expect(res.body.vehicle).toMatchObject({ id: car.id, make: 'Kia', model: 'Seltos' });
  });

  it('404 with "Vehicle not found" for an unknown id', async () => {
    const { token } = await createUser('USER');
    const res = await api().get('/api/vehicles/9999').set(bearer(token));
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Vehicle not found');
  });

  it('400 for an invalid id', async () => {
    const { token } = await createUser('USER');
    expect((await api().get('/api/vehicles/abc').set(bearer(token))).status).toBe(400);
  });

  it('401 without a token', async () => {
    const car = await createVehicle();
    expect((await api().get(`/api/vehicles/${car.id}`)).status).toBe(401);
  });
});