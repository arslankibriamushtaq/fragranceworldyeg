import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Package, Heart, User, MapPin } from "lucide-react";

async function getUserData(userId: string) {
  const [orders, user] = await Promise.all([
    prisma.order.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true, phone: true, address: true, city: true, createdAt: true } }),
  ]);
  return { orders, user };
}

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  PROCESSING: "bg-blue-100 text-blue-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login?redirect=/dashboard");

  const { orders, user } = await getUserData((session.user as any).id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-gray-900">My Account</h1>
        <p className="text-gray-500 mt-1">Welcome back, {user?.name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link href="/dashboard/orders" className="bg-white border border-gray-100 p-6 shadow-sm hover:shadow-gold transition-all group">
          <Package className="text-gold-400 mb-3 group-hover:scale-110 transition-transform" size={28} />
          <h3 className="font-semibold text-gray-900">{orders.length} Orders</h3>
          <p className="text-xs text-gray-500 mt-1">View & track your orders</p>
        </Link>
        <Link href="/wishlist" className="bg-white border border-gray-100 p-6 shadow-sm hover:shadow-gold transition-all group">
          <Heart className="text-gold-400 mb-3 group-hover:scale-110 transition-transform" size={28} />
          <h3 className="font-semibold text-gray-900">Wishlist</h3>
          <p className="text-xs text-gray-500 mt-1">View your saved fragrances</p>
        </Link>
        <Link href="/dashboard/profile" className="bg-white border border-gray-100 p-6 shadow-sm hover:shadow-gold transition-all group">
          <User className="text-gold-400 mb-3 group-hover:scale-110 transition-transform" size={28} />
          <h3 className="font-semibold text-gray-900">Profile</h3>
          <p className="text-xs text-gray-500 mt-1">Manage your information</p>
        </Link>
      </div>

      {/* Recent Orders */}
      <div className="bg-white border border-gray-100 shadow-sm">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Recent Orders</h2>
          <Link href="/dashboard/orders" className="text-xs text-gold-500 hover:underline">View All</Link>
        </div>
        {orders.length === 0 ? (
          <div className="p-12 text-center">
            <Package size={40} className="text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500">No orders yet</p>
            <Link href="/shop" className="btn-gold mt-4 inline-block text-xs">Start Shopping</Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {orders.map((order) => (
              <div key={order.id} className="p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-sm text-gray-900">{order.orderNumber}</p>
                  <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString()} · {order.items.length} item(s)</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] px-2 py-1 uppercase tracking-wider font-medium rounded ${statusColors[order.status] || "bg-gray-100 text-gray-600"}`}>
                    {order.status}
                  </span>
                  <p className="font-semibold text-sm text-gold-500">CA$ {order.total.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
