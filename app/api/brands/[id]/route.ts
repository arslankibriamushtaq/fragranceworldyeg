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
    // Products must belong to a brand: move them to `moveTo` first, or refuse while any remain.
    const moveTo = req.nextUrl.searchParams.get("moveTo");
    if (moveTo) {
      if (moveTo === params.id) return NextResponse.json({ error: "Choose a different brand" }, { status: 400 });
      const target = await prisma.brand.findUnique({ where: { id: moveTo } });
      if (!target) return NextResponse.json({ error: "Target brand not found" }, { status: 400 });
      await prisma.product.updateMany({ where: { brandId: params.id }, data: { brandId: moveTo } });
    }
    const productCount = await prisma.product.count({ where: { brandId: params.id } });
    if (productCount > 0) {
      return NextResponse.json(
        { error: `This brand has ${productCount} product${productCount === 1 ? "" : "s"}. Move them to another brand first.`, productCount },
        { status: 409 }
      );
    }
    await prisma.brand.delete({ where: { id: params.id } });
    return NextResponse.json({ message: "Brand deleted" });
  } catch {
    return NextResponse.json({ error: "Failed to delete brand" }, { status: 500 });
  }
}
