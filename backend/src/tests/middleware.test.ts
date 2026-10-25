import jwt from 'jsonwebtoken';
import { describe, expect, it } from 'vitest';
import { env } from '../config/env';
import { api, bearer, createUser } from './helpers';

describe('authenticate middleware', () => {
  it('401 when no token is sent', async () => {
    expect((await api().get('/api/vehicles')).status).toBe(401);
  });

  it('401 when the header is not a Bearer token', async () => {
    const res = await api().get('/api/vehicles').set('Authorization', 'Token abc');
    expect(res.status).toBe(401);
  });

  it('401 for a garbage token', async () => {
    const res = await api().get('/api/vehicles').set(bearer('not.a.jwt'));
    expect(res.status).toBe(401);
  });

  it('401 for an expired token', async () => {
    const expired = jwt.sign({ role: 'USER' }, env.jwtSecret, { subject: '1', expiresIn: -10 });
    expect((await api().get('/api/vehicles').set(bearer(expired))).status).toBe(401);
  });

  it('401 for a token signed with the wrong secret', async () => {
    const forged = jwt.sign({ role: 'ADMIN' }, 'attacker-secret', { subject: '1' });
    expect((await api().get('/api/vehicles').set(bearer(forged))).status).toBe(401);
  });

  it('401 for a validly signed token with an unknown role', async () => {
    const odd = jwt.sign({ role: 'SUPERUSER' }, env.jwtSecret, { subject: '1' });
    expect((await api().get('/api/vehicles').set(bearer(odd))).status).toBe(401);
  });

  it('200 for a valid token', async () => {
    const { token } = await createUser('USER');
    expect((await api().get('/api/vehicles').set(bearer(token))).status).toBe(200);
  });
});

describe('authorizeAdmin middleware', () => {
  it('403 when a normal user hits an admin endpoint', async () => {
    const { token } = await createUser('USER');
    const res = await api().post('/api/vehicles').set(bearer(token)).send({});
    expect(res.status).toBe(403);
  });
});
