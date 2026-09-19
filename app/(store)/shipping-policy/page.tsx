import type { Metadata } from "next";
import PolicyPage from "@/components/policy/PolicyPage";
import { SITE_NAME } from "@/lib/site";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/utils";

export const metadata: Metadata = {};

const List = ({ items }: { items: string[] }) => (
  <ul className="list-disc pl-5 space-y-1">
    {items.map((item) => <li key={item}>{item}</li>)}
  </ul>
);

export default function ShippingPolicyPage() {
  return (
    <PolicyPage
      title="Shipping Policy"
      updated="September 2026"
      sections={[
        {
          heading: "Order Processing Time",
          body: (
            <>
              <p>All orders are processed within 3–7 business days (excluding weekends and holidays). During high-volume periods, processing times may be extended.</p>
              <p>Once your order has been shipped, a confirmation email with tracking details will be provided.</p>
            </>
          ),
        },
        {
          heading: "Shipping Rates & Delivery Times",
          body: (
            <>
              <p>Shipping rates are calculated at checkout based on destination and selected shipping method.</p>
              <List items={["Standard Shipping: 2–8 business days after dispatch"]} />
              <p>Delivery timelines are estimates only and are not guaranteed. Delays caused by couriers, weather conditions, or peak seasons are outside of our control.</p>
            </>
          ),
        },
        {
          heading: "Free Shipping",
          body: <p>Free standard shipping is available on orders over ${FREE_SHIPPING_THRESHOLD} CAD (before taxes and after discounts).</p>,
        },
        {
          heading: "Shipping Carriers",
          body: <p>Orders are shipped via Canpar, UPS, FedEx, or other courier partners depending on location and service availability.</p>,
        },
        {
          heading: "Shipping Address Requirements",
          body: (
            <>
              <p>Customers are fully responsible for providing a complete and accurate shipping address at checkout.</p>
              <List
                items={[
                  "We do not ship to P.O. Box addresses under any circumstances.",
                  "Orders containing P.O. Box addresses will not be processed until a valid address is provided.",
                  "Apartment deliveries must include buzzer/unit number.",
                  "Missing unit numbers, incorrect addresses, or incomplete details may result in delays or cancellation.",
                ]}
              />
              <p>{SITE_NAME} is not responsible for orders shipped to incorrectly provided addresses.</p>
            </>
          ),
        },
        {
          heading: "Failed Delivery / Returned Packages",
          body: (
            <>
              <p>If a package is returned due to:</p>
              <List items={["Incorrect or incomplete address", "Failure to accept delivery", "Failure to pick up from courier location"]} />
              <p>The following will apply:</p>
              <List
                items={[
                  "Original shipping charges are non-refundable",
                  "A restocking fee may be applied",
                  "Re-shipping costs are the responsibility of the customer",
                ]}
              />
            </>
          ),
        },
        {
          heading: "Lost, Stolen, or Delivered Packages",
          body: (
            <>
              <p>Once an order has been shipped and marked as delivered by the courier, {SITE_NAME} is not liable for lost or stolen packages.</p>
              <p>We strongly recommend:</p>
              <List items={["Shipping to a secure location", "Monitoring tracking updates closely"]} />
              <p>Any delivery disputes must be handled directly with the courier. We may assist with filing a claim but do not guarantee replacements or refunds for such cases.</p>
            </>
          ),
        },
        {
          heading: "Order Changes & Cancellations",
          body: <p>Once an order is placed, it cannot be modified or cancelled after processing.</p>,
        },
        {
          heading: "Important Notice",
          body: <p>By placing an order with {SITE_NAME}, you agree to all terms outlined in this Shipping Policy.</p>,
        },
      ]}
    />
  );
}
