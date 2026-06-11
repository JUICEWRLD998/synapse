import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Wake Neon's serverless instance quickly — fail fast instead of hanging.
  connectionTimeoutMillis: 15_000,  // give up acquiring a connection after 15s
  idleTimeoutMillis:       30_000,  // release idle connections after 30s
  max:                     5,       // keep the pool small for serverless
  keepAlive:               true,    // maintain TCP connection
  keepAliveInitialDelayMillis: 10_000,
});

// Add connection error handlers to prevent "Connection terminated unexpectedly" crashes
pool.on('error', (err) => {
  console.error('Unexpected error on idle Postgres client:', err);
  // Don't crash the process — let withRetry() handle reconnection
});

const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/**
 * Retry a Prisma operation up to `maxAttempts` times with exponential back-off + jitter.
 * Useful for cold-start ETIMEDOUT errors from Neon serverless.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  baseDelayMs = 500
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const isRetryable =
        err instanceof Error &&
        (err.message.includes("ETIMEDOUT") ||
          err.message.includes("Connection timed out") ||
          err.message.includes("connection timeout") ||
          err.message.includes("Connection terminated unexpectedly") ||
          err.message.includes("Connection ended unexpectedly"));
      if (!isRetryable || attempt === maxAttempts) throw err;
      // Exponential backoff with jitter: 500–750ms, 1000–1500ms, 2000–3000ms
      const baseDelay = baseDelayMs * 2 ** (attempt - 1);
      const jitter = Math.random() * baseDelay * 0.5;
      const delay = Math.floor(baseDelay + jitter);
      console.warn(`DB error on attempt ${attempt}/${maxAttempts}, retrying in ${delay}ms…`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastError;
}
