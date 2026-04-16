import request from 'supertest';
import app from '../../src/app';
import prisma from '../../src/config/db';

describe('Deliveries API Integration Tests', () => {
  let apiKey: string;
  const username = 'deltestuser_' + Date.now();

  beforeAll(async () => {
    // Register user
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        username,
        password: 'password123',
        email: 'deltest@example.com'
      });
    apiKey = res.body.data.apiKey;

    // We don't necessarily need to create deliveries here if we just want to test listing/pagination
    // but having at least one is good. 
  });

  afterAll(async () => {
    // Cleanup
    await prisma.admin.deleteMany({
      where: { username }
    });
    await prisma.$disconnect();
  });

  describe('GET /api/v1/deliveries', () => {
    test('should return list of deliveries with pagination', async () => {
      const response = await request(app)
        .get('/api/v1/deliveries')
        .set('Authorization', `Bearer ${apiKey}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.pagination).toBeDefined();
    });
  });

  describe('GET /api/v1/deliveries/dlq', () => {
    test('should return list of DLQ items', async () => {
      const response = await request(app)
        .get('/api/v1/deliveries/dlq')
        .set('Authorization', `Bearer ${apiKey}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('Health Check', () => {
    test('GET /health should return system status', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
      expect(response.body.checks.database).toBe(true);
    });
  });
  });
});

// Final test coverage for Delivery pipeline
