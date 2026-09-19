// One-off cleanup: decants are sold in 5ml and 10ml only.
// Deletes other decant variants; variants referenced by past orders are kept but set to 0 stock.
// Run with: node prisma/limit-decant-sizes.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const ALLOWED = ["5ml", "10ml"];

async function main() {
  const decants = await prisma.product.findMany({ where: { type: "DECANT" }, include: { variants: { include: { orderItems: { select: { id: true } } } } } });
  for (const product of decants) {
    for (const v of product.variants) {
      if (ALLOWED.includes(v.size.replace(/\s+/g, "").toLowerCase())) continue;
      if (v.orderItems.length) {
        await prisma.variant.update({ where: { id: v.id }, data: { stock: 0 } });
        console.log(`Zeroed stock: ${product.name} ${v.size} (has orders)`);
      } else {
        await prisma.variant.delete({ where: { id: v.id } });
        console.log(`Deleted: ${product.name} ${v.size}`);
      }
    }
  }
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
