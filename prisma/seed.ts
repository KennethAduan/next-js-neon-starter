import { prisma } from "@/lib/prisma"

type SeedClient = {
  fullName: string
  email: string
  phone: string
  nationality: string
  status: "active" | "inactive" | "blacklisted"
  totalInvested: number
  totalActiveInvestments: number
}

const SEED_CLIENTS: SeedClient[] = [
  {
    fullName: "Amara Osei",
    email: "amara.osei@example.com",
    phone: "+1-415-555-0142",
    nationality: "Ghanaian",
    status: "active",
    totalInvested: 84200,
    totalActiveInvestments: 3,
  },
  {
    fullName: "Liam Cardoso",
    email: "liam.cardoso@example.com",
    phone: "+1-212-555-0198",
    nationality: "Brazilian",
    status: "active",
    totalInvested: 152300,
    totalActiveInvestments: 5,
  },
  {
    fullName: "Priya Natarajan",
    email: "priya.natarajan@example.com",
    phone: "+1-650-555-0111",
    nationality: "Indian",
    status: "active",
    totalInvested: 26750,
    totalActiveInvestments: 1,
  },
  {
    fullName: "Jonas Eklund",
    email: "jonas.eklund@example.com",
    phone: "+1-312-555-0176",
    nationality: "Swedish",
    status: "inactive",
    totalInvested: 9800,
    totalActiveInvestments: 0,
  },
  {
    fullName: "Solene Marchetti",
    email: "solene.marchetti@example.com",
    phone: "+1-917-555-0134",
    nationality: "French",
    status: "active",
    totalInvested: 61400,
    totalActiveInvestments: 2,
  },
  {
    fullName: "Diego Alvarado",
    email: "diego.alvarado@example.com",
    phone: "+1-305-555-0187",
    nationality: "Mexican",
    status: "active",
    totalInvested: 118900,
    totalActiveInvestments: 4,
  },
  {
    fullName: "Ethan Brightwood",
    email: "ethan.brightwood@example.com",
    phone: "+1-206-555-0123",
    nationality: "American",
    status: "blacklisted",
    totalInvested: 3200,
    totalActiveInvestments: 0,
  },
  {
    fullName: "Naledi Dlamini",
    email: "naledi.dlamini@example.com",
    phone: "+1-773-555-0159",
    nationality: "South African",
    status: "active",
    totalInvested: 47600,
    totalActiveInvestments: 2,
  },
]

async function main() {
  for (const client of SEED_CLIENTS) {
    const existing = await prisma.client.findFirst({
      where: { email: client.email },
      select: { id: true },
    })
    if (existing) continue

    await prisma.client.create({
      data: {
        fullName: client.fullName,
        email: client.email,
        phone: client.phone,
        nationality: client.nationality,
        status: client.status,
        totalInvested: client.totalInvested,
        totalActiveInvestments: client.totalActiveInvestments,
        searchFullName: client.fullName.toLowerCase(),
        searchEmail: client.email.toLowerCase(),
        searchPhone: client.phone.toLowerCase(),
      },
    })
  }

  const count = await prisma.client.count()
  console.log(`Seed complete. ${count} client record(s) in the database.`)
}

main()
  .catch((error) => {
    console.error("Seed failed:", error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
