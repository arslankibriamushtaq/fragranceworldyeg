import type { Metadata } from "next";
import PolicyPage from "@/components/policy/PolicyPage";

export const metadata: Metadata = {};

export default function ReturnPolicyPage() {
  return (
    <PolicyPage
      title="Return Policy"
      updated="September 2026"
      sections={[
        { heading: "No Exchanges", body: <p>All sales are final. <strong>We do not offer exchanges.</strong></p> },
        {
          heading: "Damaged Items Only",
          body: (
            <>
              <p>We accept returns only when a product arrives damaged. Report the damage within 7 days of delivery. The item must be unused and unopened, with all original packaging.</p>
              <p>Include clear photos and videos of the item, the packaging and the shipping label, taken on delivery and before you open the package.</p>
            </>
          ),
        },
        { heading: "How to Request a Return", body: <p>Contact us within 7 days of delivery with your order number and proof of purchase. We will issue a return authorization (RMA) number. We reject returns sent without an RMA number.</p> },
        {
          heading: "Non-Returnable Items",
          body: <p>Decants, samples, vials, testers, open-box items and any product that has been opened or used (more than 2–3 sprays) cannot be returned.</p>,
        },
        { heading: "Shipping Costs", body: <p>Shipping and handling charges are non-refundable. The customer pays return shipping. If your order shipped free, we deduct shipping both ways from your refund.</p> },
        { heading: "Refunds", body: <p>We inspect returned items within 3–4 business days. Approved refunds go back to your original payment card within 2–3 business days.</p> },
        { heading: "Failed Deliveries", body: <p>If an order comes back because of a failed delivery or an incorrect address, we charge a 20% restocking fee plus shipping both ways.</p> },
      ]}
    />
  );
}
