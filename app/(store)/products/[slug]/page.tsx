import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductDetail from "@/components/product/ProductDetail";
import RelatedProducts from "@/components/product/RelatedProducts";
import type { Metadata } from "next";

interface Props {
  params: { slug: string };
}

async function getProduct(slug: string) {
  try {
    return await prisma.product.findUnique({
      where: { slug },
      include: {
        brand: true,
        category: true,
        variants: true,
        reviews: {
          where: { approved: true },
          include: { user: { select: { name: true, image: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
    });
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct(params.slug);
  if (!product) return {};
  return {
    description: product.metaDescription || product.description.substring(0, 160),
    openGraph: {
      title: product.name,
      description: product.description.substring(0, 160),
      images: product.images[0] ? [{ url: product.images[0] }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      images: product.images[0] ? [product.images[0]] : [],
    },
    alternates: { canonical: `/products/${product.slug}` },
  };
}

export default async function ProductPage({ params }: Props) {
  const product = await getProduct(params.slug);
  if (!product) notFound();

  const related = await prisma.product.findMany({
    where: {
      brandId: product.brandId,
      id: { not: product.id },
    },
    take: 4,
    include: { brand: true, variants: true },
  });

  return (
    <>
      <ProductDetail product={product} />
      <RelatedProducts products={related} />
    </>
  );
}
