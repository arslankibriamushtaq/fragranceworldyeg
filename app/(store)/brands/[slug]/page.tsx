import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ProductCard from "@/components/ui/ProductCard";
import Image from "next/image";

interface Props { params: { slug: string } }

export default async function BrandPage({ params }: Props) {
  const brand = await prisma.brand.findUnique({
    where: { slug: params.slug },
    include: {
      products: {
        include: { brand: true, variants: true },
        orderBy: { createdAt: "desc" },
      },
    },
  }).catch(() => null);

  if (!brand) notFound();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        {brand.logo && (
          <div className="flex justify-center mb-6">
            <Image src={brand.logo} alt={brand.name} width={180} height={80} className="object-contain" />
          </div>
        )}
        <h1 className="section-title">{brand.name}</h1>
        <div className="gold-divider mx-auto" />
        {brand.description && <p className="text-gray-500 mt-4 max-w-lg mx-auto">{brand.description}</p>}
        <p className="text-sm text-gray-400 mt-2">{brand.products.length} fragrances available</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {brand.products.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            slug={product.slug}
            name={product.name}
            brand={product.brand.name}
            image={product.images[0]}
            basePrice={product.basePrice}
            discount={product.discount}
            rating={product.averageRating}
            reviews={product.totalReviews}
            isNew={product.isNewArrival}
            isBestSeller={product.isBestSeller}
            variants={product.variants}
          />
        ))}
      </div>
    </div>
  );
}
