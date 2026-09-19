import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import OrderStatusUpdater from "@/components/admin/OrderStatusUpdater";

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") redirect("/login");

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      items: true,
      user: { select: { name: true, email: true } },
    },
  }).catch(() => null);

  if (!order) notFound();

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-700",
    PROCESSING: "bg-blue-100 text-blue-700",
    SHIPPED: "bg-purple-100 text-purple-700",
    DELIVERED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/orders" className="text-gray-400 hover:text-gold-500 text-sm">← Orders</Link>
          <h1 className="text-2xl font-bold text-gray-900">{order.orderNumber}</h1>
        </div>
        <span className={`text-sm px-3 py-1 rounded font-medium ${statusColors[order.status] || "bg-gray-100"}`}>{order.status}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Customer Info */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Customer</h3>
          <p className="text-sm text-gray-700 font-medium">{order.name}</p>
          <p className="text-sm text-gray-500">{order.email}</p>
          <p className="text-sm text-gray-500">{order.phone}</p>
        </div>

        {/* Shipping */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Shipping Address</h3>
          <p className="text-sm text-gray-600">{order.address}</p>
          <p className="text-sm text-gray-600">{order.city}</p>
          {order.notes && <p className="text-xs text-gray-400 mt-2 italic">Note: {order.notes}</p>}
        </div>

        {/* Payment */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Payment</h3>
          <p className="text-sm text-gray-600">Method: {order.paymentMethod.replace("_", " ")}</p>
          <p className="text-sm text-gray-600">Status: <span className={order.paymentStatus === "PAID" ? "text-green-600 font-medium" : "text-yellow-600"}>{order.paymentStatus}</span></p>
          <p className="text-sm font-bold text-gray-900 mt-2">Total: CA$ {order.total.toLocaleString()}</p>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-semibold text-gray-900 mb-4">Order Items</h3>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50">
              <div className="w-12 h-14 relative flex-shrink-0 bg-white">
                <Image src={item.image || "/placeholder.jpg"} alt={item.name} fill className="object-cover" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm text-gray-900">{item.name}</p>
                <p className="text-xs text-gray-500">{item.size} × {item.quantity}</p>
              </div>
              <p className="font-semibold text-sm">CA$ {(item.price * item.quantity).toLocaleString()}</p>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-100 pt-3 mt-3 space-y-1 text-sm">
          <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>CA$ {order.subtotal.toLocaleString()}</span></div>
          {order.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-CA$ {order.discount.toLocaleString()}</span></div>}
          <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span>{order.shipping === 0 ? "Free" : `CA$${order.shipping.toLocaleString()}`}</span></div>
          <div className="flex justify-between font-bold text-base"><span>Total</span><span className="text-gold-500">CA$ {order.total.toLocaleString()}</span></div>
        </div>
      </div>

      {/* Update Status */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-semibold text-gray-900 mb-4">Update Order Status</h3>
        <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />
      </div>

      <p className="text-xs text-gray-400">Order placed: {new Date(order.createdAt).toLocaleString()}</p>
    </div>
  );
}
