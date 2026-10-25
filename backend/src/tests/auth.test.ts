import { describe, expect, it } from 'vitest';
import { pool } from '../db/pool';
import { api, createUser } from './helpers';

const valid = { name: 'Tanmay', email: 'tanmay@example.com', password: 'Secret123' };

describe('POST /api/auth/register', () => {
  it('creates a USER and never returns the password hash', async () => {
    const res = await api().post('/api/auth/register').send(valid);
    expect(res.status).toBe(201);
    expect(res.body.user).toMatchObject({ name: 'Tanmay', email: 'tanmay@example.com', role: 'USER' });
    expect(JSON.stringify(res.body)).not.toMatch(/password/i);
  });

  it('stores a bcrypt hash, not the plaintext password', async () => {
    await api().post('/api/auth/register').send(valid);
    const { rows } = await pool.query('SELECT password_hash FROM users');
    expect(rows[0].password_hash).not.toBe(valid.password);
    expect(rows[0].password_hash).toMatch(/^\$2[aby]\$/);
  });

  it('ignores a role sent by the client (no self-promotion to ADMIN)', async () => {
    const res = await api().post('/api/auth/register').send({ ...valid, role: 'ADMIN' });
    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe('USER');
  });

  it('rejects a duplicate email (case-insensitive) with 409', async () => {
    await api().post('/api/auth/register').send(valid);
    const res = await api().post('/api/auth/register').send({ ...valid, email: 'TANMAY@example.com' });
    expect(res.status).toBe(409);
  });

  it.each([
    ['missing name', { ...valid, name: '' }],
    ['missing email', { name: 'T', password: 'Secret123' }],
    ['invalid email', { ...valid, email: 'not-an-email' }],
    ['short password', { ...valid, password: 'abc1' }],
    ['password without a number', { ...valid, password: 'abcdefghij' }],
    ['password without a letter', { ...valid, password: '1234567890' }],
  ])('returns 400 for %s', async (_label, body) => {
    const res = await api().post('/api/auth/register').send(body);
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
  });

  it('returns 400 for malformed JSON', async () => {
    const res = await api().post('/api/auth/register').set('Content-Type', 'application/json').send('{bad json');
    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  it('returns a JWT and the user for valid credentials', async () => {
    await api().post('/api/auth/register').send(valid);
    const res = await api().post('/api/auth/login').send({ email: valid.email, password: valid.password });
    expect(res.status).toBe(200);
    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.user).toMatchObject({ email: valid.email, role: 'USER' });
  });

  it('rejects a wrong password with 401', async () => {
    await api().post('/api/auth/register').send(valid);
    const res = await api().post('/api/auth/login').send({ email: valid.email, password: 'WrongPass1' });
    expect(res.status).toBe(401);
  });

  it('rejects an unknown email with the same 401 message (no user enumeration)', async () => {
    await api().post('/api/auth/register').send(valid);
    const wrongPw = await api().post('/api/auth/login').send({ email: valid.email, password: 'WrongPass1' });
    const unknown = await api().post('/api/auth/login').send({ email: 'nobody@example.com', password: 'Secret123' });
    expect(unknown.status).toBe(401);
    expect(unknown.body.error).toBe(wrongPw.body.error);
  });

  it('returns 400 when fields are missing', async () => {
    const res = await api().post('/api/auth/login').send({});
    expect(res.status).toBe(400);
  });

  it('the issued token works on a protected route', async () => {
    await createUser('USER');
    await api().post('/api/auth/register').send(valid);
    const { body } = await api().post('/api/auth/login').send({ email: valid.email, password: valid.password });
    const res = await api().get('/api/vehicles').set('Authorization', `Bearer ${body.token}`);
    expect(res.status).toBe(200);
  });
});

describe('misc', () => {
  it('GET /api/health responds ok', async () => {
    const res = await api().get('/api/health');
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('unknown routes return 404', async () => {
    const res = await api().get('/api/nope');
    expect(res.status).toBe(404);
  });
});
