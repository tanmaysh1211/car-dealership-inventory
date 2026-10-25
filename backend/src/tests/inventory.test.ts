import { describe, expect, it } from 'vitest';
import { pool } from '../db/pool';
import { api, bearer, createUser, createVehicle } from './helpers';

describe('POST /api/vehicles/:id/purchase', () => {
  it('decreases stock by one and returns the updated vehicle', async () => {
    const { token } = await createUser('USER');
    const car = await createVehicle({ quantity: 3 });
    const res = await api().post(`/api/vehicles/${car.id}/purchase`).set(bearer(token));
    expect(res.status).toBe(201);
    expect(res.body.vehicle.quantity).toBe(2);
  });

  it('records a purchase with the price at the time of sale', async () => {
    const { user, token } = await createUser('USER');
    const car = await createVehicle({ price: 18000, quantity: 2 });
    await api().post(`/api/vehicles/${car.id}/purchase`).set(bearer(token));
    const { rows } = await pool.query('SELECT * FROM purchases');
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ user_id: user.id, vehicle_id: car.id });
    expect(Number(rows[0].unit_price)).toBe(18000);
  });

  it('409 when the vehicle is out of stock, and nothing is recorded', async () => {
    const { token } = await createUser('USER');
    const car = await createVehicle({ quantity: 0 });
    const res = await api().post(`/api/vehicles/${car.id}/purchase`).set(bearer(token));
    expect(res.status).toBe(409);
    const { rows } = await pool.query('SELECT COUNT(*)::int AS n FROM purchases');
    expect(rows[0].n).toBe(0);
  });

  it('404 for a vehicle that does not exist', async () => {
    const { token } = await createUser('USER');
    expect((await api().post('/api/vehicles/9999/purchase').set(bearer(token))).status).toBe(404);
  });

  it('400 for an invalid id', async () => {
    const { token } = await createUser('USER');
    expect((await api().post('/api/vehicles/abc/purchase').set(bearer(token))).status).toBe(400);
  });

  it('401 without a token', async () => {
    const car = await createVehicle();
    expect((await api().post(`/api/vehicles/${car.id}/purchase`)).status).toBe(401);
  });

  it('never oversells under concurrent purchases', async () => {
    const { token } = await createUser('USER');
    const car = await createVehicle({ quantity: 3 });

    const responses = await Promise.all(
      Array.from({ length: 10 }, () => api().post(`/api/vehicles/${car.id}/purchase`).set(bearer(token))),
    );

    const statuses = responses.map((r) => r.status);
    expect(statuses.filter((s) => s === 201)).toHaveLength(3);
    expect(statuses.filter((s) => s === 409)).toHaveLength(7);

    const { rows } = await pool.query('SELECT quantity FROM vehicles WHERE id = $1', [car.id]);
    expect(rows[0].quantity).toBe(0);
    const purchases = await pool.query('SELECT COUNT(*)::int AS n FROM purchases');
    expect(purchases.rows[0].n).toBe(3);
  });
});

describe('POST /api/vehicles/:id/restock', () => {
  it('lets an admin increase stock', async () => {
    const { token } = await createUser('ADMIN');
    const car = await createVehicle({ quantity: 1 });
    const res = await api().post(`/api/vehicles/${car.id}/restock`).set(bearer(token)).send({ amount: 4 });
    expect(res.status).toBe(200);
    expect(res.body.vehicle.quantity).toBe(5);
  });

  it('makes an out-of-stock vehicle purchasable again', async () => {
    const admin = await createUser('ADMIN');
    const buyer = await createUser('USER');
    const car = await createVehicle({ quantity: 0 });
    expect((await api().post(`/api/vehicles/${car.id}/purchase`).set(bearer(buyer.token))).status).toBe(409);
    await api().post(`/api/vehicles/${car.id}/restock`).set(bearer(admin.token)).send({ amount: 2 });
    expect((await api().post(`/api/vehicles/${car.id}/purchase`).set(bearer(buyer.token))).status).toBe(201);
  });

  it('403 for a normal user', async () => {
    const { token } = await createUser('USER');
    const car = await createVehicle();
    expect((await api().post(`/api/vehicles/${car.id}/restock`).set(bearer(token)).send({ amount: 1 })).status).toBe(403);
  });

  it.each([[0], [-3], [1.5], ['ten']])('400 for invalid amount %s', async (amount) => {
    const { token } = await createUser('ADMIN');
    const car = await createVehicle();
    expect((await api().post(`/api/vehicles/${car.id}/restock`).set(bearer(token)).send({ amount })).status).toBe(400);
  });

  it('404 for an unknown vehicle', async () => {
    const { token } = await createUser('ADMIN');
    expect((await api().post('/api/vehicles/9999/restock').set(bearer(token)).send({ amount: 1 })).status).toBe(404);
  });
});
