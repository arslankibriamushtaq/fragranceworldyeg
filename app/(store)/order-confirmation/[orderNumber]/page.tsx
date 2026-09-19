"use client";

import { useEffect, useState } from "react";
import { CheckCircle, Package, PartyPopper, ShoppingBag, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

function ConfettiPiece({ index }: { index: number }) {
  const colors = ["#b88c65", "#a77a54", "#dcb68f", "#ead0b5", "#8c6444", "#ffe4d9", "#0d0b0b", "#f5e8db"];
  const color = colors[index % colors.length];
  const left = Math.random() * 100;
  const delay = Math.random() * 3;
  const duration = 2.5 + Math.random() * 2;
  const size = 6 + Math.random() * 8;
  const rotation = Math.random() * 360;

  return (
    <div
      className="absolute top-0 opacity-0"
      style={{
        left: `${left}%`,
        width: `${size}px`,
        height: `${size * 0.4}px`,
        backgroundColor: color,
        borderRadius: "2px",
        transform: `rotate(${rotation}deg)`,
        animation: `confetti-fall ${duration}s ease-in ${delay}s forwards`,
      }}
    />
  );
}

export default function OrderConfirmationPage() {
  const params = useParams();
  const orderNumber = params.orderNumber as string;
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <style jsx global>{`
        @keyframes confetti-fall {
          0% {
            opacity: 1;
            transform: translateY(-10px) rotate(0deg) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(100vh) rotate(720deg) scale(0.3);
          }
        }
        @keyframes bounce-in {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes slide-up {
          0% { transform: translateY(30px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes pulse-gold {
          0%, 100% { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.4); }
          50% { box-shadow: 0 0 0 20px rgba(212, 175, 55, 0); }
        }
      `}</style>

      {/* Confetti */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
        {Array.from({ length: 60 }).map((_, i) => (
          <ConfettiPiece key={i} index={i} />
        ))}
      </div>

      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-lg w-full text-center">
          {/* Success Icon */}
          <div
            className="relative mx-auto mb-8"
            style={{
              animation: "bounce-in 0.6s ease-out forwards",
              width: "fit-content",
            }}
          >
            <div
              className="w-24 h-24 bg-gradient-to-br from-gold-400 to-gold-600 rounded-full flex items-center justify-center mx-auto"
              style={{ animation: "pulse-gold 2s ease-in-out infinite" }}
            >
              <CheckCircle size={48} className="text-white" strokeWidth={2.5} />
            </div>
            <div className="absolute -top-2 -right-2" style={{ animation: "bounce-in 0.8s ease-out 0.3s both" }}>
              <PartyPopper size={28} className="text-gold-500" />
            </div>
          </div>

          {/* Congratulations Text */}
          <div style={{ animation: showContent ? "slide-up 0.5s ease-out forwards" : "none", opacity: showContent ? 1 : 0 }}>
            <h1 className="font-serif text-4xl font-bold text-gray-900 mb-2">
              Congratulations! 🎉
            </h1>
            <p className="text-lg text-gold-600 font-medium mb-4">Your order has been placed successfully!</p>
            <p className="text-gray-500 mb-6">
              Thank you for shopping with <span className="font-serif font-semibold text-gray-700">Fragrance World YEG</span>.
              We&apos;re preparing your fragrance with care.
            </p>
          </div>

          {/* Order Number Card */}
          <div
            className="bg-white border-2 border-gold-200 rounded-lg p-6 mb-6 shadow-sm"
            style={{ animation: showContent ? "slide-up 0.5s ease-out 0.2s both" : "none" }}
          >
            <div className="flex items-center justify-center gap-2 mb-3">
              <ShoppingBag size={20} className="text-gold-500" />
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wider">Order Number</p>
            </div>
            <p className="text-2xl font-bold text-gold-500 tracking-wide">{orderNumber}</p>
          </div>

          {/* Info Card */}
          <div
            className="bg-gold-50 border border-gold-200 rounded-lg p-4 mb-8"
            style={{ animation: showContent ? "slide-up 0.5s ease-out 0.4s both" : "none" }}
          >
            <div className="flex items-center justify-center gap-2 text-gold-700">
              <Package size={20} />
              <p className="text-sm font-medium">Order confirmation has been sent to your email</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div
            className="flex flex-col sm:flex-row gap-3 justify-center"
            style={{ animation: showContent ? "slide-up 0.5s ease-out 0.6s both" : "none" }}
          >
            <Link
              href="/dashboard/orders"
              className="btn-gold inline-flex items-center justify-center gap-2 px-6 py-3"
            >
              Track Your Order
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/shop"
              className="btn-outline-gold inline-flex items-center justify-center gap-2 px-6 py-3"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
