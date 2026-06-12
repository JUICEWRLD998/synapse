import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

// Model cascade: lite first (lower demand / faster), full flash as fallback
const MODEL_CASCADE = ["gemini-2.5-flash-lite", "gemini-2.5-flash"];

/**
 * Call Gemini and return the text response.
 * Tries gemini-2.5-flash-lite first; if that 503s, falls back to gemini-2.5-flash.
 * Used server-side only (API routes).
 */
export async function callGemini(prompt: string): Promise<string> {
  let lastError: unknown;

  for (const model of MODEL_CASCADE) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
      });
      return response.text ?? "";
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      // Only cascade to next model on 503/overload — hard errors (auth, quota) throw immediately
      const isOverload =
        msg.includes("503") ||
        msg.includes("UNAVAILABLE") ||
        msg.includes("high demand") ||
        msg.includes("overloaded");

      if (!isOverload) throw err;

      console.warn(`Model ${model} returned 503, trying next model…`);
      lastError = err;
    }
  }

  throw lastError;
}

/**
 * Call Gemini with automatic retry on 503 / overload errors.
 * Retries up to `maxAttempts` times with exponential back-off + jitter.
 * Also races against a per-attempt timeout so we never hang.
 */
export async function callGeminiWithRetry(
  prompt: string,
  {
    maxAttempts = 4,
    baseDelayMs = 2000,
    perAttemptTimeoutMs = 30_000,
  }: {
    maxAttempts?: number;
    baseDelayMs?: number;
    perAttemptTimeoutMs?: number;
  } = {}
): Promise<string> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      // Race the Gemini call against a per-attempt timeout
      const result = await Promise.race([
        callGemini(prompt),
        new Promise<never>((_, reject) =>
          setTimeout(
            () => reject(new Error(`Gemini attempt ${attempt} timed out after ${perAttemptTimeoutMs}ms`)),
            perAttemptTimeoutMs
          )
        ),
      ]);
      return result;
    } catch (err) {
      lastError = err;

      // Only retry on 503 (overloaded) or timeout — not on auth/quota errors
      const msg = err instanceof Error ? err.message : String(err);
      const isRetryable =
        msg.includes("503") ||
        msg.includes("UNAVAILABLE") ||
        msg.includes("timed out") ||
        msg.includes("high demand") ||
        msg.includes("overloaded");

      if (!isRetryable || attempt === maxAttempts) {
        throw err;
      }

      // Exponential back-off: 2 s, 4 s, 8 s  +  0–1 s jitter
      const delay = baseDelayMs * 2 ** (attempt - 1) + Math.random() * 1000;
      console.warn(
        `Gemini 503 on attempt ${attempt}/${maxAttempts}. Retrying in ${Math.round(delay)}ms…`
      );
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  throw lastError;
}
