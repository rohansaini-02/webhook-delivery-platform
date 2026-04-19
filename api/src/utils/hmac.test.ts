import { generateSecret, signPayload, verifySignature } from './hmac';

describe('HMAC Utility', () => {
  const secret = 'test-secret-key';
  const payload = JSON.stringify({ event: 'user.created', id: 123 });

  test('generateSecret should return a 64-character hex string', () => {
    const s = generateSecret();
    expect(s).toHaveLength(64);
    expect(/^[0-9a-f]+$/.test(s)).toBe(true);
  });

  test('signPayload should create a valid HMAC signature', () => {
    const signature = signPayload(secret, payload);
    expect(signature).toBeDefined();
    expect(signature.length).toBeGreaterThan(0);
  });

  test('verifySignature should return true for valid signature', () => {
    const signature = signPayload(secret, payload);
    const isValid = verifySignature(secret, payload, signature);
    expect(isValid).toBe(true);
  });

  test('verifySignature should return false for invalid signature', () => {
    const signature = signPayload(secret, payload);
    const isValid = verifySignature(secret, payload, 'invalid-signature');
    expect(isValid).toBe(false);
  });

  test('verifySignature should return false for tampered payload', () => {
    const signature = signPayload(secret, payload);
    const tamperedPayload = payload + 'extra';
    const isValid = verifySignature(secret, tamperedPayload, signature);
    expect(isValid).toBe(false);
  });
});
