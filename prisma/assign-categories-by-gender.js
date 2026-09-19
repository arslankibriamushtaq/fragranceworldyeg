// One-off: put existing fragrance products into Men / Women / Unisex Fragrances by their gender.
// Products already in Perfume Oils (Attars) or Body Sprays / Room Fresheners are left alone.
// Dry run (shows what would change):  node prisma/assign-categories-by-gender.js
// Apply the changes:                  node prisma/assign-categories-by-gender.js --apply
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");

const BY_GENDER = {
  MENS: { name: "Men Fragrances", slug: "men-fragrances", description: "Fragrances for men" },
  WOMENS: { name: "Women Fragrances", slug: "women-fragrances", description: "Fragrances for women" },
  UNISEX: { name: "Unisex Fragrances", slug: "unisex-fragrances", description: "Fragrances for everyone" },
};
const LEAVE_ALONE = ["perfume-oils-attars", "body-sprays", "room-fresheners"];

async function main() {
  const ids = {};
  for (const [gender, c] of Object.entries(BY_GENDER)) {
    const cat = APPLY
      ? await prisma.category.upsert({ where: { slug: c.slug }, update: {}, create: c })
      : await prisma.category.findUnique({ where: { slug: c.slug } });
    ids[gender] = cat?.id;
  }

  const products = await prisma.product.findMany({
    select: { id: true, name: true, gender: true, categoryId: true, category: { select: { slug: true, name: true } } },
  });

  const counts = { MENS: 0, WOMENS: 0, UNISEX: 0, unchanged: 0, skipped: 0 };
  for (const p of products) {
    if (LEAVE_ALONE.includes(p.category.slug)) { counts.skipped++; continue; }
    const target = BY_GENDER[p.gender];
    if (p.category.slug === target.slug) { counts.unchanged++; continue; }
    console.log(`${APPLY ? "Moved" : "Would move"}: ${p.name}  [${p.category.name} -> ${target.name}]`);
    if (APPLY) await prisma.product.update({ where: { id: p.id }, data: { categoryId: ids[p.gender] } });
    counts[p.gender]++;
  }

  console.log(`\n${APPLY ? "Done" : "Dry run"} — men: ${counts.MENS}, women: ${counts.WOMENS}, unisex: ${counts.UNISEX}, already correct: ${counts.unchanged}, attars/body sprays left alone: ${counts.skipped}`);
  if (!APPLY) console.log("Run again with --apply to make these changes.");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
