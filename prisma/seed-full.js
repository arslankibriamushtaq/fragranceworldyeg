/**
 * Full data seed — populates every model the storefront and admin panel read.
 *
 *   node prisma/seed-full.js            # seeds an empty database
 *   node prisma/seed-full.js --reset    # wipes existing data first, then seeds
 *
 * DATABASE_URL is read from the environment (falls back to .env via Prisma).
 */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();
const RESET = process.argv.includes("--reset");

/* ---------------------------------------------------------------- helpers */

// Deterministic PRNG so re-seeding produces the same catalogue every time.
let _seed = 0x9e3779b9;
function rnd() {
  _seed |= 0;
  _seed = (_seed + 0x6d2b79f5) | 0;
  let t = Math.imul(_seed ^ (_seed >>> 15), 1 | _seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
const int = (min, max) => min + Math.floor(rnd() * (max - min + 1));
const chance = (p) => rnd() < p;

const NOW = new Date();
const daysAgo = (d, h = 12) => {
  const date = new Date(NOW);
  date.setDate(date.getDate() - d);
  date.setHours(h, int(0, 59), int(0, 59), 0);
  return date;
};

const IMG = (id) => `https://images.unsplash.com/photo-${id}?w=800&q=80`;
const SHOT = [
  IMG("1541643600914-78b084683702"),
  IMG("1594035910387-fea47794261f"),
  IMG("1592945403244-b3fbafd7f539"),
  IMG("1523293182086-7651a899d37f"),
  IMG("1615634260167-c8cdede054de"),
  IMG("1587017539504-67cfbddac569"),
  IMG("1610461888750-10bfc601b874"),
  IMG("1588405748880-12d1d2a59d75"),
  IMG("1563170351-be82bc888aa4"),
  IMG("1557170334-a9632e77c6e4"),
];
// Two stable images per product, rotating through the pool.
const shots = (i) => [SHOT[i % SHOT.length], SHOT[(i + 3) % SHOT.length]];

/* ------------------------------------------------------------------- data */

const CATEGORIES = [
  { name: "Men Fragrances", slug: "men-fragrances", description: "Fragrances for men", image: SHOT[0] },
  { name: "Women Fragrances", slug: "women-fragrances", description: "Fragrances for women", image: SHOT[2] },
  { name: "Unisex Fragrances", slug: "unisex-fragrances", description: "Fragrances for everyone", image: SHOT[4] },
  { name: "Perfume Oils (Attars)", slug: "perfume-oils-attars", description: "Concentrated Arabic perfume oils", image: SHOT[5] },
  { name: "Body Sprays & Room Fresheners", slug: "body-sprays-room-fresheners", description: "Body sprays and home fragrances", image: SHOT[7] },
];

const BRANDS = [
  { name: "Dior", slug: "dior", featured: true, description: "Christian Dior — French luxury fashion house founded in 1946." },
  { name: "Chanel", slug: "chanel", featured: true, description: "The iconic Parisian house behind No. 5 and Bleu de Chanel." },
  { name: "Tom Ford", slug: "tom-ford", featured: true, description: "American designer known for bold, opulent Private Blend fragrances." },
  { name: "Creed", slug: "creed", featured: true, description: "Royal perfumers since 1760, makers of Aventus." },
  { name: "Maison Francis Kurkdjian", slug: "maison-francis-kurkdjian", featured: true, description: "Parisian perfume house founded by master perfumer Francis Kurkdjian." },
  { name: "Parfums de Marly", slug: "parfums-de-marly", featured: true, description: "French house inspired by the court of Louis XV." },
  { name: "Yves Saint Laurent", slug: "ysl", featured: true, description: "French luxury house with a rebellious, modern signature." },
  { name: "Versace", slug: "versace", featured: false, description: "Italian luxury fashion house known for bold, sensual scents." },
  { name: "Giorgio Armani", slug: "armani", featured: false, description: "Italian elegance in fragrance form since 1975." },
  { name: "Paco Rabanne", slug: "paco-rabanne", featured: false, description: "Spanish house behind the 1 Million and Invictus lines." },
  { name: "Jean Paul Gaultier", slug: "jean-paul-gaultier", featured: false, description: "The enfant terrible of French fashion and perfumery." },
  { name: "Initio Parfums Privés", slug: "initio", featured: true, description: "Niche house blending perfumery with molecular science." },
  { name: "Lattafa", slug: "lattafa", featured: false, description: "Emirati house offering rich oriental compositions at accessible prices." },
  { name: "Armaf", slug: "armaf", featured: false, description: "Dubai-based house known for high-performance value fragrances." },
];

// type: "F" = full bottle, "D" = decant
const PRODUCTS = [
  {
    name: "Sauvage Eau de Parfum", slug: "dior-sauvage-edp", brand: "dior", cat: "men-fragrances", gender: "MENS", type: "F",
    description: "A radically fresh composition that is both raw and noble. Calabrian bergamot opens onto a heart of Sichuan pepper and lavender, before ambroxan and vanilla give Sauvage its unmistakable trail.",
    notes: { top: ["Calabrian Bergamot", "Sichuan Pepper"], middle: ["Lavender", "Pink Pepper", "Vetiver", "Geranium"], base: ["Ambroxan", "Cedar", "Vanilla"] },
    price: 12000, discount: 0, flags: ["featured", "bestseller"],
    variants: [["60ml", 12000, 25], ["100ml", 18000, 15], ["200ml", 28000, 8]],
  },
  {
    name: "Dior Homme Intense", slug: "dior-homme-intense", brand: "dior", cat: "men-fragrances", gender: "MENS", type: "F",
    description: "An ode to powdery iris. Lavender and pear open a velvety heart of Tuscan iris, wrapped in ambrette and vetiver. Refined, romantic and instantly recognisable.",
    notes: { top: ["Lavender", "Pear"], middle: ["Iris", "Ambrette"], base: ["Virginia Cedar", "Vetiver"] },
    price: 16500, discount: 5, flags: ["featured"],
    variants: [["50ml", 16500, 14], ["100ml", 24500, 9]],
  },
  {
    name: "Miss Dior Eau de Parfum", slug: "miss-dior-edp", brand: "dior", cat: "women-fragrances", gender: "WOMENS", type: "F",
    description: "A couture bouquet of a thousand flowers. Grasse rose and peony bloom over a base of rosewood — luminous, feminine and endlessly wearable.",
    notes: { top: ["Blood Orange", "Mandarin"], middle: ["Grasse Rose", "Peony", "Lily of the Valley"], base: ["Rosewood", "Musk"] },
    price: 15000, discount: 10, flags: ["bestseller"],
    variants: [["50ml", 15000, 18], ["100ml", 23000, 11]],
  },
  {
    name: "Bleu de Chanel Parfum", slug: "bleu-de-chanel-parfum", brand: "chanel", cat: "men-fragrances", gender: "MENS", type: "F",
    description: "A woody aromatic built on the tension between citrus freshness and smoky sandalwood. The Parfum concentration is the deepest, warmest expression of the line.",
    notes: { top: ["Grapefruit", "Lemon", "Mint"], middle: ["Ginger", "Nutmeg", "Jasmine"], base: ["Sandalwood", "Cedar", "Tonka Bean"] },
    price: 21000, discount: 0, flags: ["featured", "bestseller"],
    variants: [["50ml", 21000, 12], ["100ml", 32000, 7], ["150ml", 44000, 3]],
  },
  {
    name: "Coco Mademoiselle", slug: "coco-mademoiselle", brand: "chanel", cat: "women-fragrances", gender: "WOMENS", type: "F",
    description: "An oriental sparkling with fresh top notes of orange and bergamot, a rose and jasmine heart, and a sensual patchouli-vetiver drydown. The modern Chanel signature.",
    notes: { top: ["Orange", "Bergamot", "Grapefruit"], middle: ["Turkish Rose", "Jasmine", "Litchi"], base: ["Patchouli", "Vetiver", "White Musk", "Vanilla"] },
    price: 22500, discount: 0, flags: ["featured", "bestseller"],
    variants: [["50ml", 22500, 16], ["100ml", 34000, 8]],
  },
  {
    name: "Chanel No. 5 Eau de Parfum", slug: "chanel-no-5-edp", brand: "chanel", cat: "women-fragrances", gender: "WOMENS", type: "F",
    description: "The most famous fragrance in the world. An abstract floral aldehyde created in 1921 that still defines what a classic perfume smells like.",
    notes: { top: ["Aldehydes", "Ylang-Ylang", "Neroli"], middle: ["May Rose", "Jasmine", "Iris"], base: ["Sandalwood", "Vanilla", "Vetiver"] },
    price: 26000, discount: 0, flags: [],
    variants: [["35ml", 26000, 9], ["100ml", 42000, 5]],
  },
  {
    name: "Oud Wood", slug: "tom-ford-oud-wood", brand: "tom-ford", cat: "unisex-fragrances", gender: "UNISEX", type: "F",
    description: "Rare oud wood blended with rosewood and cardamom, softened by sandalwood, vetiver and amber. Smooth, smoky and quietly expensive.",
    notes: { top: ["Cardamom", "Chinese Pepper", "Rosewood"], middle: ["Agarwood", "Sandalwood", "Vetiver"], base: ["Tonka Bean", "Amber", "Musk"] },
    price: 34000, discount: 10, flags: ["featured", "new"],
    variants: [["50ml", 34000, 10], ["100ml", 52000, 4]],
  },
  {
    name: "Tobacco Vanille", slug: "tom-ford-tobacco-vanille", brand: "tom-ford", cat: "unisex-fragrances", gender: "UNISEX", type: "F",
    description: "An opulent gourmand: creamy tonka, tobacco leaf, vanilla and cocoa layered over dried fruit and sweet wood sap. A cold-weather icon.",
    notes: { top: ["Tobacco Leaf", "Spicy Notes"], middle: ["Vanilla", "Cocoa", "Tonka Bean"], base: ["Dried Fruits", "Woody Notes"] },
    price: 36000, discount: 0, flags: ["bestseller"],
    variants: [["50ml", 36000, 8], ["100ml", 55000, 4]],
  },
  {
    name: "Lost Cherry", slug: "tom-ford-lost-cherry", brand: "tom-ford", cat: "unisex-fragrances", gender: "UNISEX", type: "F",
    description: "Black cherry and liqueur over a heart of Turkish rose and jasmine sambac, grounded by tonka, roasted tonka and sandalwood. Playful and indulgent.",
    notes: { top: ["Black Cherry", "Cherry Liqueur", "Bitter Almond"], middle: ["Turkish Rose", "Jasmine Sambac", "Griotte Syrup"], base: ["Peru Balsam", "Roasted Tonka", "Sandalwood"] },
    price: 38000, discount: 5, flags: ["featured", "new"],
    variants: [["30ml", 24000, 12], ["50ml", 38000, 6]],
  },
  {
    name: "Aventus", slug: "creed-aventus", brand: "creed", cat: "men-fragrances", gender: "MENS", type: "F",
    description: "Smoky pineapple and birch over a rich musk and oakmoss base. Two centuries of Creed craftsmanship in the fragrance that redefined modern masculine perfumery.",
    notes: { top: ["Pineapple", "Bergamot", "Black Currant", "Apple"], middle: ["Birch", "Patchouli", "Moroccan Jasmine", "Rose"], base: ["Musk", "Oakmoss", "Ambergris", "Vanilla"] },
    price: 48000, discount: 5, flags: ["featured", "bestseller"],
    variants: [["50ml", 48000, 7], ["100ml", 76000, 3]],
  },
  {
    name: "Silver Mountain Water", slug: "creed-silver-mountain-water", brand: "creed", cat: "unisex-fragrances", gender: "UNISEX", type: "F",
    description: "Alpine streams captured in a bottle — blackcurrant and bergamot over green tea and a clean musk drydown. Crisp, weightless, effortlessly clean.",
    notes: { top: ["Bergamot", "Mandarin"], middle: ["Green Tea", "Blackcurrant"], base: ["Musk", "Sandalwood", "Petitgrain"] },
    price: 44000, discount: 0, flags: [],
    variants: [["50ml", 44000, 6], ["100ml", 68000, 3]],
  },
  {
    name: "Baccarat Rouge 540 Extrait", slug: "baccarat-rouge-540-extrait", brand: "maison-francis-kurkdjian", cat: "unisex-fragrances", gender: "UNISEX", type: "F",
    description: "The extrait concentration of a modern legend. Saffron and bitter almond over cedar and ambergris — luminous, mineral and unmistakable from across a room.",
    notes: { top: ["Saffron", "Bitter Almond"], middle: ["Egyptian Jasmine", "Cedar"], base: ["Ambergris", "Woody Notes", "Fir Resin"] },
    price: 62000, discount: 0, flags: ["featured", "bestseller", "new"],
    variants: [["35ml", 62000, 5], ["70ml", 98000, 2]],
  },
  {
    name: "Layton", slug: "parfums-de-marly-layton", brand: "parfums-de-marly", cat: "unisex-fragrances", gender: "UNISEX", type: "F",
    description: "Apple and bergamot over a spicy heart of violet and jasmine, resting on vanilla, guaiac wood and sandalwood. A crowd-pleasing signature scent.",
    notes: { top: ["Apple", "Bergamot", "Lavender"], middle: ["Violet", "Jasmine", "Geranium", "Pepper"], base: ["Vanilla", "Guaiac Wood", "Sandalwood", "Patchouli"] },
    price: 52000, discount: 8, flags: ["featured", "bestseller"],
    variants: [["75ml", 52000, 9], ["125ml", 74000, 4]],
  },
  {
    name: "Delina Exclusif", slug: "parfums-de-marly-delina", brand: "parfums-de-marly", cat: "women-fragrances", gender: "WOMENS", type: "F",
    description: "Turkish rose, lychee and rhubarb wrapped in vanilla, musk and cashmeran. Lush, sweet and instantly recognisable.",
    notes: { top: ["Lychee", "Rhubarb", "Bergamot"], middle: ["Turkish Rose", "Peony", "Vanilla"], base: ["Cashmeran", "Musk", "Incense"] },
    price: 56000, discount: 0, flags: ["new"],
    variants: [["75ml", 56000, 6]],
  },
  {
    name: "Y Eau de Parfum", slug: "ysl-y-edp", brand: "ysl", cat: "men-fragrances", gender: "MENS", type: "F",
    description: "Apple and ginger open onto sage and juniper, closing on a smooth amberwood and tonka base. Sharp, modern and office-friendly.",
    notes: { top: ["Apple", "Ginger", "Bergamot"], middle: ["Sage", "Juniper Berries", "Geranium"], base: ["Amberwood", "Tonka Bean", "Cedar"] },
    price: 17500, discount: 0, flags: ["bestseller"],
    variants: [["60ml", 17500, 20], ["100ml", 26000, 12]],
  },
  {
    name: "Libre Eau de Parfum", slug: "ysl-libre", brand: "ysl", cat: "women-fragrances", gender: "WOMENS", type: "F",
    description: "The tension between French lavender and Moroccan orange blossom, wrapped in a warm vanilla accord. Bold, free and unmistakably YSL.",
    notes: { top: ["Lavender", "Mandarin", "Blackcurrant"], middle: ["Orange Blossom", "Jasmine"], base: ["Madagascar Vanilla", "Musk", "Cedar"] },
    price: 19000, discount: 10, flags: ["new"],
    variants: [["50ml", 19000, 15], ["90ml", 28000, 8]],
  },
  {
    name: "Acqua di Giò Profondo", slug: "armani-acqua-di-gio-profondo", brand: "armani", cat: "men-fragrances", gender: "MENS", type: "F",
    description: "A deep marine aromatic — sea notes, bergamot and rosemary over cypress, patchouli and mineral musk. The darker, deeper Acqua di Giò.",
    notes: { top: ["Sea Notes", "Bergamot", "Aquozone"], middle: ["Rosemary", "Cypress", "Lavender"], base: ["Patchouli", "Mineral Musk"] },
    price: 14500, discount: 0, flags: [],
    variants: [["75ml", 14500, 17], ["125ml", 21000, 9]],
  },
  {
    name: "Sì Eau de Parfum", slug: "armani-si", brand: "armani", cat: "women-fragrances", gender: "WOMENS", type: "F",
    description: "A modern chypre — blackcurrant nectar, freesia and rose over vanilla, patchouli and blond woods. Elegant and confident.",
    notes: { top: ["Blackcurrant Nectar", "Bergamot"], middle: ["Freesia", "May Rose"], base: ["Vanilla", "Patchouli", "Blond Woods"] },
    price: 16000, discount: 0, flags: [],
    variants: [["50ml", 16000, 13], ["100ml", 24000, 7]],
  },
  {
    name: "Eros Eau de Toilette", slug: "versace-eros", brand: "versace", cat: "men-fragrances", gender: "MENS", type: "F",
    description: "Mint, green apple and lemon over tonka, vanilla and cedar. Loud, sweet and unapologetically fun — a night-out staple.",
    notes: { top: ["Mint", "Green Apple", "Lemon"], middle: ["Tonka Bean", "Ambroxan", "Geranium"], base: ["Madagascar Vanilla", "Cedar", "Oakmoss"] },
    price: 9500, discount: 15, flags: ["bestseller"],
    variants: [["50ml", 9500, 26], ["100ml", 14000, 18], ["200ml", 21000, 6]],
  },
  {
    name: "Bright Crystal", slug: "versace-bright-crystal", brand: "versace", cat: "women-fragrances", gender: "WOMENS", type: "F",
    description: "Pomegranate and yuzu over peony, magnolia and lotus, closing on musk and amber. Light, fresh and endlessly easy to wear.",
    notes: { top: ["Pomegranate", "Yuzu", "Frosted Accord"], middle: ["Peony", "Magnolia", "Lotus"], base: ["Musk", "Amber", "Mahogany"] },
    price: 8500, discount: 10, flags: [],
    variants: [["50ml", 8500, 22], ["90ml", 12500, 14]],
  },
  {
    name: "1 Million Eau de Toilette", slug: "paco-rabanne-1-million", brand: "paco-rabanne", cat: "men-fragrances", gender: "MENS", type: "F",
    description: "Blood mandarin and cinnamon over rose and spice, finished with leather and amber. The gold bar of designer fragrance.",
    notes: { top: ["Blood Mandarin", "Grapefruit", "Mint"], middle: ["Cinnamon", "Rose", "Spicy Notes"], base: ["Leather", "White Wood", "Amber"] },
    price: 11000, discount: 0, flags: [],
    variants: [["50ml", 11000, 19], ["100ml", 16500, 11]],
  },
  {
    name: "Lady Million", slug: "paco-rabanne-lady-million", brand: "paco-rabanne", cat: "women-fragrances", gender: "WOMENS", type: "F",
    description: "Bitter orange and raspberry over neroli and jasmine, with a honeyed patchouli base. Sparkling and unabashedly glamorous.",
    notes: { top: ["Bitter Orange", "Raspberry", "Neroli"], middle: ["Jasmine", "Gardenia", "Orange Blossom"], base: ["Honey", "Patchouli", "Amber"] },
    price: 12500, discount: 0, flags: [],
    variants: [["50ml", 12500, 14], ["80ml", 18000, 8]],
  },
  {
    name: "Le Male Le Parfum", slug: "jpg-le-male-le-parfum", brand: "jean-paul-gaultier", cat: "men-fragrances", gender: "MENS", type: "F",
    description: "Cardamom, lavender and vanilla layered over cedarwood in an intense oriental take on the sailor. Warm, sweet and long-lasting.",
    notes: { top: ["Cardamom", "Bergamot"], middle: ["Lavender", "Iris"], base: ["Vanilla", "Cedarwood", "Benzoin"] },
    price: 15500, discount: 0, flags: ["new", "featured"],
    variants: [["75ml", 15500, 16], ["125ml", 22000, 9]],
  },
  {
    name: "Oud for Greatness", slug: "initio-oud-for-greatness", brand: "initio", cat: "unisex-fragrances", gender: "UNISEX", type: "F",
    description: "Saffron and nutmeg over a heart of Laotian oud and patchouli, finished with musk. Dense, animalic and built for cold weather.",
    notes: { top: ["Saffron", "Nutmeg", "Lavender"], middle: ["Oud", "Patchouli"], base: ["Musk", "Woody Notes"] },
    price: 58000, discount: 0, flags: ["featured", "new"],
    variants: [["50ml", 58000, 5], ["90ml", 86000, 2]],
  },
  {
    name: "Khamrah", slug: "lattafa-khamrah", brand: "lattafa", cat: "unisex-fragrances", gender: "UNISEX", type: "F",
    description: "Cinnamon, nutmeg and bergamot over dates, praline and tuberose, closing on vanilla, tonka and benzoin. A spiced dessert of a fragrance.",
    notes: { top: ["Cinnamon", "Nutmeg", "Bergamot"], middle: ["Dates", "Praline", "Tuberose"], base: ["Vanilla", "Tonka Bean", "Benzoin", "Amberwood"] },
    price: 6500, discount: 0, flags: ["bestseller", "new"],
    variants: [["100ml", 6500, 40]],
  },
  {
    name: "Asad", slug: "lattafa-asad", brand: "lattafa", cat: "men-fragrances", gender: "MENS", type: "F",
    description: "Pineapple, blackcurrant and bergamot over a smoky birch and patchouli heart. A widely loved take on the smoky-fruity accord.",
    notes: { top: ["Pineapple", "Blackcurrant", "Bergamot"], middle: ["Birch", "Patchouli", "Jasmine"], base: ["Musk", "Oakmoss", "Vanilla"] },
    price: 5500, discount: 0, flags: ["bestseller"],
    variants: [["100ml", 5500, 45]],
  },
  {
    name: "Club de Nuit Intense Man", slug: "armaf-club-de-nuit-intense", brand: "armaf", cat: "men-fragrances", gender: "MENS", type: "F",
    description: "Lemon, pineapple and blackcurrant over birch and jasmine, resting on musk and vanilla. Exceptional performance at an accessible price.",
    notes: { top: ["Lemon", "Pineapple", "Blackcurrant", "Apple"], middle: ["Birch", "Jasmine", "Rose"], base: ["Musk", "Vanilla", "Ambergris", "Patchouli"] },
    price: 6000, discount: 10, flags: ["bestseller"],
    variants: [["105ml", 6000, 38], ["150ml", 8500, 20]],
  },
  {
    name: "Discovery Gift Set — Best Sellers", slug: "gift-set-best-sellers", brand: "dior", cat: "unisex-fragrances", gender: "UNISEX", type: "F",
    description: "A curated box of five 5ml decants from our most-loved bottles, presented in a magnetic gift case. The perfect introduction — or present.",
    notes: { top: ["Bergamot", "Pineapple"], middle: ["Rose", "Saffron"], base: ["Amber", "Vanilla", "Oud"] },
    price: 9500, discount: 0, flags: ["featured", "new"],
    variants: [["5 x 5ml", 9500, 30], ["5 x 10ml", 17000, 15]],
  },

  /* ------------------------------------------------------------- decants */
  {
    name: "Baccarat Rouge 540", slug: "baccarat-rouge-540-decant", brand: "maison-francis-kurkdjian", cat: "unisex-fragrances", gender: "UNISEX", type: "D",
    description: "Decanted from a sealed retail bottle into a glass atomiser. Saffron and jasmine over amberwood and fir resin — the modern classic, in a size you can actually finish.",
    notes: { top: ["Saffron", "Jasmine"], middle: ["Amberwood", "Ambergris"], base: ["Fir Resin", "Cedar"] },
    price: 1800, discount: 0, flags: ["featured", "bestseller", "new"],
    variants: [["2ml", 1800, 60], ["5ml", 3600, 40], ["10ml", 6500, 25], ["15ml", 9000, 15]],
  },
  {
    name: "Aventus", slug: "creed-aventus-decant", brand: "creed", cat: "unisex-fragrances", gender: "MENS", type: "D",
    description: "Creed's smoky pineapple icon, decanted into a travel atomiser. Try the batch before committing to a full bottle.",
    notes: { top: ["Pineapple", "Bergamot", "Apple"], middle: ["Birch", "Patchouli", "Rose"], base: ["Musk", "Oakmoss", "Ambergris"] },
    price: 1600, discount: 0, flags: ["featured", "bestseller"],
    variants: [["2ml", 1600, 55], ["5ml", 3200, 35], ["10ml", 5800, 20]],
  },
  {
    name: "Layton", slug: "parfums-de-marly-layton-decant", brand: "parfums-de-marly", cat: "unisex-fragrances", gender: "UNISEX", type: "D",
    description: "Apple, violet and vanilla over guaiac wood — Parfums de Marly's signature crowd-pleaser in a pocket size.",
    notes: { top: ["Apple", "Bergamot", "Lavender"], middle: ["Violet", "Jasmine", "Pepper"], base: ["Vanilla", "Guaiac Wood", "Sandalwood"] },
    price: 1500, discount: 0, flags: ["bestseller"],
    variants: [["2ml", 1500, 50], ["5ml", 3000, 30], ["10ml", 5500, 18]],
  },
  {
    name: "Oud for Greatness", slug: "initio-oud-for-greatness-decant", brand: "initio", cat: "unisex-fragrances", gender: "UNISEX", type: "D",
    description: "Initio's dense saffron-and-oud statement piece, decanted so you can test it across a full day before buying.",
    notes: { top: ["Saffron", "Nutmeg"], middle: ["Oud", "Patchouli"], base: ["Musk", "Woody Notes"] },
    price: 1700, discount: 0, flags: ["new"],
    variants: [["2ml", 1700, 45], ["5ml", 3400, 28], ["10ml", 6200, 14]],
  },
  {
    name: "Tobacco Vanille", slug: "tom-ford-tobacco-vanille-decant", brand: "tom-ford", cat: "unisex-fragrances", gender: "UNISEX", type: "D",
    description: "Tom Ford's tobacco-and-vanilla gourmand in decant form — rich, sweet and made for winter evenings.",
    notes: { top: ["Tobacco Leaf", "Spices"], middle: ["Vanilla", "Cocoa", "Tonka Bean"], base: ["Dried Fruits", "Woody Notes"] },
    price: 1400, discount: 0, flags: ["bestseller"],
    variants: [["2ml", 1400, 48], ["5ml", 2800, 30], ["10ml", 5200, 16]],
  },
  {
    name: "Lost Cherry", slug: "tom-ford-lost-cherry-decant", brand: "tom-ford", cat: "unisex-fragrances", gender: "UNISEX", type: "D",
    description: "Black cherry, almond and roasted tonka. Polarising and delicious — exactly the kind of scent you should sample first.",
    notes: { top: ["Black Cherry", "Bitter Almond"], middle: ["Turkish Rose", "Jasmine Sambac"], base: ["Roasted Tonka", "Sandalwood", "Peru Balsam"] },
    price: 1500, discount: 0, flags: ["new"],
    variants: [["2ml", 1500, 42], ["5ml", 3000, 26], ["10ml", 5500, 13]],
  },
  {
    name: "Delina Exclusif", slug: "parfums-de-marly-delina-decant", brand: "parfums-de-marly", cat: "unisex-fragrances", gender: "WOMENS", type: "D",
    description: "Lychee, Turkish rose and vanilla in a travel-friendly atomiser. One of the most requested women's decants we stock.",
    notes: { top: ["Lychee", "Rhubarb"], middle: ["Turkish Rose", "Peony", "Vanilla"], base: ["Cashmeran", "Musk", "Incense"] },
    price: 1650, discount: 0, flags: ["featured"],
    variants: [["2ml", 1650, 38], ["5ml", 3300, 24], ["10ml", 6000, 12]],
  },
  {
    name: "Le Male Le Parfum", slug: "jpg-le-male-le-parfum-decant", brand: "jean-paul-gaultier", cat: "unisex-fragrances", gender: "MENS", type: "D",
    description: "Cardamom, lavender and vanilla over cedar. A warm, sweet designer heavyweight, decanted for testing.",
    notes: { top: ["Cardamom", "Bergamot"], middle: ["Lavender", "Iris"], base: ["Vanilla", "Cedarwood", "Benzoin"] },
    price: 1200, discount: 0, flags: [],
    variants: [["2ml", 1200, 44], ["5ml", 2400, 28], ["10ml", 4400, 15]],
  },
  {
    name: "Khamrah", slug: "lattafa-khamrah-decant", brand: "lattafa", cat: "unisex-fragrances", gender: "UNISEX", type: "D",
    description: "Spiced dates, praline and vanilla. A budget-friendly oriental worth trying before you buy the 100ml.",
    notes: { top: ["Cinnamon", "Nutmeg"], middle: ["Dates", "Praline", "Tuberose"], base: ["Vanilla", "Tonka Bean", "Benzoin"] },
    price: 900, discount: 0, flags: ["new"],
    variants: [["2ml", 900, 60], ["5ml", 1800, 40], ["10ml", 3200, 22]],
  },
  {
    name: "Silver Mountain Water", slug: "creed-silver-mountain-water-decant", brand: "creed", cat: "unisex-fragrances", gender: "UNISEX", type: "D",
    description: "Green tea, blackcurrant and clean musk. Creed's most refreshing composition, in a size that suits a summer commute.",
    notes: { top: ["Bergamot", "Mandarin"], middle: ["Green Tea", "Blackcurrant"], base: ["Musk", "Sandalwood"] },
    price: 1550, discount: 0, flags: [],
    variants: [["2ml", 1550, 35], ["5ml", 3100, 22], ["10ml", 5700, 11]],
  },
];

const CUSTOMERS = [
  { name: "Ayesha Khan", email: "ayesha.khan@example.com", phone: "+92 300 1234567", address: "House 42, Street 8, DHA Phase 5", city: "Lahore" },
  { name: "Bilal Ahmed", email: "bilal.ahmed@example.com", phone: "+92 321 9876543", address: "Flat 12-B, Clifton Block 4", city: "Karachi" },
  { name: "Fatima Noor", email: "fatima.noor@example.com", phone: "+92 333 4567890", address: "House 7, F-11/3", city: "Islamabad" },
  { name: "Hassan Raza", email: "hassan.raza@example.com", phone: "+92 301 2223344", address: "112 Gulberg III, Main Boulevard", city: "Lahore" },
  { name: "Zara Sheikh", email: "zara.sheikh@example.com", phone: "+92 345 5566778", address: "House 19, Askari X", city: "Rawalpindi" },
  { name: "Omar Farooq", email: "omar.farooq@example.com", phone: "+92 302 8899001", address: "Plot 55, Bahria Town Phase 7", city: "Islamabad" },
  { name: "Hira Malik", email: "hira.malik@example.com", phone: "+92 313 1122334", address: "Apartment 9, Sea View Apartments", city: "Karachi" },
  { name: "Usman Tariq", email: "usman.tariq@example.com", phone: "+92 322 4433221", address: "House 3, Model Town Block C", city: "Lahore" },
  { name: "Sana Iqbal", email: "sana.iqbal@example.com", phone: "+92 335 7788990", address: "House 88, University Town", city: "Peshawar" },
  { name: "Ahmed Siddiqui", email: "ahmed.siddiqui@example.com", phone: "+92 300 6655443", address: "House 21, Satellite Town", city: "Faisalabad" },
  { name: "Mariam Javed", email: "mariam.javed@example.com", phone: "+92 331 2211009", address: "House 14, Cantt Area", city: "Multan" },
  { name: "Danish Ali", email: "danish.ali@example.com", phone: "+92 344 3344556", address: "Flat 4-A, Gulistan-e-Johar Block 15", city: "Karachi" },
  { name: "Nimra Aslam", email: "nimra.aslam@example.com", phone: "+92 310 9900112", address: "House 60, Wapda Town", city: "Lahore" },
  { name: "Talha Mehmood", email: "talha.mehmood@example.com", phone: "+92 323 5544332", address: "House 31, G-9/1", city: "Islamabad" },
  { name: "Komal Rashid", email: "komal.rashid@example.com", phone: "+92 336 1231234", address: "House 5, Zarghoon Road", city: "Quetta" },
  { name: "Saad Yousaf", email: "saad.yousaf@example.com", phone: "+92 305 4564567", address: "House 77, Cantt View Colony", city: "Sialkot" },
];

const REVIEWS = [
  { r: 5, t: "Absolutely worth it", b: "Ordered on Tuesday, delivered Thursday. The bottle was sealed and the batch code checked out. Projection is exactly what I expected — I get compliments every time I wear it." },
  { r: 5, t: "My new signature", b: "I had been sampling this for months through decants before finally buying the full bottle. Zero regrets. Lasts a solid eight hours on my skin." },
  { r: 4, t: "Great, but pricey", b: "The scent itself is fantastic and performance is above average. Knocking one star off only because the price went up since my last order." },
  { r: 5, t: "Genuine product", b: "Compared it side by side with the tester at the mall and it is identical. Packaging was well protected too." },
  { r: 4, t: "Good longevity", b: "Six to seven hours on me, which is solid for an EDT. The opening is the best part — it settles into something softer after an hour." },
  { r: 5, t: "Perfect for gifting", b: "Bought this for my brother's birthday and he loved it. The gift packaging saved me a trip to the shop." },
  { r: 3, t: "Nice but not for me", b: "Quality is clearly there, it just does not suit my skin chemistry. Turns a bit too sweet after thirty minutes. Glad I tried the decant first." },
  { r: 5, t: "Fast delivery", b: "Shipped the same day I ordered and arrived in two days. The decant was filled to the line and the atomiser sprays evenly." },
  { r: 4, t: "Better than expected", b: "I was sceptical about ordering fragrance online but the packaging and authenticity were both spot on. Will order again." },
  { r: 5, t: "Compliment magnet", b: "Wore this to a wedding and three separate people asked what I was wearing. That has never happened to me before." },
  { r: 2, t: "Weak performance", b: "The scent is lovely but it disappears on me within two hours. Might just be my skin, but at this price I expected more." },
  { r: 5, t: "Decants are the way to go", b: "Tried four different scents through 5ml decants instead of gambling on a full bottle. Best money I have spent on fragrance." },
  { r: 4, t: "Solid daily driver", b: "Not too loud for the office, still noticeable. Two sprays is plenty. The bottle feels premium as well." },
  { r: 5, t: "Exactly as described", b: "Notes match the description on the site perfectly. Customer service also replied to my question within an hour." },
  { r: 4, t: "Lovely scent, small bottle", b: "The fragrance is beautiful, I just wish the larger size had been in stock when I ordered." },
  { r: 5, t: "Repeat customer", b: "This is my third order from this store. Consistent quality, consistent packaging, never had an issue." },
  { r: 3, t: "Average projection", b: "Smells great up close but does not project much. Fine for close encounters, not for making an entrance." },
  { r: 5, t: "Winter perfection", b: "Warm, spicy and comforting. This is going to be in heavy rotation from November through February." },
];

/* -------------------------------------------------------------------- run */

async function wipe() {
  console.log("🧹 Clearing existing data...");
  // Children before parents.
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.wishlistItem.deleteMany({});
  await prisma.variant.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.brand.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.coupon.deleteMany({});
  await prisma.banner.deleteMany({});
  await prisma.themeSettings.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.account.deleteMany({});
  await prisma.verificationToken.deleteMany({});
  await prisma.user.deleteMany({});
}

async function main() {
  const existing = await prisma.product.count().catch(() => 0);
  if (existing > 0 && !RESET) {
    console.error(
      `\n⛔ Database already contains ${existing} products.\n` +
        `   Re-run with --reset to wipe and reseed, or point DATABASE_URL at an empty database.\n`
    );
    process.exit(1);
  }
  if (RESET) await wipe();

  console.log("🌱 Seeding...\n");

  /* -- users ------------------------------------------------------------ */
  const adminPassword = await bcrypt.hash("admin123456", 12);
  const customerPassword = await bcrypt.hash("customer123", 12);

  const admin = await prisma.user.create({
    data: {
      name: "Store Admin", email: "admin@luxescents.com", password: adminPassword, role: "ADMIN",
      phone: "+92 300 0000000", address: "Head Office, Main Boulevard", city: "Lahore",
      emailVerified: daysAgo(400), createdAt: daysAgo(400), updatedAt: daysAgo(400),
    },
  });
  await prisma.user.create({
    data: {
      name: "Sara Manager", email: "manager@luxescents.com", password: adminPassword, role: "ADMIN",
      phone: "+92 300 1111111", city: "Karachi",
      emailVerified: daysAgo(300), createdAt: daysAgo(300), updatedAt: daysAgo(300),
    },
  });

  const users = [];
  for (let i = 0; i < CUSTOMERS.length; i++) {
    const c = CUSTOMERS[i];
    // Spread signups across the last ~7 months so the customer list looks organic.
    const joined = daysAgo(200 - i * 12);
    users.push(
      await prisma.user.create({
        data: {
          ...c, password: customerPassword, role: "USER",
          emailVerified: chance(0.8) ? joined : null,
          createdAt: joined, updatedAt: joined,
        },
      })
    );
  }
  console.log(`✅ Users: 2 admins + ${users.length} customers`);

  /* -- categories & brands ---------------------------------------------- */
  const catMap = {};
  for (const c of CATEGORIES) {
    const row = await prisma.category.create({ data: { ...c, createdAt: daysAgo(365), updatedAt: daysAgo(365) } });
    catMap[c.slug] = row.id;
  }
  console.log(`✅ Categories: ${CATEGORIES.length}`);

  const brandMap = {};
  for (const b of BRANDS) {
    const row = await prisma.brand.create({
      data: { ...b, logo: SHOT[BRANDS.indexOf(b) % SHOT.length], createdAt: daysAgo(365), updatedAt: daysAgo(365) },
    });
    brandMap[b.slug] = row.id;
  }
  console.log(`✅ Brands: ${BRANDS.length} (${BRANDS.filter((b) => b.featured).length} featured)`);

  /* -- products & variants ---------------------------------------------- */
  const products = [];
  for (let i = 0; i < PRODUCTS.length; i++) {
    const p = PRODUCTS[i];
    const created = daysAgo(170 - i * 4);
    const skuBase = p.slug.toUpperCase().replace(/[^A-Z0-9]+/g, "-").slice(0, 24);
    const row = await prisma.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        brandId: brandMap[p.brand],
        categoryId: catMap[p.cat],
        type: p.type === "D" ? "DECANT" : "FULL_BOTTLE",
        description: p.description,
        fragranceNotes: p.notes,
        gender: p.gender,
        images: shots(i),
        basePrice: p.price,
        discount: p.discount,
        isFeatured: p.flags.includes("featured"),
        isNewArrival: p.flags.includes("new"),
        isBestSeller: p.flags.includes("bestseller"),
        metaTitle: `${p.name} — Buy Online in Pakistan | Luxe Scents`,
        metaDescription: p.description.slice(0, 155),
        createdAt: created,
        updatedAt: created,
        variants: {
          create: p.variants.map(([size, price, stock]) => ({
            size, price, stock,
            sku: `${skuBase}-${size.toUpperCase().replace(/[^A-Z0-9]/g, "")}`,
            createdAt: created, updatedAt: created,
          })),
        },
      },
      include: { variants: true },
    });
    products.push(row);
  }
  const decantCount = products.filter((p) => p.type === "DECANT").length;
  console.log(`✅ Products: ${products.length} (${decantCount} decants, ${products.length - decantCount} full bottles)`);
  console.log(`✅ Variants: ${products.reduce((n, p) => n + p.variants.length, 0)}`);

  /* -- coupons ----------------------------------------------------------- */
  const inDays = (d) => { const x = new Date(NOW); x.setDate(x.getDate() + d); return x; };
  const COUPONS = [
    { code: "WELCOME10", type: "PERCENTAGE", value: 10, minOrder: 5000, maxUses: 500, usedCount: 137, isActive: true, freeShipping: false, expiresAt: inDays(90) },
    { code: "LUXE20", type: "PERCENTAGE", value: 20, minOrder: 20000, maxUses: 200, usedCount: 48, isActive: true, freeShipping: true, expiresAt: inDays(45) },
    { code: "FLAT1000", type: "FIXED", value: 1000, minOrder: 8000, maxUses: 300, usedCount: 91, isActive: true, freeShipping: false, expiresAt: inDays(60) },
    { code: "FREESHIP", type: "FIXED", value: 0, minOrder: 3000, maxUses: null, usedCount: 264, isActive: true, freeShipping: true, expiresAt: null },
    { code: "DECANT15", type: "PERCENTAGE", value: 15, minOrder: 2000, maxUses: 150, usedCount: 62, isActive: true, freeShipping: false, expiresAt: inDays(30) },
    { code: "EIDSALE25", type: "PERCENTAGE", value: 25, minOrder: 15000, maxUses: 100, usedCount: 100, isActive: false, freeShipping: true, expiresAt: inDays(-20) },
  ];
  for (const c of COUPONS) {
    await prisma.coupon.create({ data: { ...c, createdAt: daysAgo(120), updatedAt: daysAgo(10) } });
  }
  console.log(`✅ Coupons: ${COUPONS.length} (5 active, 1 expired)`);

  /* -- orders & order items --------------------------------------------- */
  const allVariants = products.flatMap((p) => p.variants.map((v) => ({ product: p, variant: v })));
  const ORDER_COUNT = 64;
  let orderNo = 1000;
  let placed = 0;

  for (let i = 0; i < ORDER_COUNT; i++) {
    // Newest orders first: spread across the last 180 days, with a few in the last few days.
    const ageDays = i < 4 ? i : Math.floor((i / ORDER_COUNT) * 178) + 1;
    const createdAt = daysAgo(ageDays, int(9, 21));
    const user = pick(users);

    const lineCount = int(1, 3);
    const chosen = [];
    for (let k = 0; k < lineCount; k++) {
      const c = pick(allVariants);
      if (!chosen.some((x) => x.variant.id === c.variant.id)) chosen.push(c);
    }

    const items = chosen.map(({ product, variant }) => {
      const quantity = chance(0.75) ? 1 : int(2, 3);
      const unit = Math.round(variant.price * (1 - product.discount / 100));
      return {
        productId: product.id,
        variantId: variant.id,
        quantity,
        price: unit,
        name: product.name,
        image: product.images[0],
        size: variant.size,
      };
    });

    const subtotal = items.reduce((s, it) => s + it.price * it.quantity, 0);

    // Roughly a third of orders use a coupon.
    let couponCode = null;
    let discount = 0;
    let freeShipping = false;
    if (chance(0.35)) {
      const c = pick(COUPONS.filter((x) => x.isActive && subtotal >= x.minOrder));
      if (c) {
        couponCode = c.code;
        discount = c.type === "PERCENTAGE" ? Math.round((subtotal * c.value) / 100) : c.value;
        freeShipping = c.freeShipping;
      }
    }
    const shipping = freeShipping || subtotal - discount >= 15000 ? 0 : 350;
    const total = subtotal - discount + shipping;

    // Status follows order age: old orders are settled, recent ones still moving.
    // The first few are pinned to PENDING so the admin's pending queue is never empty.
    let status, paymentStatus;
    if (i < 4) status = "PENDING";
    else if (ageDays > 30) status = chance(0.9) ? "DELIVERED" : "CANCELLED";
    else if (ageDays > 12) status = pick(["DELIVERED", "DELIVERED", "SHIPPED", "CANCELLED"]);
    else if (ageDays > 4) status = pick(["SHIPPED", "PROCESSING", "DELIVERED"]);
    else status = pick(["PENDING", "PROCESSING", "PROCESSING", "SHIPPED"]);

    const paymentMethod = chance(0.55) ? "STRIPE" : "CASH_ON_DELIVERY";
    if (status === "CANCELLED") paymentStatus = paymentMethod === "STRIPE" ? pick(["REFUNDED", "FAILED"]) : "PENDING";
    else if (status === "DELIVERED") paymentStatus = "PAID";
    else if (paymentMethod === "STRIPE") paymentStatus = "PAID";
    else paymentStatus = "PENDING";

    await prisma.order.create({
      data: {
        userId: user.id,
        orderNumber: `LS-${String(++orderNo)}`,
        status,
        paymentMethod,
        paymentStatus,
        stripePaymentId: paymentMethod === "STRIPE" && paymentStatus === "PAID" ? `pi_3${Math.abs(Math.floor(rnd() * 1e14)).toString(36).toUpperCase()}` : null,
        subtotal,
        discount,
        shipping,
        total,
        couponCode,
        name: user.name,
        phone: user.phone,
        email: user.email,
        address: user.address,
        city: user.city,
        notes: chance(0.25) ? pick(["Please call before delivery.", "Gift wrap if possible.", "Deliver after 6pm.", "Leave with the guard if I am not home."]) : null,
        createdAt,
        updatedAt: createdAt,
        items: { create: items },
      },
    });
    placed++;
  }
  const revenue = await prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: "PAID" } });
  console.log(`✅ Orders: ${placed} across the last 6 months (paid revenue: ${Math.round(revenue._sum.total || 0).toLocaleString()})`);

  /* -- reviews ----------------------------------------------------------- */
  // Only customers who actually bought a product may review it.
  const purchases = await prisma.orderItem.findMany({
    where: { order: { status: { in: ["DELIVERED", "SHIPPED"] } } },
    select: { productId: true, order: { select: { userId: true, createdAt: true } } },
  });

  const seenPair = new Set();
  let reviewCount = 0;
  let approvedCount = 0;
  for (const p of purchases) {
    const key = `${p.order.userId}:${p.productId}`;
    if (seenPair.has(key)) continue;
    seenPair.add(key);
    if (!chance(0.55)) continue;

    const tpl = pick(REVIEWS);
    const approved = chance(0.78); // the rest sit in the admin moderation queue
    const at = new Date(p.order.createdAt);
    at.setDate(at.getDate() + int(3, 14));
    if (at > NOW) at.setTime(NOW.getTime());

    await prisma.review.create({
      data: {
        userId: p.order.userId,
        productId: p.productId,
        rating: tpl.r,
        title: tpl.t,
        body: tpl.b,
        approved,
        createdAt: at,
        updatedAt: at,
      },
    });
    reviewCount++;
    if (approved) approvedCount++;
  }
  console.log(`✅ Reviews: ${reviewCount} (${approvedCount} approved, ${reviewCount - approvedCount} pending moderation)`);

  /* -- rating rollup ----------------------------------------------------- */
  // averageRating / totalReviews are denormalised on Product — recompute from approved reviews.
  for (const p of products) {
    const agg = await prisma.review.aggregate({
      where: { productId: p.id, approved: true },
      _avg: { rating: true },
      _count: { _all: true },
    });
    await prisma.product.update({
      where: { id: p.id },
      data: {
        averageRating: Math.round((agg._avg.rating || 0) * 10) / 10,
        totalReviews: agg._count._all,
      },
    });
  }
  console.log("✅ Product ratings recalculated");

  /* -- wishlists --------------------------------------------------------- */
  let wish = 0;
  for (const u of users) {
    const n = int(0, 5);
    const picked = new Set();
    for (let k = 0; k < n; k++) picked.add(pick(products).id);
    for (const productId of picked) {
      await prisma.wishlistItem.create({ data: { userId: u.id, productId, createdAt: daysAgo(int(1, 90)) } });
      wish++;
    }
  }
  console.log(`✅ Wishlist items: ${wish}`);

  /* -- banners ----------------------------------------------------------- */
  const BANNERS = [
    { title: "Winter Oud Collection", subtitle: "Rich, spicy and built for cold evenings — now in stock", image: SHOT[4], link: "/shop?category=niche", isActive: true, order: 1 },
    { title: "Decants from Rs 900", subtitle: "Sample luxury fragrances before committing to a full bottle", image: SHOT[6], link: "/decants", isActive: true, order: 2 },
    { title: "New Arrivals", subtitle: "Fresh drops from Creed, Tom Ford and Parfums de Marly", image: SHOT[2], link: "/shop?filter=new", isActive: true, order: 3 },
    { title: "Free Shipping Over Rs 15,000", subtitle: "Nationwide delivery in 2–4 working days", image: SHOT[8], link: "/shop", isActive: true, order: 4 },
    { title: "Eid Sale — Ended", subtitle: "Thank you for shopping with us", image: SHOT[9], link: "/shop", isActive: false, order: 5 },
  ];
  for (const b of BANNERS) {
    await prisma.banner.create({ data: { ...b, createdAt: daysAgo(60), updatedAt: daysAgo(20) } });
  }
  console.log(`✅ Banners: ${BANNERS.length} (4 active)`);

  /* -- theme ------------------------------------------------------------- */
  await prisma.themeSettings.create({
    data: {
      primaryColor: "#d4af37",
      secondaryColor: "#1a1a1a",
      accentColor: "#c9a227",
      fontHeading: "Playfair Display",
      fontBody: "Inter",
      logo: null,
      banners: [SHOT[0], SHOT[4], SHOT[6]],
      homeSections: {
        hero: { enabled: true, order: 1 },
        whyChooseUs: { enabled: true, order: 2 },
        featured: { enabled: true, order: 3, title: "Featured Fragrances" },
        newArrivals: { enabled: true, order: 4, title: "New Arrivals" },
        decants: { enabled: true, order: 5, title: "Shop Decants" },
        bestSellers: { enabled: true, order: 6, title: "Best Sellers" },
        brands: { enabled: true, order: 7, title: "Shop by Brand" },
        reviews: { enabled: true, order: 8, title: "What Our Customers Say" },
      },
    },
  });
  console.log("✅ Theme settings initialised");

  console.log("\n🎉 Seed complete.\n");
  console.log("   Admin login    : admin@luxescents.com / admin123456");
  console.log("   Second admin   : manager@luxescents.com / admin123456");
  console.log("   Customer login : ayesha.khan@example.com / customer123  (any seeded customer email works)");
  console.log("   Coupons        : WELCOME10, LUXE20, FLAT1000, FREESHIP, DECANT15\n");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
