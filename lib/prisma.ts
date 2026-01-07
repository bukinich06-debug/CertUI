import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
  pgPool?: Pool;
};

const pgPool = globalForPrisma.pgPool ?? new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter: new PrismaPg(pgPool) });

if (!globalForPrisma.pgPool) globalForPrisma.pgPool = pgPool;
if (!globalForPrisma.prisma) globalForPrisma.prisma = prisma;

export { prisma };

