import { ShoppingBag, Users, Package, TrendingUp, Calendar } from "lucide-react";

interface StatsCardsProps {
  totalOrders: number;
  ordersToday: number;
  totalCustomers: number;
  totalProducts: number;
  totalRevenue: number;
}

export default function StatsCards({ totalOrders, ordersToday, totalCustomers, totalProducts, totalRevenue }: StatsCardsProps) {
  const stats = [
    { label: "Total Revenue", value: `CA$${totalRevenue.toLocaleString()}`, icon: TrendingUp, color: "bg-gold-400", change: "+12%" },
    { label: "Total Orders", value: totalOrders.toLocaleString(), icon: ShoppingBag, color: "bg-blue-500", change: "" },
    { label: "Orders Today", value: ordersToday.toLocaleString(), icon: Calendar, color: "bg-green-500", change: "" },
    { label: "Customers", value: totalCustomers.toLocaleString(), icon: Users, color: "bg-purple-500", change: "" },
    { label: "Products", value: totalProducts.toLocaleString(), icon: Package, color: "bg-orange-500", change: "" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {stats.map(({ label, value, icon: Icon, color, change }) => (
        <div key={label} className="bg-white rounded-lg shadow p-4">
          <div className={`${color} w-10 h-10 rounded-lg flex items-center justify-center mb-3`}>
            <Icon size={20} className="text-white" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500 mt-1">{label}</p>
          {change && <p className="text-xs text-green-600 mt-1">{change} this month</p>}
        </div>
      ))}
    </div>
  );
}
