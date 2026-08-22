import { PrismaClient } from "@/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function getConnectionString(connectionString: string): string {
  const databaseUrl = new URL(connectionString)

  // pg currently treats require as verify-full. Set that strict mode explicitly
  // so the behavior remains stable when pg 9 changes the require semantics.
  if (databaseUrl.searchParams.get("sslmode") === "require") {
    databaseUrl.searchParams.set("sslmode", "verify-full")
  }

  return databaseUrl.toString()
}

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  // Let Prisma own a pool from its bundled pg copy. Passing a Pool created by
  // another pg copy makes the adapter treat the Pool instance as configuration.
  const adapter = new PrismaPg({
    connectionString: getConnectionString(connectionString),
    max: 10,
    connectionTimeoutMillis: 10_000,
    idleTimeoutMillis: 30_000,
  })

  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
