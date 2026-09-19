import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateOrderNumber } from "@/lib/utils";
import { sendOrderConfirmationEmail } from "@/lib/mail";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  try {
    const body = await req.json();
    const { items, paymentMethod, stripePaymentId, name, phone, email, address, city, notes, couponCode, subtotal, discount, shipping, total } = body;

    // Card payments only — no cash on delivery.
    if (paymentMethod !== "STRIPE" || !stripePaymentId) {
      return NextResponse.json({ error: "Only card payments are accepted" }, { status: 400 });
    }

    // Confirm with Stripe that this payment really succeeded for this amount and hasn't been used before.
    if (!stripe) return NextResponse.json({ error: "Card payments are not configured" }, { status: 500 });
    // Same payment submitted again (retry / double click): return the order it already created.
    const existingOrder = await prisma.order.findFirst({ where: { stripePaymentId }, include: { items: true } });
    if (existingOrder) {
      return NextResponse.json({ order: existingOrder, orderNumber: existingOrder.orderNumber }, { status: 200 });
    }

    const intent = await stripe.paymentIntents.retrieve(stripePaymentId);
    const paid = intent.status === "succeeded";
    if (!paid && intent.status !== "processing") {
      return NextResponse.json({ error: `Payment not completed (status: ${intent.status})` }, { status: 400 });
    }
    if (intent.currency !== "cad" || intent.amount !== Math.round(Number(total) * 100)) {
      return NextResponse.json({ error: "Payment amount does not match the order total" }, { status: 400 });
    }

    // Validate stock
    for (const item of items) {
      const variant = await prisma.variant.findUnique({ where: { id: item.variantId } });
      if (!variant || variant.stock < item.quantity) {
        return NextResponse.json({ error: `Insufficient stock for ${item.name}` }, { status: 400 });
      }
    }

    const orderNumber = generateOrderNumber();

    const order = await prisma.order.create({
      data: {
        userId: (session?.user as any)?.id || null,
        orderNumber,
        paymentMethod,
        paymentStatus: paid ? "PAID" : "PENDING",
        stripePaymentId,
        status: paid ? "PROCESSING" : "PENDING",
        subtotal: Number(subtotal),
        discount: Number(discount) || 0,
        shipping: Number(shipping) || 0,
        total: Number(total),
        couponCode,
        name, phone, email, address, city, notes,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.price,
            name: item.name,
            image: item.image,
            size: item.size,
          })),
        },
      },
      include: { items: true },
    });

    // Update stock
    for (const item of items) {
      await prisma.variant.update({
        where: { id: item.variantId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    // Update coupon usage
    if (couponCode) {
      await prisma.coupon.update({
        where: { code: couponCode },
        data: { usedCount: { increment: 1 } },
      }).catch(() => {});
    }

    // Send confirmation email
    await sendOrderConfirmationEmail(
      email,
      orderNumber,
      items.map((i: any) => ({ name: i.name, size: i.size, quantity: i.quantity, price: i.price })),
      total
    ).catch(() => {});

    return NextResponse.json({ order, orderNumber }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create order" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const isAdmin = (session.user as any).role === "ADMIN";
    const orders = await prisma.order.findMany({
      where: isAdmin ? {} : { userId: (session.user as any).id },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(orders);
  } catch {
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
