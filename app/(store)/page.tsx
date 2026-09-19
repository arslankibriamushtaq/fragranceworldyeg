import HeroBanner from "@/components/home/HeroBanner";
import NewArrivals from "@/components/home/NewArrivals";
import DecantsSection from "@/components/home/DecantsSection";
import BestSellers from "@/components/home/BestSellers";
import BrandsShowcase from "@/components/home/BrandsShowcase";
import CustomerReviews from "@/components/home/CustomerReviews";
import { prisma } from "@/lib/prisma";

// Reads live data from the DB — render per request instead of prerendering at build time.
export const dynamic = "force-dynamic";

async function getHomeData() {
  try {
    const [newArrivals, bestSellers, brands, decants] = await Promise.all([
      prisma.product.findMany({
        where: { isNewArrival: true },
        take: 8,
        include: { brand: true, variants: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.findMany({
        where: { isBestSeller: true },
        take: 8,
        include: { brand: true, variants: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.brand.findMany({
        orderBy: [{ featured: "desc" }, { name: "asc" }],
      }),
      prisma.product.findMany({
        where: { type: "DECANT" },
        take: 6,
        include: { brand: true, variants: true },
        orderBy: { createdAt: "desc" },
      }),
    ]);
    return { newArrivals, bestSellers, brands, decants };
  } catch {
    return { newArrivals: [], bestSellers: [], brands: [], decants: [] };
  }
}

export default async function HomePage() {
  const data = await getHomeData();
  return (
    <>
      <HeroBanner />
      <BrandsShowcase brands={data.brands} />
      <NewArrivals products={data.newArrivals} />
      <BestSellers products={data.bestSellers} />
      <DecantsSection products={data.decants} />
      <CustomerReviews />
    </>
  );
}
