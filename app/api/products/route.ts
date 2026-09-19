import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateSlug, isAllowedDecantSize } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 12;
    const brand = searchParams.get("brand");
    const category = searchParams.get("category");
    const gender = searchParams.get("gender");
    const type = searchParams.get("type");
    const filter = searchParams.get("filter");
    const minPrice = Number(searchParams.get("minPrice")) || 0;
    const maxPrice = Number(searchParams.get("maxPrice")) || 999999;
    const sort = searchParams.get("sort") || "newest";

    const where: any = {};
    if (brand) where.brand = { slug: brand };
    if (category) where.category = { slug: category };
    if (gender) where.gender = gender.toUpperCase();
    if (type) where.type = type.toUpperCase();
    if (filter === "new") where.isNewArrival = true;
    if (filter === "bestsellers") where.isBestSeller = true;
    if (filter === "featured") where.isFeatured = true;
    if (filter === "decants") where.type = "DECANT";
    where.basePrice = { gte: minPrice, lte: maxPrice };

    let orderBy: any = { createdAt: "desc" };
    if (sort === "price-asc") orderBy = { basePrice: "asc" };
    if (sort === "price-desc") orderBy = { basePrice: "desc" };
    if (sort === "rating") orderBy = { averageRating: "desc" };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
        include: { brand: true, category: true, variants: true },
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({ products, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, brandId, categoryId, type, description, fragranceNotes, gender, images, basePrice, discount, isFeatured, isNewArrival, isBestSeller, metaTitle, metaDescription, variants } = body;
    if (type === "DECANT" && variants?.some((v: any) => !isAllowedDecantSize(String(v.size)))) {
      return NextResponse.json({ error: "Decants are only available in 5ml and 10ml" }, { status: 400 });
    }

    const slug = generateSlug(name);

    const product = await prisma.product.create({
      data: {
        name, slug, brandId, categoryId, type, description, fragranceNotes, gender,
        images, basePrice: Number(basePrice), discount: Number(discount) || 0,
        isFeatured: Boolean(isFeatured), isNewArrival: Boolean(isNewArrival),
        isBestSeller: Boolean(isBestSeller), metaTitle, metaDescription,
        variants: { create: variants?.map((v: any) => ({ size: v.size, price: Number(v.price), stock: Number(v.stock), sku: v.sku })) },
      },
      include: { brand: true, category: true, variants: true },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create product" }, { status: 500 });
  }
}
