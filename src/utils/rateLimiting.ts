
interface AttemptRecord {
  count: number;
  firstAttempt: number;
  lastAttempt: number;
}

class RateLimiter {
  private attempts: Map<string, AttemptRecord> = new Map();
  private maxAttempts: number;
  private windowMs: number;
  private lockoutMs: number;

  constructor(maxAttempts = 5, windowMs = 15 * 60 * 1000, lockoutMs = 30 * 60 * 1000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
    this.lockoutMs = lockoutMs;
  }

  isRateLimited(identifier: string): boolean {
    const now = Date.now();
    const record = this.attempts.get(identifier);

    if (!record) {
      return false;
    }

    // Check if we're still in lockout period
    if (record.count >= this.maxAttempts) {
      const timeSinceLastAttempt = now - record.lastAttempt;
      if (timeSinceLastAttempt < this.lockoutMs) {
        return true;
      } else {
        // Lockout period expired, reset
        this.attempts.delete(identifier);
        return false;
      }
    }

    // Check if the window has expired
    const windowExpired = now - record.firstAttempt > this.windowMs;
    if (windowExpired) {
      this.attempts.delete(identifier);
      return false;
    }

    return false;
  }

  recordAttempt(identifier: string): void {
    const now = Date.now();
    const record = this.attempts.get(identifier);

    if (!record) {
      this.attempts.set(identifier, {
        count: 1,
        firstAttempt: now,
        lastAttempt: now
      });
    } else {
      // Check if we need to reset the window
      const windowExpired = now - record.firstAttempt > this.windowMs;
      if (windowExpired) {
        this.attempts.set(identifier, {
          count: 1,
          firstAttempt: now,
          lastAttempt: now
        });
      } else {
        record.count++;
        record.lastAttempt = now;
      }
    }
  }

  getRemainingLockoutTime(identifier: string): number {
    const record = this.attempts.get(identifier);
    if (!record || record.count < this.maxAttempts) {
      return 0;
    }

    const now = Date.now();
    const timeSinceLastAttempt = now - record.lastAttempt;
    const remainingTime = this.lockoutMs - timeSinceLastAttempt;
    
    return Math.max(0, remainingTime);
  }

  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }
}

// Create rate limiters for different purposes
export const loginRateLimiter = new RateLimiter(5, 15 * 60 * 1000, 30 * 60 * 1000); // 5 attempts per 15 minutes, 30 minute lockout
export const passwordResetRateLimiter = new RateLimiter(3, 60 * 60 * 1000, 60 * 60 * 1000); // 3 attempts per hour, 1 hour lockout

export const formatLockoutTime = (milliseconds: number): string => {
  const minutes = Math.ceil(milliseconds / (60 * 1000));
  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }
  const hours = Math.ceil(minutes / 60);
  return `${hours} hour${hours !== 1 ? 's' : ''}`;
};
