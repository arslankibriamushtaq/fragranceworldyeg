import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public order lookup: order number + the email used at checkout. No login required.
export async function POST(req: NextRequest) {
  try {
    const { orderNumber, email } = await req.json();
    if (!orderNumber?.trim() || !email?.trim()) {
      return NextResponse.json({ error: "Enter your order number and email" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { orderNumber: orderNumber.trim().toUpperCase() },
      include: { items: { select: { name: true, size: true, quantity: true, price: true, image: true } } },
    });

    // Same message for "not found" and "wrong email" so order numbers can't be probed.
    if (!order || order.email.trim().toLowerCase() !== email.trim().toLowerCase()) {
      return NextResponse.json({ error: "No order found with that order number and email" }, { status: 404 });
    }

    return NextResponse.json({
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      name: order.name,
      city: order.city,
      subtotal: order.subtotal,
      discount: order.discount,
      shipping: order.shipping,
      total: order.total,
      items: order.items,
    });
  } catch {
    return NextResponse.json({ error: "Could not look up the order" }, { status: 500 });
  }
}
