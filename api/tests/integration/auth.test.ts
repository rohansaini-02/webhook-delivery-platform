import request from 'supertest';
import app from '../../src/app';
import prisma from '../../src/config/db';

describe('Auth API Integration Tests', () => {
  const testUser = {
    username: 'testuser_' + Date.now(),
    password: 'password123',
    email: 'test@example.com'
  };

  afterAll(async () => {
    // Cleanup the test user
    await prisma.admin.deleteMany({
      where: { username: testUser.username }
    });
    await prisma.$disconnect();
  });

  describe('POST /api/v1/auth/register', () => {
    test('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser);

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('ok');
      expect(response.body.data.username).toBe(testUser.username);
      expect(response.body.data.apiKey).toBeDefined();
    });

    test('should fail if username already exists', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('already taken');
    });

    test('should fail with invalid input (short password)', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({ ...testUser, username: 'unique_user', password: '123' });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    test('should login successfully with correct credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          username: testUser.username,
          password: testUser.password
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
      expect(response.body.data.apiKey).toBeDefined();
    });

    test('should fail with incorrect password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          username: testUser.username,
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
    });
  });
});
