import request from 'supertest';
import app from '../../src/app';
import prisma from '../../src/config/db';
import * as rabbitmq from '../../src/config/rabbitmq';

// Mock RabbitMQ to avoid connection errors during tests
jest.mock('../../src/config/rabbitmq', () => ({
  enqueueDelivery: jest.fn().mockResolvedValue(true),
  connectRabbitMQ: jest.fn().mockResolvedValue(undefined),
}));

describe('Events API Integration Tests', () => {
  let apiKey: string;
  let subscriptionId: string;
  const username = 'eventtestuser_' + Date.now();
  const eventType = 'test.event.integration';

  beforeAll(async () => {
    // Register user
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        username,
        password: 'password123',
        email: 'eventtest@example.com'
      });
    apiKey = res.body.data.apiKey;

    // Create a subscription for the event
    const subRes = await request(app)
      .post('/api/v1/subscriptions')
      .set('Authorization', `Bearer ${apiKey}`)
      .send({
        url: 'https://httpbin.org/post',
        events: [eventType]
      });
    subscriptionId = subRes.body.data.id;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.delivery.deleteMany({
      where: { subscriptionId }
    });
    await prisma.subscription.deleteMany({
      where: { id: subscriptionId }
    });
    await prisma.event.deleteMany({
      where: { type: eventType }
    });
    await prisma.admin.deleteMany({
      where: { username }
    });
    await prisma.$disconnect();
  });

  describe('POST /api/v1/events', () => {
    test('should ingest an event and create deliveries', async () => {
      const response = await request(app)
        .post('/api/v1/events')
        .set('Authorization', `Bearer ${apiKey}`)
        .send({
          type: eventType,
          payload: { foo: 'bar', timestamp: Date.now() }
        });

      expect(response.status).toBe(202);
      expect(response.body.status).toBe('accepted');
      expect(response.body.data.deliveriesScheduled).toBeGreaterThanOrEqual(1);
      
      // Verify RabbitMQ mock was called
      expect(rabbitmq.enqueueDelivery).toHaveBeenCalled();
    });

    test('should return 400 for invalid event data', async () => {
      const response = await request(app)
        .post('/api/v1/events')
        .set('Authorization', `Bearer ${apiKey}`)
        .send({
          type: '', // Invalid type
          payload: {}
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/v1/events', () => {
    test('should return list of ingested events', async () => {
      const response = await request(app)
        .get('/api/v1/events')
        .set('Authorization', `Bearer ${apiKey}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.some((e: any) => e.type === eventType)).toBe(true);
    });
  });
});
