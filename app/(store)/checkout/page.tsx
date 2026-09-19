"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { useCartStore } from "@/store/cartStore";
import { formatPrice, calculateShipping, FREE_SHIPPING_THRESHOLD } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import Image from "next/image";
import { CreditCard, Lock, CheckCircle, PartyPopper, ShoppingBag, Loader2 } from "lucide-react";

const stripeEnabled = !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

const checkoutSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  address: z.string().min(5),
  city: z.string().min(2),
  notes: z.string().optional(),
  // Optional: guests can set a password to create an account with this order.
  password: z.union([z.literal(""), z.string().min(6, "Password must be at least 6 characters")]).optional(),
  paymentMethod: z.literal("STRIPE"),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

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

function StripeCardForm({ clientSecret, onSuccess, onCancel }: { clientSecret: string; onSuccess: (paymentIntentId: string) => Promise<void>; onCancel: () => void }) {
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [processing, setProcessing] = useState(false);
  const [stripe, setStripe] = useState<any>(null);
  const [elements, setElements] = useState<any>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) return;

    const loadStripe = async () => {
      const { loadStripe: ls } = await import("@stripe/stripe-js");
      const s = await ls(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
      if (!s) return;
      setStripe(s);
      const el = s.elements({ clientSecret });
      const card = el.create("payment");
      if (cardRef.current) {
        card.mount(cardRef.current);
      }
      setElements(el);
    };
    loadStripe();
  }, [clientSecret]);

  // Card already charged (or charging) — hand off to order creation.
  const PAID_STATUSES = ["succeeded", "processing"];

  // Stripe can report a non-final status right after confirmation even though the charge
  // goes through a moment later — re-check the intent a few times before giving up.
  const waitForPaidIntent = async () => {
    for (let i = 0; i < 6; i++) {
      const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret);
      if (paymentIntent && PAID_STATUSES.includes(paymentIntent.status)) return paymentIntent;
      if (paymentIntent && paymentIntent.status === "requires_payment_method") return null;
      await new Promise((r) => setTimeout(r, 1000));
    }
    return null;
  };

  const handlePay = async () => {
    if (!stripe || !elements || processing) return;
    setProcessing(true);
    try {
      // If this payment already went through (e.g. a second click), don't charge again.
      const { paymentIntent: current } = await stripe.retrievePaymentIntent(clientSecret);
      if (current && PAID_STATUSES.includes(current.status)) {
        await onSuccess(current.id);
        return;
      }

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      });
      if (paymentIntent && PAID_STATUSES.includes(paymentIntent.status)) {
        await onSuccess(paymentIntent.id);
        return;
      }

      const paid = await waitForPaidIntent();
      if (paid) {
        await onSuccess(paid.id);
      } else {
        toast.error(error?.message || "Payment was not completed. Please try again.");
      }
    } catch {
      toast.error("Payment failed");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 p-3 text-sm text-blue-700 rounded">
        Test card: <strong>4242 4242 4242 4242</strong> | Any future date | Any CVC
      </div>
      <div ref={cardRef} className="border border-gray-200 rounded p-4 min-h-[60px]" />
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handlePay}
          disabled={processing || !stripe}
          className="flex-1 btn-gold flex items-center justify-center gap-2 py-3 disabled:opacity-50"
        >
          {processing ? <><Loader2 size={16} className="animate-spin" /> Processing...</> : <><Lock size={16} /> Pay Now</>}
        </button>
        <button type="button" onClick={onCancel} className="btn-outline-gold px-6 py-3">
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { items, getSubtotal, getTotal, couponCode, couponDiscount, clearCart } = useCartStore();
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [completedOrderNumber, setCompletedOrderNumber] = useState("");
  const [completedEmail, setCompletedEmail] = useState("");
  const [stripeClientSecret, setStripeClientSecret] = useState("");
  const [pendingOrderData, setPendingOrderData] = useState<any>(null);
  const orderPlacedRef = useRef(false);

  const subtotal = getSubtotal();
  const discount = couponDiscount;
  const shipping = calculateShipping(subtotal);
  const total = getTotal() + shipping;

  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema) as any,
    defaultValues: {
      name: session?.user?.name || "",
      email: session?.user?.email || "",
      paymentMethod: "STRIPE",
    },
  });


  // Redirect to cart when it's empty — client-side only (never call router.push during render/SSR).
  useEffect(() => {
    if (items.length === 0 && !orderPlacedRef.current && !orderSuccess) {
      router.push("/cart");
    }
  }, [items.length, orderSuccess, router]);

  const createOrder = async (orderData: any, stripePaymentId?: string) => {
    const res = await fetch("/api/orders", {
      method: "POST",
      signal: AbortSignal.timeout(30000),
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...orderData, stripePaymentId }),
    });
    const result = await res.json();
    if (!res.ok) { toast.error(result.error || "Order failed"); return null; }
    return result;
  };

  const onSubmit = async (data: CheckoutForm) => {
    if (status === "loading") { toast.error("Please wait..."); return; }
    if (items.length === 0) { toast.error("Cart is empty"); return; }

    const orderData = {
      ...data,
      items: items.map((i) => ({
        productId: i.productId,
        variantId: i.variantId,
        quantity: i.quantity,
        price: i.price,
        name: i.name,
        image: i.image,
        size: i.size,
      })),
      subtotal,
      discount,
      shipping,
      total,
      couponCode,
    };

    // Card payments only — create the payment intent, then the order is created after payment succeeds.
    setSubmitting(true);
    try {
      const res = await fetch("/api/stripe/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: total }),
      });
      const { clientSecret, error } = await res.json();
      if (error || !clientSecret) {
        toast.error(error || "Failed to initialize payment");
        return;
      }
      setStripeClientSecret(clientSecret);
      setPendingOrderData(orderData);
    } catch {
      toast.error("Failed to initialize payment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStripeSuccess = async (paymentIntentId: string) => {
    if (!pendingOrderData) return;
    setSubmitting(true);
    try {
      const result = await createOrder(pendingOrderData, paymentIntentId);
      if (result) {
        orderPlacedRef.current = true;
        setCompletedOrderNumber(result.orderNumber);
        setCompletedEmail(pendingOrderData.email);
        if (result.accountCreated && pendingOrderData.password) {
          await signIn("credentials", { email: pendingOrderData.email, password: pendingOrderData.password, redirect: false }).catch(() => {});
        }
        setOrderSuccess(true);
        clearCart();
        setStripeClientSecret("");
        setPendingOrderData(null);
      } else {
        // Card is already charged: keep this payment open so "Pay Now" retries the order without charging again.
        toast.error("Your payment went through but we couldn't save the order. Click Pay Now again to retry — you won't be charged twice.", { duration: 8000 });
      }
    } catch {
      toast.error("Your payment went through but we couldn't save the order. Click Pay Now again to retry — you won't be charged twice.", { duration: 8000 });
    } finally {
      setSubmitting(false);
    }
  };

  const handleStripeCancel = () => {
    setStripeClientSecret("");
    setPendingOrderData(null);
  };

  // Cart empty (and no order just placed): render nothing while the effect above redirects to /cart.
  if (items.length === 0 && !orderPlacedRef.current && !orderSuccess) {
    return null;
  }

  // Show success/congratulations overlay
  if (orderSuccess) {
    return (
      <>
        <style jsx global>{`
          @keyframes confetti-fall {
            0% { opacity: 1; transform: translateY(-10px) rotate(0deg) scale(1); }
            100% { opacity: 0; transform: translateY(100vh) rotate(720deg) scale(0.3); }
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
            <div
              className="relative mx-auto mb-8 w-fit"
              style={{ animation: "bounce-in 0.6s ease-out forwards" }}
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

            <div style={{ animation: "slide-up 0.5s ease-out 0.3s both" }}>
              <h1 className="font-serif text-4xl font-bold text-gray-900 mb-2">
                Congratulations!
              </h1>
              <p className="text-lg text-gold-600 font-medium mb-4">Your order has been placed successfully!</p>
              <p className="text-gray-500 mb-6">
                Thank you for shopping with <span className="font-serif font-semibold text-gray-700">Fragrance World YEG</span>.
                We&apos;re preparing your fragrance with care.
              </p>
            </div>

            <div
              className="bg-white border-2 border-gold-200 rounded-lg p-6 mb-6 shadow-sm"
              style={{ animation: "slide-up 0.5s ease-out 0.5s both" }}
            >
              <div className="flex items-center justify-center gap-2 mb-3">
                <ShoppingBag size={20} className="text-gold-500" />
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wider">Order Number</p>
              </div>
              <p className="text-2xl font-bold text-gold-500 tracking-wide">{completedOrderNumber}</p>
            </div>

            <p className="text-sm text-gray-400 mb-6" style={{ animation: "slide-up 0.5s ease-out 0.7s both" }}>
              Order confirmation has been sent to your email.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center" style={{ animation: "slide-up 0.5s ease-out 0.9s both" }}>
              <button
                onClick={() => router.push(`/track-order?order=${encodeURIComponent(completedOrderNumber)}&email=${encodeURIComponent(completedEmail)}`)}
                className="btn-gold inline-flex items-center justify-center gap-2 px-8 py-3"
              >
                <ShoppingBag size={16} />
                Track Order
              </button>
              <button
                onClick={() => router.push("/shop")}
                className="btn-outline-gold inline-flex items-center justify-center gap-2 px-8 py-3"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-serif text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2 space-y-6">
          {stripeClientSecret ? (
            /* Stripe Payment Form */
            <div className="bg-white border border-gray-100 p-6 shadow-sm">
              <h2 className="font-semibold text-lg mb-4">Complete Payment</h2>
              <p className="text-sm text-gray-500 mb-4">Total: <strong className="text-gold-500">{formatPrice(total)}</strong></p>
              <StripeCardForm
                clientSecret={stripeClientSecret}
                onSuccess={handleStripeSuccess}
                onCancel={handleStripeCancel}
              />
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Contact */}
              <div className="bg-white border border-gray-100 p-6 shadow-sm">
                <h2 className="font-semibold text-lg mb-4">Contact Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs uppercase tracking-wider text-gray-600 mb-1 block">Full Name *</label>
                    <input {...register("name")} className="input-luxury" placeholder="Your full name" />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-wider text-gray-600 mb-1 block">Phone *</label>
                    <input {...register("phone")} className="input-luxury" placeholder="+1 780 000 0000" />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs uppercase tracking-wider text-gray-600 mb-1 block">Email *</label>
                    <input {...register("email")} type="email" className="input-luxury" placeholder="your@email.com" />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                  </div>
                  {status === "unauthenticated" && (
                    <div className="sm:col-span-2">
                      <label className="text-xs uppercase tracking-wider text-gray-600 mb-1 block">Create a Password (Optional)</label>
                      <input {...register("password")} type="password" autoComplete="new-password" className="input-luxury" />
                      <p className="text-xs text-gray-400 mt-1">
                        Set a password to create an account, so you can log in later to see your orders. You can also track any order without an account.
                      </p>
                      {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                    </div>
                  )}
                </div>
              </div>

              {/* Shipping */}
              <div className="bg-white border border-gray-100 p-6 shadow-sm">
                <h2 className="font-semibold text-lg mb-4">Shipping Address</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs uppercase tracking-wider text-gray-600 mb-1 block">Address *</label>
                    <input {...register("address")} className="input-luxury" placeholder="Street address, house/flat number" />
                    {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-wider text-gray-600 mb-1 block">City *</label>
                    <input {...register("city")} className="input-luxury" placeholder="City" />
                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-wider text-gray-600 mb-1 block">Order Notes (Optional)</label>
                    <textarea {...register("notes")} rows={3} className="input-luxury resize-none" placeholder="Any special instructions..." />
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div className="bg-white border border-gray-100 p-6 shadow-sm">
                <h2 className="font-semibold text-lg mb-4">Payment Method</h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-4 p-4 border-2 border-gold-400 bg-gold-50">
                    <input type="hidden" value="STRIPE" {...register("paymentMethod")} />
                    <CreditCard size={20} className="text-gray-600" />
                    <div>
                      <p className="font-medium text-sm">Credit / Debit Card</p>
                      <p className="text-xs text-gray-500">Secure card payment via Stripe. We do not offer cash on delivery.</p>
                    </div>
                  </div>
                </div>
              </div>

              {!stripeEnabled && <p className="text-xs text-red-500 text-center">Card payments are temporarily unavailable. Please contact us to complete your order.</p>}
              <button type="submit" disabled={submitting || !stripeEnabled} className="w-full btn-gold flex items-center justify-center gap-2 py-4 disabled:opacity-50">
                {submitting ? <><Loader2 size={16} className="animate-spin" /> Processing...</> : <><Lock size={16} /> Proceed to Payment</>}
              </button>
            </form>
          )}
        </div>

        {/* Order Summary */}
        <div className="space-y-4">
          <div className="bg-white border border-gray-100 p-4 shadow-sm">
            <h3 className="font-semibold text-sm uppercase tracking-wider mb-4">Order Summary</h3>
            <div className="space-y-3 mb-4">
              {items.map((item) => (
                <div key={item.variantId} className="flex gap-3">
                  <div className="w-12 h-14 relative flex-shrink-0 bg-gray-50">
                    <Image src={item.image || "/placeholder.jpg"} alt={item.name} fill className="object-cover" />
                    <span className="absolute -top-1 -right-1 bg-gray-700 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center">{item.quantity}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-800">{item.name}</p>
                    <p className="text-[10px] text-gray-500">{item.size}</p>
                    <p className="text-xs font-semibold text-gold-500">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className={shipping === 0 ? "text-green-600" : ""}>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
              </div>
              <div className="border-t border-gray-100 pt-2 flex justify-between font-bold">
                <span>Total</span>
                <span className="text-gold-500">{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
