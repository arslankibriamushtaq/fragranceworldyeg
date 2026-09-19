// One-off: replace store categories with the official list and move products across.
// Run with: node prisma/sync-categories.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const CATEGORIES = [
  { name: "Men Fragrances", slug: "men-fragrances", description: "Fragrances for men" },
  { name: "Women Fragrances", slug: "women-fragrances", description: "Fragrances for women" },
  { name: "Unisex Fragrances", slug: "unisex-fragrances", description: "Fragrances for everyone" },
  { name: "Perfume Oils (Attars)", slug: "perfume-oils-attars", description: "Concentrated Arabic perfume oils" },
  { name: "Body Sprays & Room Fresheners", slug: "body-sprays-room-fresheners", description: "Body sprays and home fragrances" },
];
const BY_GENDER = { MENS: "men-fragrances", WOMENS: "women-fragrances", UNISEX: "unisex-fragrances" };

async function main() {
  const ids = {};
  for (const c of CATEGORIES) {
    const cat = await prisma.category.upsert({ where: { slug: c.slug }, update: { name: c.name }, create: c });
    ids[c.slug] = cat.id;
  }
  const keep = Object.values(ids);
  const stale = await prisma.category.findMany({ where: { id: { notIn: keep } } });
  for (const cat of stale) {
    const products = await prisma.product.findMany({ where: { categoryId: cat.id }, select: { id: true, gender: true } });
    for (const p of products) {
      await prisma.product.update({ where: { id: p.id }, data: { categoryId: ids[BY_GENDER[p.gender] || "unisex-fragrances"] } });
    }
    await prisma.category.delete({ where: { id: cat.id } });
    console.log(`Removed "${cat.name}" (moved ${products.length} products by gender)`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
