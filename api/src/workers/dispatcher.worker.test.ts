import { getBackoffDelay } from './dispatcher.worker';

describe('Dispatcher Worker Utilities', () => {
  describe('getBackoffDelay', () => {
    test('should increase delay exponentially', () => {
      const delay1 = getBackoffDelay(1);
      const delay2 = getBackoffDelay(2);
      const delay3 = getBackoffDelay(3);

      // We expect delay2 to be significantly larger than delay1 (allowing for jitter)
      // Base: 1000 * 2^1 = 2000, 1000 * 2^2 = 4000
      expect(delay2).toBeGreaterThan(delay1);
      expect(delay3).toBeGreaterThan(delay2);
    });

    test('should cap delay at 5 minutes', () => {
      const maxDelay = 300000;
      const veryLateAttempt = getBackoffDelay(20); // 2^20 is huge
      expect(veryLateAttempt).toBe(maxDelay);
    });

    test('should include jitter (be non-deterministic within range)', () => {
      const attempt = 1;
      const delayA = getBackoffDelay(attempt);
      const delayB = getBackoffDelay(attempt);
      
      // It is highly unlikely two consecutive calls return exact same value with Random jitter
      // (Though theoretically possible, practically good enough for test)
      expect(delayA).not.toBe(delayB);
    });
    
    test('should return at least the base exponential value', () => {
      const attempt = 1;
      const expectedBase = 1000 * Math.pow(2, attempt);
      const delay = getBackoffDelay(attempt);
      expect(delay).toBeGreaterThanOrEqual(expectedBase);
    });
  });
});
