import { config } from "dotenv";
import path from "path";
import { defineConfig } from "prisma/config";
import { env } from "./lib/env";

config({ path: path.resolve(process.cwd(), ".env.local") });
config();

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env.DATABASE_URL,
  },
});
