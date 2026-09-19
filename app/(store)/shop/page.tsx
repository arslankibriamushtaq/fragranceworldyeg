import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import ShopContent from "@/components/shop/ShopContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  description: "Browse our complete collection of luxury perfumes and decants",
};

// Reads live data from the DB — render per request instead of prerendering at build time.
export const dynamic = "force-dynamic";

async function getShopData() {
  const [brands, categories] = await Promise.all([
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);
  return { brands, categories };
}

export default async function ShopPage({ searchParams }: { searchParams: any }) {
  const { brands, categories } = await getShopData();
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="section-title">Shop All Fragrances</h1>
        <div className="gold-divider" />
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <ShopContent brands={brands} categories={categories} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
