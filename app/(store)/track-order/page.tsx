"use client";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Search, Loader2, Package, CheckCircle, Truck, Home, XCircle } from "lucide-react";
import { formatPrice } from "@/lib/utils";

type TrackedOrder = {
  orderNumber: string;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  city: string;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  items: { name: string; size: string; quantity: number; price: number; image: string }[];
};

const STEPS = [
  { key: "PENDING", label: "Order Placed", Icon: Package },
  { key: "PROCESSING", label: "Processing", Icon: CheckCircle },
  { key: "SHIPPED", label: "Shipped", Icon: Truck },
  { key: "DELIVERED", label: "Delivered", Icon: Home },
] as const;

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(searchParams.get("order") || "");
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<TrackedOrder | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setOrder(null);
    try {
      const res = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber, email }),
      });
      const data = await res.json();
      if (res.ok) setOrder(data);
      else setError(data.error || "Order not found");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const stepIndex = order ? STEPS.findIndex((s) => s.key === order.status) : -1;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-10">
        <h1 className="section-title">Track Your Order</h1>
        <div className="gold-divider mx-auto" />
        <p className="text-sm text-gray-500 mt-3">
          Enter the order number from your confirmation email and the email you used at checkout.
        </p>
      </div>

      <form onSubmit={handleTrack} className="bg-white border border-gray-100 shadow-sm p-6 grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 items-end">
        <div>
          <label className="text-xs uppercase tracking-wider text-gray-600 mb-1 block">Order Number</label>
          <input
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            required
            className="input-luxury uppercase"
            placeholder="FW-XXXXXXX-XXXX"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-wider text-gray-600 mb-1 block">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input-luxury"
            placeholder="your@email.com"
          />
        </div>
        <button type="submit" disabled={loading} className="btn-gold inline-flex items-center justify-center gap-2 py-3 disabled:opacity-50">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
          Track
        </button>
      </form>

      {error && <p className="text-center text-sm text-red-500 mt-4">{error}</p>}

      {order && (
        <div className="mt-8 bg-white border border-gray-100 shadow-sm p-6 space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-400">Order</p>
              <p className="font-semibold text-forest-900">{order.orderNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-wider text-gray-400">Placed on</p>
              <p className="text-sm text-forest-900">{new Date(order.createdAt).toLocaleDateString("en-CA", { dateStyle: "medium" })}</p>
            </div>
          </div>

          {order.status === "CANCELLED" ? (
            <div className="flex items-center gap-3 bg-red-50 border border-red-100 p-4 text-sm text-red-700">
              <XCircle size={18} /> This order was cancelled. Please contact us if you have questions.
            </div>
          ) : (
            <ol className="grid grid-cols-4 gap-2">
              {STEPS.map(({ key, label, Icon }, i) => {
                const done = i <= stepIndex;
                return (
                  <li key={key} className="flex flex-col items-center text-center gap-2">
                    <span
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                        done ? "bg-gold-400 border-gold-400 text-white" : "border-gray-200 text-gray-300"
                      }`}
                    >
                      <Icon size={16} />
                    </span>
                    <span className={`text-[11px] uppercase tracking-wider ${done ? "text-forest-900 font-medium" : "text-gray-400"}`}>{label}</span>
                  </li>
                );
              })}
            </ol>
          )}

          <div className="divide-y divide-gray-100 border-t border-gray-100">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center gap-4 py-3">
                {item.image && (
                  <Image src={item.image} alt={item.name} width={48} height={48} className="w-12 h-12 object-cover bg-gray-50" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-forest-900 truncate">{item.name}</p>
                  <p className="text-xs text-gray-400">{item.size} × {item.quantity}</p>
                </div>
                <p className="text-sm font-medium">{formatPrice(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>

          <div className="space-y-1 text-sm border-t border-gray-100 pt-4">
            <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
            {order.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatPrice(order.discount)}</span></div>}
            <div className="flex justify-between text-gray-500"><span>Shipping</span><span>{order.shipping === 0 ? "Free" : formatPrice(order.shipping)}</span></div>
            <div className="flex justify-between font-semibold text-forest-900 pt-1"><span>Total</span><span>{formatPrice(order.total)}</span></div>
          </div>

          <p className="text-xs text-gray-400 text-center">
            Questions about your order? <Link href="/contact" className="text-gold-500 hover:underline">Contact us</Link>
          </p>
        </div>
      )}
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense>
      <TrackOrderContent />
    </Suspense>
  );
}
