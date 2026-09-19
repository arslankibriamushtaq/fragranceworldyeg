import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    // Products must belong to a brand, so a brand that still has products can't be removed.
    const productCount = await prisma.product.count({ where: { brandId: params.id } });
    if (productCount > 0) {
      return NextResponse.json(
        { error: `This brand has ${productCount} product${productCount === 1 ? "" : "s"}. Delete them or move them to another brand first.` },
        { status: 400 }
      );
    }
    await prisma.brand.delete({ where: { id: params.id } });
    return NextResponse.json({ message: "Brand deleted" });
  } catch {
    return NextResponse.json({ error: "Failed to delete brand" }, { status: 500 });
  }
}
