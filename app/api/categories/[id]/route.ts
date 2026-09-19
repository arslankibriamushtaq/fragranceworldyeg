import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

async function isAdmin() {
  const session = await getServerSession(authOptions);
  return !!session && (session.user as any).role === "ADMIN";
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { name, description, image } = await req.json();
    if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });
    const category = await prisma.category.update({
      where: { id: params.id },
      // Slug is kept as-is so existing menu/footer links keep working.
      data: { name: name.trim(), description, image },
    });
    return NextResponse.json(category);
  } catch {
    return NextResponse.json({ error: "Failed to update category (name may already exist)" }, { status: 500 });
  }
}

// Products must belong to a category, so a category with products can only be
// deleted once its products are moved: pass ?moveTo=<categoryId>.
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const moveTo = req.nextUrl.searchParams.get("moveTo");
    const productCount = await prisma.product.count({ where: { categoryId: params.id } });

    if (productCount > 0) {
      if (!moveTo || moveTo === params.id) {
        return NextResponse.json(
          { error: `This category has ${productCount} product(s). Choose a category to move them to.`, productCount },
          { status: 409 }
        );
      }
      await prisma.product.updateMany({ where: { categoryId: params.id }, data: { categoryId: moveTo } });
    }

    await prisma.category.delete({ where: { id: params.id } });
    return NextResponse.json({ message: "Category deleted", moved: productCount });
  } catch {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
