const request = require('supertest');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = require('../server');
const User = require('../models/User');
const Watchlist = require('../models/Watchlist');
const { connectTestDB, closeTestDB } = require('./setup');

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

let adminToken, userToken, adminId, userId;

beforeAll(async () => {
  await connectTestDB();
  const admin = await User.create({
    username: 'admin',
    email: 'admin@test.com',
    password: await bcrypt.hash('password123', 10),
    role: 'admin',
  });
  const user = await User.create({
    username: 'alice',
    email: 'alice@test.com',
    password: await bcrypt.hash('password123', 10),
    role: 'user',
  });
  adminId = admin._id.toString();
  userId = user._id.toString();
  adminToken = jwt.sign({ id: adminId, username: 'admin', role: 'admin' }, process.env.JWT_SECRET);
  userToken = jwt.sign({ id: userId, username: 'alice', role: 'user' }, process.env.JWT_SECRET);
});

afterAll(async () => {
  await closeTestDB();
});

describe('Auth flow', () => {
  test('registers a new user with 201 and returns token + role', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'bob', email: 'bob@test.com', password: 'password123' });
    expect(res.statusCode).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('user');
    expect(res.body.user.isOnboarded).toBe(false);
  });

  test('rejects duplicate email with 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'admin2', email: 'admin@test.com', password: 'password123' });
    expect(res.statusCode).toBe(400);
  });

  test('rejects missing fields with 400', async () => {
    const res = await request(app).post('/api/auth/register').send({ username: 'x' });
    expect(res.statusCode).toBe(400);
  });

  test('logs in with valid credentials (200)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alice@test.com', password: 'password123' });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  test('rejects wrong password with 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alice@test.com', password: 'wrong' });
    expect(res.statusCode).toBe(401);
  });
});

describe('RBAC + Admin routes', () => {
  test('unauthenticated admin access returns 401', async () => {
    const res = await request(app).get('/api/admin/analytics');
    expect(res.statusCode).toBe(401);
  });

  test('non-admin user is forbidden from admin routes (403)', async () => {
    const res = await request(app).get('/api/admin/analytics').set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(403);
  });

  test('admin can fetch analytics', async () => {
    const res = await request(app).get('/api/admin/analytics').set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.totals).toHaveProperty('users');
    expect(res.body.totals).toHaveProperty('watchlistItems');
    expect(typeof res.body.onboardingRate).toBe('number');
  });

  test('admin user table supports search + pagination', async () => {
    const res = await request(app)
      .get('/api/admin/users?search=ali&page=1&limit=5')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.page).toBe(1);
    expect(res.body.totalPages).toBeGreaterThanOrEqual(1);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('admin can promote a user to admin', async () => {
    const res = await request(app)
      .patch(`/api/admin/users/${userId}/role`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'admin' });
    expect(res.statusCode).toBe(200);
    expect(res.body.role).toBe('admin');
  });

  test('admin rejects invalid role value', async () => {
    const res = await request(app)
      .patch(`/api/admin/users/${userId}/role`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'superuser' });
    expect(res.statusCode).toBe(400);
  });
});

describe('Watchlist scoping (security)', () => {
  test('user can only see their own watchlist (no cross-user leak)', async () => {
    await Watchlist.create({ userId, tmdbId: 999, movieTitle: 'Leak Test' });
    const res = await request(app).get('/api/watchlist').set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.items.every((i) => i.tmdbId === 999)).toBe(true);
    // admin's token would scope to admin, not user — verifying isolation
    const adminRes = await request(app).get('/api/watchlist').set('Authorization', `Bearer ${adminToken}`);
    expect(adminRes.body.items.find((i) => i.tmdbId === 999)).toBeUndefined();
  });
});
