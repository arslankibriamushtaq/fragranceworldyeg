"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, ShoppingBag, ArrowRight, Tag, X } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { formatPrice, calculateShipping, FREE_SHIPPING_THRESHOLD } from "@/lib/utils";
import toast from "react-hot-toast";

export default function CartPage() {
  const { items, removeItem, updateQuantity, applyCoupon, removeCoupon, couponCode, couponDiscount, getSubtotal, getTotal } = useCartStore();
  const [couponInput, setCouponInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const subtotal = getSubtotal();
  const total = getTotal();
  const shipping = calculateShipping(total);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput.toUpperCase(), subtotal }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      applyCoupon(couponInput.toUpperCase(), data.discount);
      toast.success(data.message);
      setCouponInput("");
    } catch {
      toast.error("Failed to apply coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <ShoppingBag size={64} className="text-gray-200 mx-auto mb-6" />
        <h1 className="font-serif text-3xl text-gray-900 mb-4">Your Cart is Empty</h1>
        <p className="text-gray-500 mb-8">Discover our luxury fragrance collection and find your signature scent.</p>
        <Link href="/shop" className="btn-gold">Shop Now</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-serif text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.variantId} className="flex gap-4 p-4 bg-white border border-gray-100 shadow-sm">
              <div className="w-20 h-24 relative flex-shrink-0 bg-gray-50">
                <Image src={item.image || "/placeholder.jpg"} alt={item.name} fill className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[10px] text-gold-500 uppercase tracking-widest">{item.brand}</p>
                    <h3 className="font-serif font-medium text-gray-900">{item.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{item.size}</p>
                  </div>
                  <button onClick={() => removeItem(item.variantId)} className="text-gray-400 hover:text-red-500 transition-colors p-1 flex-shrink-0">
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-gray-200">
                    <button onClick={() => updateQuantity(item.variantId, item.quantity - 1)} className="px-3 py-1 hover:bg-gray-50 text-lg font-light">−</button>
                    <span className="px-3 py-1 text-sm font-medium">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.variantId, item.quantity + 1)} className="px-3 py-1 hover:bg-gray-50 text-lg font-light">+</button>
                  </div>
                  <p className="font-semibold text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="space-y-4">
          {/* Coupon */}
          <div className="bg-white border border-gray-100 p-4 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-3 flex items-center gap-2">
              <Tag size={16} className="text-gold-400" /> Promo Code
            </h3>
            {couponCode ? (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 px-3 py-2">
                <span className="text-sm text-green-700 font-medium">{couponCode} applied!</span>
                <button onClick={removeCoupon} className="text-green-600 hover:text-green-800"><X size={14} /></button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                  className="input-luxury flex-1 text-sm"
                />
                <button
                  onClick={handleApplyCoupon}
                  disabled={couponLoading}
                  className="btn-gold px-4 py-2 text-xs disabled:opacity-50"
                >
                  {couponLoading ? "..." : "Apply"}
                </button>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="bg-white border border-gray-100 p-4 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{formatPrice(couponDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className={shipping === 0 ? "text-green-600" : ""}>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-gray-400">Add {formatPrice(FREE_SHIPPING_THRESHOLD - total)} more for free shipping</p>
              )}
              <div className="border-t border-gray-100 pt-2 flex justify-between font-semibold text-base">
                <span>Total</span>
                <span className="text-gold-500">{formatPrice(total + shipping)}</span>
              </div>
            </div>
            <Link href="/checkout" className="btn-gold w-full flex items-center justify-center gap-2 mt-4">
              Proceed to Checkout <ArrowRight size={16} />
            </Link>
            <Link href="/shop" className="block text-center text-xs text-gray-500 hover:text-gold-500 transition-colors mt-3 underline">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
