import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ui/ProductCard";
import type { Metadata } from "next";
import DecantHero from "@/components/home/DecantHero";
import DecantListing from "@/components/decants/DecantListing";

export const metadata: Metadata = {
  description: "Try luxury fragrances in 5ml and 10ml decants. Sample before you commit.",
};

// Reads live data from the DB — render per request instead of prerendering at build time.
export const dynamic = "force-dynamic";

export default async function DecantsPage() {
  const decants = await prisma.product.findMany({
    where: { type: "DECANT" },
    include: { brand: true, variants: true },
    orderBy: { createdAt: "desc" },
  }).catch(() => []);

  // Get unique brands from decants
  const brands = Array.from(new Set(decants.map((d) => d.brand.name))).sort();

  return (
    <div className="bg-luxury-cream min-h-screen">
      {/* Video Hero */}
      <DecantHero />

      {/* Listing */}
      <DecantListing decants={decants} brands={brands} />
    </div>
  );
}
