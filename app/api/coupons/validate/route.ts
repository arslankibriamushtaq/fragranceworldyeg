import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { code, subtotal } = await req.json();
    const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });

    if (!coupon) return NextResponse.json({ error: "Invalid coupon code" }, { status: 400 });
    if (!coupon.isActive) return NextResponse.json({ error: "Coupon is no longer active" }, { status: 400 });
    if (coupon.expiresAt && new Date() > coupon.expiresAt) return NextResponse.json({ error: "Coupon has expired" }, { status: 400 });
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) return NextResponse.json({ error: "Coupon usage limit reached" }, { status: 400 });
    if (subtotal < coupon.minOrder) return NextResponse.json({ error: `Minimum order amount is CA$${coupon.minOrder.toLocaleString()}` }, { status: 400 });

    const discount = coupon.type === "PERCENTAGE"
      ? (subtotal * coupon.value) / 100
      : coupon.value;

    return NextResponse.json({ discount: Math.min(discount, subtotal), freeShipping: coupon.freeShipping, message: "Coupon applied successfully!" });
  } catch {
    return NextResponse.json({ error: "Failed to validate coupon" }, { status: 500 });
  }
}
