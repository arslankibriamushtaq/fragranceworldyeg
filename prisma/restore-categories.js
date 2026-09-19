// Restores the store's official categories (safe to run more than once — never deletes anything).
// Products left pointing at a deleted category are re-attached by gender.
// Run with: node prisma/restore-categories.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const CATEGORIES = [
  { name: "Men Fragrances", slug: "men-fragrances", description: "Fragrances for men" },
  { name: "Women Fragrances", slug: "women-fragrances", description: "Fragrances for women" },
  { name: "Unisex Fragrances", slug: "unisex-fragrances", description: "Fragrances for everyone" },
  { name: "Perfume Oils (Attars)", slug: "perfume-oils-attars", description: "Concentrated Arabic perfume oils" },
  { name: "Body Sprays", slug: "body-sprays", description: "Body sprays" },
  { name: "Room Fresheners", slug: "room-fresheners", description: "Home fragrances and room fresheners" },
];
const BY_GENDER = { MENS: "men-fragrances", WOMENS: "women-fragrances", UNISEX: "unisex-fragrances" };

async function main() {
  const ids = {};
  for (const c of CATEGORIES) {
    const cat = await prisma.category.upsert({ where: { slug: c.slug }, update: {}, create: c });
    ids[c.slug] = cat.id;
    console.log(`OK  ${c.name}`);
  }

  const existing = new Set((await prisma.category.findMany({ select: { id: true } })).map((c) => c.id));
  const products = await prisma.product.findMany({ select: { id: true, gender: true, categoryId: true } });
  let fixed = 0;
  for (const p of products) {
    if (existing.has(p.categoryId)) continue;
    await prisma.product.update({ where: { id: p.id }, data: { categoryId: ids[BY_GENDER[p.gender] || "unisex-fragrances"] } });
    fixed++;
  }
  console.log(`Re-attached ${fixed} product(s) that had no category.`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
