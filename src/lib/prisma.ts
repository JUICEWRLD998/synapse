import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Wake Neon's serverless instance quickly — fail fast instead of hanging.
  connectionTimeoutMillis: 10_000,  // give up acquiring a connection after 10s
  idleTimeoutMillis:       30_000,  // release idle connections after 30s
  max:                     5,       // keep the pool small for serverless
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
 * Retry a Prisma operation up to `maxAttempts` times with exponential back-off.
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
      const isTimeout =
        err instanceof Error &&
        (err.message.includes("ETIMEDOUT") ||
          err.message.includes("Connection timed out") ||
          err.message.includes("connection timeout"));
      if (!isTimeout || attempt === maxAttempts) throw err;
      const delay = baseDelayMs * 2 ** (attempt - 1); // 500ms, 1000ms
      console.warn(`DB timeout on attempt ${attempt}/${maxAttempts}, retrying in ${delay}ms…`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastError;
}
