import { config } from "dotenv";
import path from "path";
import { defineConfig } from "prisma/config";

config({ path: path.resolve(process.cwd(), ".env.local") });
config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required for Prisma configuration");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: databaseUrl,
  },
});
