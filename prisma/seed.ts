import { prisma } from "@/lib/prisma"

async function main() {
  console.log("Seed complete. No seed data configured.")
}

main()
  .catch((error) => {
    console.error("Seed failed:", error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
