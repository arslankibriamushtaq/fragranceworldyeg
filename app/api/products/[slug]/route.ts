import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAllowedDecantSize } from "@/lib/utils";

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: params.slug },
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
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(product);
  } catch {
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { variants, ...productData } = body;
    if (productData.type === "DECANT" && variants?.some((v: any) => !isAllowedDecantSize(String(v.size)))) {
      return NextResponse.json({ error: "Decants are only available in 5ml and 10ml" }, { status: 400 });
    }

    // Update slug if name changed
    if (productData.name) {
      const { generateSlug } = await import("@/lib/utils");
      productData.slug = generateSlug(productData.name);
    }

    // Ensure numeric types
    if (productData.basePrice) productData.basePrice = Number(productData.basePrice);
    if (productData.discount !== undefined) productData.discount = Number(productData.discount);

    const product = await prisma.product.update({
      where: { slug: params.slug },
      data: {
        ...productData,
        // Delete old variants and create new ones
        ...(variants && {
          variants: {
            deleteMany: {},
            create: variants.map((v: any) => ({
              size: v.size,
              price: Number(v.price),
              stock: Number(v.stock),
              sku: v.sku,
            })),
          },
        }),
      },
      include: { brand: true, category: true, variants: true },
    });
    return NextResponse.json(product);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const product = await prisma.product.findUnique({
      where: { slug: params.slug },
      select: { id: true },
    });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Delete related records that don't have onDelete: Cascade
    await prisma.orderItem.deleteMany({ where: { productId: product.id } });
    await prisma.review.deleteMany({ where: { productId: product.id } });
    await prisma.wishlistItem.deleteMany({ where: { productId: product.id } });

    // Variants have onDelete: Cascade, but delete explicitly to be safe
    await prisma.variant.deleteMany({ where: { productId: product.id } });

    await prisma.product.delete({ where: { id: product.id } });
    return NextResponse.json({ message: "Product deleted" });
  } catch {
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
