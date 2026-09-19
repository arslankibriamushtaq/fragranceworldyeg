import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Package } from "lucide-react";

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  PROCESSING: "bg-blue-100 text-blue-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const orders = await prisma.order.findMany({
    where: { userId: (session.user as any).id },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard" className="text-gray-400 hover:text-gold-500 transition-colors text-sm">← Dashboard</Link>
        <h1 className="font-serif text-3xl font-bold text-gray-900">My Orders</h1>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white border border-gray-100 shadow-sm">
          <Package size={48} className="text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500 mb-6">You haven't placed any orders yet</p>
          <Link href="/shop" className="btn-gold">Shop Now</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white border border-gray-100 shadow-sm p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <p className="font-bold text-gray-900">{order.orderNumber}</p>
                  <p className="text-sm text-gray-400">{new Date(order.createdAt).toLocaleDateString("en-PK", { year: "numeric", month: "long", day: "numeric" })}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-3 py-1 uppercase tracking-wider font-medium ${statusColors[order.status] || "bg-gray-100 text-gray-600"}`}>
                    {order.status}
                  </span>
                  <span className="font-bold text-gold-500">CA$ {order.total.toLocaleString()}</span>
                </div>
              </div>
              <div className="border-t border-gray-50 pt-4">
                <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">{order.items.length} item(s)</p>
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-700">{item.name} <span className="text-gray-400">({item.size})</span> × {item.quantity}</span>
                      <span className="font-medium">CA$ {(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-50 text-xs text-gray-400">
                Payment: {order.paymentMethod.replace("_", " ")} · {order.paymentStatus}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
