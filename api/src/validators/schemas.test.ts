import { 
  loginSchema, 
  registerSchema, 
  createSubscriptionSchema, 
  ingestEventSchema 
} from './schemas';

describe('Zod Validation Schemas', () => {
  describe('loginSchema', () => {
    test('should validate correct login data', () => {
      const result = loginSchema.safeParse({ username: 'rohan', password: 'password123' });
      expect(result.success).toBe(true);
    });

    test('should fail on short password', () => {
      const result = loginSchema.safeParse({ username: 'rohan', password: '123' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Password must be at least 6 characters');
      }
    });
  });

  describe('registerSchema', () => {
    test('should validate correct registration', () => {
      const result = registerSchema.safeParse({ 
        username: 'rohan', 
        password: 'password123',
        email: 'rohan@example.com' 
      });
      expect(result.success).toBe(true);
    });

    test('should fail on invalid email', () => {
      const result = registerSchema.safeParse({ 
        username: 'rohan', 
        password: 'password123',
        email: 'not-an-email' 
      });
      expect(result.success).toBe(false);
    });
  });

  describe('createSubscriptionSchema', () => {
    test('should validate correct subscription', () => {
      const result = createSubscriptionSchema.safeParse({ 
        url: 'https://webhook.site/test', 
        events: ['user.created', 'order.paid'] 
      });
      expect(result.success).toBe(true);
    });

    test('should fail on invalid URL', () => {
      const result = createSubscriptionSchema.safeParse({ 
        url: 'invalid-url', 
        events: ['test'] 
      });
      expect(result.success).toBe(false);
    });

    test('should fail on empty events array', () => {
      const result = createSubscriptionSchema.safeParse({ 
        url: 'https://webhook.site/test', 
        events: [] 
      });
      expect(result.success).toBe(false);
    });
  });

  describe('ingestEventSchema', () => {
    test('should validate correct event', () => {
      const result = ingestEventSchema.safeParse({ 
        type: 'payment.success', 
        payload: { id: 1, amount: 100 } 
      });
      expect(result.success).toBe(true);
    });

    test('should fail on missing type', () => {
      const result = ingestEventSchema.safeParse({ 
        payload: {} 
      });
      expect(result.success).toBe(false);
    });
  });
});
