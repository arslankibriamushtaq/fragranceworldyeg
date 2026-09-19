import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  description: "Explore our curated collection of luxury perfume brands",
};

// Reads live data from the DB — render per request instead of prerendering at build time.
export const dynamic = "force-dynamic";

export default async function BrandsPage() {
  const brands = await prisma.brand.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { products: true } },
    },
  }).catch(() => []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <h1 className="section-title">Our Brands</h1>
        <div className="gold-divider mx-auto" />
        <p className="text-gray-500 mt-4 max-w-lg mx-auto">
          We carry authentic fragrances from the world's most prestigious maisons
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {brands.map((brand) => (
          <Link
            key={brand.id}
            href={`/brands/${brand.slug}`}
            className="group bg-white border border-gray-100 p-6 text-center hover:shadow-gold transition-all duration-300"
          >
            {brand.logo ? (
              <div className="h-16 flex items-center justify-center mb-4">
                <Image
                  src={brand.logo}
                  alt={brand.name}
                  width={120}
                  height={60}
                  className="object-contain max-h-full grayscale group-hover:grayscale-0 transition-all"
                />
              </div>
            ) : (
              <div className="h-16 flex items-center justify-center mb-4">
                <span className="font-serif text-2xl font-bold text-gray-300 group-hover:text-gold-400 transition-colors">
                  {brand.name[0]}
                </span>
              </div>
            )}
            <h3 className="font-serif font-semibold text-gray-900 group-hover:text-gold-500 transition-colors">{brand.name}</h3>
            <p className="text-xs text-gray-400 mt-1">{(brand as any)._count?.products || 0} fragrances</p>
          </Link>
        ))}

        {brands.length === 0 && (
          <div className="col-span-4 text-center py-16 text-gray-500">No brands available</div>
        )}
      </div>
    </div>
  );
}
