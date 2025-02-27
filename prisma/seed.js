const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  await prisma.config.createMany({
    data: [
      { key: "finePerDay", value: "100" },
      { key: "damageFine", value: "500" },
    ],
    skipDuplicates: true, // ป้องกันการเพิ่มซ้ำ
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
