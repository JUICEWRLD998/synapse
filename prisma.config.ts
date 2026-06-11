import { defineConfig } from "prisma/config";
import * as dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  datasource: {
    // Use the pooled URL - Neon's pooler handles database wake-up automatically.
    // For schema changes, we use `prisma db push` (no shadow DB required).
    url: process.env.DATABASE_URL,
  },
});
