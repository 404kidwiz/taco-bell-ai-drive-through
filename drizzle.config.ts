import { defineConfig } from "drizzle-kit";
import "dotenv/config";

export default defineConfig({
  schema: "./workers/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: `${process.env.TURSO_DATABASE_URL!}?authToken=${process.env.TURSO_AUTH_TOKEN}`,
  },
});
