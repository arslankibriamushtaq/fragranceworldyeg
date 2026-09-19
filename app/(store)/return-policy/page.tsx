import type { Metadata } from "next";
import Link from "next/link";
import PolicyPage from "@/components/policy/PolicyPage";
import { CONTACT, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {};

// Points customers at the store email once it's set in lib/site.ts, otherwise at the contact page.
function ContactUs() {
  return CONTACT.email ? (
    <a href={`mailto:${CONTACT.email}`} className="text-gold-600 underline">{CONTACT.email}</a>
  ) : (
    <Link href="/contact" className="text-gold-600 underline">our contact page</Link>
  );
}

export default function ReturnPolicyPage() {
  return (
    <PolicyPage
      title="Return & Refund Policy"
      updated="September 2026"
      sections={[
        {
          heading: "Our Commitment",
          body: (
            <p>
              At {SITE_NAME}, we are committed to providing 100% authentic products to our customers. While we strive for the highest quality in
              our offerings, we understand that issues can occasionally arise. Below is our policy regarding returns and refunds.
            </p>
          ),
        },
        {
          heading: "Return Policy",
          body: (
            <p>
              We do not accept returns unless the product is damaged upon delivery. For eligible returns due to damage, you must contact us within
              seven (7) days of receiving the product.
            </p>
          ),
        },
        {
          heading: "Eligibility for Returns",
          body: (
            <>
              <p>To qualify for a return:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>The item must be reported as damaged within 7 days of delivery.</li>
                <li>The item must be unused, unopened, and in the same condition as received.</li>
                <li>All original packaging, accessories, and paperwork must be included.</li>
                <li>Proof of purchase (receipt) is required.</li>
              </ul>
            </>
          ),
        },
        {
          heading: "How to Initiate a Return",
          body: (
            <p>
              If your item meets the eligibility criteria, please contact us at <ContactUs /> within 7 days of receiving the product. We will
              provide further instructions. Returns must be arranged through customer service, and an RMA (Return Merchandise Authorization)
              number must be issued for the process to proceed.
            </p>
          ),
        },
        {
          heading: "Shipping Costs",
          body: (
            <>
              <p>For all eligible returns, the customer will be responsible for two-way shipping charges:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>The cost of return shipping from the customer to {SITE_NAME}.</li>
                <li>The cost of shipping from {SITE_NAME} to the customer.</li>
              </ul>
              <p>If the original order qualified for free shipping, two-way shipping costs will be deducted from the refund.</p>
            </>
          ),
        },
        {
          heading: "Refund Process",
          body: (
            <>
              <p>Once we receive the returned item:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>It will undergo an inspection within 3–4 business days to confirm eligibility.</li>
                <li>If approved, a refund will be issued, excluding two-way shipping charges.</li>
                <li>Refunds will be processed to your original payment method within 2–3 business days after inspection.</li>
              </ul>
            </>
          ),
        },
        {
          heading: "Non-Returnable Items",
          body: (
            <>
              <p>We do not accept returns under the following circumstances:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Products not reported as damaged within 7 days of delivery.</li>
                <li>Testers, preowned bottles, open-box bottles, samples, or vials.</li>
                <li>Niche fragrances unless unopened, completely sealed, and unused.</li>
                <li>Products opened or heavily used (more than 2–3 sprays).</li>
              </ul>
            </>
          ),
        },
        {
          heading: "Damaged Products",
          body: (
            <p>
              If your item is damaged during transit, please contact us within 48 hours of delivery at <ContactUs />. Provide clear images of the
              damage and the packaging for assessment. We will arrange for a replacement or refund once the return is processed and approved.
            </p>
          ),
        },
        {
          heading: "Verification of Damage Claims",
          body: (
            <>
              <p>{SITE_NAME} takes fraud prevention seriously. All damage claims are carefully reviewed to protect both the customer and our business.</p>
              <p>For any report of damage, customers must provide:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Clear photos and videos of the item, packaging, and shipping label.</li>
                <li>Photos/videos that show the condition of the product before it is opened and immediately upon delivery.</li>
              </ul>
              <p>
                If the proof of delivery, courier images, or delivery confirmation show the package was delivered in undamaged condition, but the
                customer reports severe internal damage inconsistent with the external condition, {SITE_NAME} reserves the right to:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Deny the refund or replacement,</li>
                <li>Request additional photos or video evidence,</li>
                <li>Require the customer to return the item for inspection before any decision is made.</li>
              </ul>
              <p>Damage that appears to have occurred after delivery, including tampering, improper handling, or misuse, is not eligible for refund or return.</p>
            </>
          ),
        },
        {
          heading: "Tampering or Fraudulent Claims",
          body: (
            <>
              <p>
                If any submitted photos appear altered, inconsistent with courier documentation, or do not match the condition shown in the
                delivery proof, the claim will be immediately rejected.
              </p>
              <p>Attempting to submit fraudulent damage claims may result in denial of future purchases.</p>
            </>
          ),
        },
        {
          heading: "Important Notes",
          body: (
            <ul className="list-disc pl-5 space-y-1">
              <li>All shipping and handling charges are non-refundable.</li>
              <li>Returns without prior authorization (RMA number) will not be accepted.</li>
              <li>Any item returned by the courier after failed delivery attempts will be refunded minus shipping costs and a 20% restocking fee.</li>
              <li>Any item for which an incorrect or undeliverable billing address was provided will incur a 20% restocking fee and two-way shipping charges.</li>
            </ul>
          ),
        },
        {
          heading: "Questions?",
          body: (
            <p>
              At {SITE_NAME}, we value your satisfaction and strive to ensure a seamless shopping experience. If you have any questions or
              concerns, please contact us at <ContactUs />.
            </p>
          ),
        },
      ]}
    />
  );
}
