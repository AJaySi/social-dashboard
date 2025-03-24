import { LRUCache } from 'lru-cache';

type RateLimitOptions = {
  interval: number; // Time window in milliseconds
  uniqueTokensPerInterval?: number; // Max number of unique tokens per interval
};

type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  currentUsage: number;
};

type RateLimitError = Error & {
  limit: number;
  remaining: number;
  reset: number;
  currentUsage: number;
};

const defaultOptions = {
  interval: 60000, // 1 minute in milliseconds
  uniqueTokensPerInterval: 500
};

const limiter = rateLimit();

export { rateLimit, limiter };

function rateLimit(options: RateLimitOptions = defaultOptions) {

  const tokenCache = new LRUCache<string, { count: number; timestamp: number }>({
    max: options.uniqueTokensPerInterval || 500,
    ttl: options.interval,
  });

  return {
    check: (limit: number, token: string | number): RateLimitResult => {
      if (!token) {
        throw new Error('Rate limiting token is required');
      }

      const tokenKey = String(token);
      const now = Date.now();
      const tokenData = tokenCache.get(tokenKey) || { count: 0, timestamp: now };
      
      // Reset count if we're in a new time window
      if (now - tokenData.timestamp >= options.interval) {
        tokenData.count = 0;
        tokenData.timestamp = now;
      }

      const isRateLimited = tokenData.count >= limit;
      const reset = tokenData.timestamp + options.interval;

      if (!isRateLimited) {
        tokenData.count++;
        tokenCache.set(tokenKey, tokenData);
      }

      if (isRateLimited) {
        const error = new Error('Rate limit exceeded') as RateLimitError;
        error.name = 'RateLimitError';
        error.limit = limit;
        error.remaining = 0;
        error.reset = reset;
        error.currentUsage = tokenData.count;
        throw error;
      }

      return {
        success: true,
        limit,
        remaining: Math.max(0, limit - tokenData.count),
        reset,
        currentUsage: tokenData.count
      };
    },
  };
}