class RateLimiter {
  private requestTimestamps: Map<string, number[]> = new Map();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  async waitForSlot(key: string = 'default'): Promise<void> {
    const now = Date.now();
    const timestamps = this.requestTimestamps.get(key) || [];
    const validTimestamps = timestamps.filter(ts => now - ts < this.windowMs);

    if (validTimestamps.length >= this.maxRequests) {
      const oldestTimestamp = validTimestamps[0];
      const waitTime = this.windowMs - (now - oldestTimestamp);

      if (waitTime > 0) {
        console.log('Rate limit reached for ' + key + ', waiting ' + waitTime + 'ms');
        await new Promise(resolve => setTimeout(resolve, waitTime));
        return this.waitForSlot(key);
      }
    }

    validTimestamps.push(now);
    this.requestTimestamps.set(key, validTimestamps);
  }

  reset(key?: string): void {
    if (key) {
      this.requestTimestamps.delete(key);
    } else {
      this.requestTimestamps.clear();
    }
  }
}

export class ExponentialBackoff {
  private attempts: number = 0;
  private readonly maxAttempts: number;
  private readonly baseDelay: number;
  private readonly maxDelay: number;

  constructor(maxAttempts: number = 5, baseDelay: number = 1000, maxDelay: number = 30000) {
    this.maxAttempts = maxAttempts;
    this.baseDelay = baseDelay;
    this.maxDelay = maxDelay;
  }

  async execute<T>(fn: () => Promise<T>, context?: string): Promise<T> {
    try {
      const result = await fn();
      this.attempts = 0;
      return result;
    } catch (error: any) {
      this.attempts++;

      if (this.attempts >= this.maxAttempts) {
        console.error('Max retry attempts (' + this.maxAttempts + ') reached' + (context ? ' for ' + context : ''));
        throw error;
      }

      const delay = Math.min(this.baseDelay * Math.pow(2, this.attempts - 1), this.maxDelay);
      const jitter = Math.random() * 0.3 * delay;
      const totalDelay = delay + jitter;

      console.warn('Retry attempt ' + this.attempts + '/' + this.maxAttempts + (context ? ' for ' + context : '') + ', waiting ' + Math.round(totalDelay) + 'ms');

      await new Promise(resolve => setTimeout(resolve, totalDelay));
      return this.execute(fn, context);
    }
  }

  reset(): void {
    this.attempts = 0;
  }
}

export default RateLimiter;
