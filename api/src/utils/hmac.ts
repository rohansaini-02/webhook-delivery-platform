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
 * Verifies an HMAC signature against a payload using a timing-safe comparison
 * to prevent timing attacks.
 * 
 * @param secret - The subscription's secret key used for signing
 * @param payload - The raw stringified JSON body received
 * @param signature - The signature to verify (usually from X-Hub-Signature header)
 * @returns boolean indication of validity
 */
export const verifySignature = (
  secret: string,
  payload: string,
  signature: string
): boolean => {
  try {
    const expected = signPayload(secret, payload);
    const expectedBuffer = Buffer.from(expected);
    const signatureBuffer = Buffer.from(signature);

    if (expectedBuffer.length !== signatureBuffer.length) return false;
    return crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
  } catch {
    return false;
  }
};
