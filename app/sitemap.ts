import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ["", "/shop", "/decants", "/brands", "/contact", "/shipping-policy", "/return-policy"].map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
  }));

  try {
    const [products, brands] = await Promise.all([
      prisma.product.findMany({ select: { slug: true, updatedAt: true } }),
      prisma.brand.findMany({ select: { slug: true, updatedAt: true } }),
    ]);
    return [
      ...staticRoutes,
      ...products.map((p) => ({ url: `${BASE_URL}/products/${p.slug}`, lastModified: p.updatedAt })),
      ...brands.map((b) => ({ url: `${BASE_URL}/brands/${b.slug}`, lastModified: b.updatedAt })),
    ];
  } catch {
    return staticRoutes;
  }
}
