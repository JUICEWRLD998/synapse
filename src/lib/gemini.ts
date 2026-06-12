import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

/**
 * Call Gemini 2.5 Flash and return the text response.
 * Used server-side only (API routes).
 */
export async function callGemini(prompt: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return response.text ?? "";
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
    baseDelayMs = 3000,
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

      // Exponential back-off: 3 s, 6 s, 12 s  +  0–1 s jitter
      const delay = baseDelayMs * 2 ** (attempt - 1) + Math.random() * 1000;
      console.warn(
        `Gemini 503 on attempt ${attempt}/${maxAttempts}. Retrying in ${Math.round(delay)}ms…`
      );
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  throw lastError;
}
