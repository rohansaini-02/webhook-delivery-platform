import crypto from 'crypto';

/**
 * Generates a random secret key for HMAC signing
 */
export const generateSecret = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Creates an HMAC SHA-256 signature for a payload
 * @param secret - The subscription's secret key
 * @param payload - The stringified JSON payload
 * @returns The hex signature string
 */
export const signPayload = (secret: string, payload: string): string => {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
};

/**
 * Verifies an HMAC signature against a payload
 */
export const verifySignature = (
  secret: string,
  payload: string,
  signature: string
): boolean => {
  const expected = signPayload(secret, payload);
  if (expected.length !== signature.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
};




// This file:
// generates secret
// signs payload
// verifies signature
