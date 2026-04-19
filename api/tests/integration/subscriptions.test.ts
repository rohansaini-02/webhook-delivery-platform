import request from 'supertest';
import app from '../../src/app';
import prisma from '../../src/config/db';

describe('Subscriptions API Integration Tests', () => {
  let apiKey: string;
  let testSubscriptionId: string;
  const username = 'subtestuser_' + Date.now();

  beforeAll(async () => {
    // Register a user to get an API key
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        username,
        password: 'password123',
        email: 'subtest@example.com'
      });
    apiKey = res.body.data.apiKey;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.subscription.deleteMany({
      where: { url: 'https://test-webhook.com/endpoint' }
    });
    await prisma.admin.deleteMany({
      where: { username }
    });
    await prisma.$disconnect();
  });

  describe('POST /api/v1/subscriptions', () => {
    test('should create a new subscription', async () => {
      const response = await request(app)
        .post('/api/v1/subscriptions')
        .set('Authorization', `Bearer ${apiKey}`)
        .send({
          url: 'https://test-webhook.com/endpoint',
          events: ['user.created', 'order.paid']
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('ok');
      expect(response.body.data.url).toBe('https://test-webhook.com/endpoint');
      testSubscriptionId = response.body.data.id;
    });

    test('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/v1/subscriptions')
        .send({
          url: 'https://test-webhook.com/endpoint',
          events: ['test']
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/v1/subscriptions', () => {
    test('should return a list of subscriptions with pagination', async () => {
      const response = await request(app)
        .get('/api/v1/subscriptions')
        .set('Authorization', `Bearer ${apiKey}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.pagination).toBeDefined();
    });
  });

  describe('GET /api/v1/subscriptions/:id', () => {
    test('should return subscription details', async () => {
      const response = await request(app)
        .get(`/api/v1/subscriptions/${testSubscriptionId}`)
        .set('Authorization', `Bearer ${apiKey}`);

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(testSubscriptionId);
    });

    test('should return 404 for non-existent subscription', async () => {
      const response = await request(app)
        .get('/api/v1/subscriptions/non-existent-id')
        .set('Authorization', `Bearer ${apiKey}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /api/v1/subscriptions/:id', () => {
    test('should update subscription status', async () => {
      const response = await request(app)
        .patch(`/api/v1/subscriptions/${testSubscriptionId}`)
        .set('Authorization', `Bearer ${apiKey}`)
        .send({ isActive: false });

      expect(response.status).toBe(200);
      expect(response.body.data.isActive).toBe(false);
    });
  });
});
