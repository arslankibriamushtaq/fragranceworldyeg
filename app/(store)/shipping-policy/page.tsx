import type { Metadata } from "next";
import PolicyPage from "@/components/policy/PolicyPage";
import { FREE_SHIPPING_THRESHOLD, formatPrice } from "@/lib/utils";

export const metadata: Metadata = {};

export default function ShippingPolicyPage() {
  return (
    <PolicyPage
      title="Shipping Policy"
      updated="September 2026"
      sections={[
        { heading: "Where We Ship", body: <p>We ship Canada wide from Edmonton, Alberta.</p> },
        { heading: "Processing Time", body: <p>Orders are processed within 3–7 business days, excluding weekends and holidays. You will receive a confirmation email with tracking details once your order ships.</p> },
        { heading: "Delivery Time", body: <p>Standard shipping takes 2–8 business days after dispatch. Delivery times are estimates and are not guaranteed.</p> },
        { heading: "Free Shipping", body: <p>Standard shipping is free on orders over {formatPrice(FREE_SHIPPING_THRESHOLD)} (before taxes, after discounts).</p> },
        { heading: "Carriers", body: <p>Orders ship with Canpar, UPS, FedEx or other courier partners depending on your location.</p> },
        {
          heading: "Shipping Address",
          body: (
            <>
              <p>Please enter a complete and accurate address. We do not ship to P.O. Boxes. For apartments, include your unit and buzzer number.</p>
              <p>Missing or incorrect details may delay or cancel your order.</p>
            </>
          ),
        },
        { heading: "Returned or Refused Packages", body: <p>If a package comes back to us because of an incorrect address or refused delivery, the original shipping charge is non-refundable and the customer pays the cost to ship it again.</p> },
        { heading: "Lost or Stolen Packages", body: <p>Once the courier marks a package as delivered, we are not responsible for loss or theft. We can help you file a claim with the courier, but we cannot guarantee a replacement or refund.</p> },
        { heading: "Order Changes", body: <p>Orders cannot be changed or cancelled once processing has started.</p> },
      ]}
    />
  );
}
