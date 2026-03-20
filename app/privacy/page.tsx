import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { Container } from "@/components/ui/Container";

export const revalidate = 3600;

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description:
    "Anand Rasa Fragrance privacy policy — how we collect, use, store & protect your personal data when you shop attars, perfumes & agarbatti online.",
  path: "/privacy",
  type: "website",
});

export default function PrivacyPage() {
  return (
    <Container className="py-12 sm:py-16">
      <p className="text-xs font-semibold tracking-[0.26em] text-charcoal/70">LEGAL</p>
      <h1 className="mt-4 font-heading text-3xl tracking-tight text-ink sm:text-4xl">Privacy Policy</h1>
      <p className="mt-2 text-sm text-charcoal/60">Last updated: 15 March 2026</p>

      <div className="mt-8 space-y-8 text-sm leading-7 text-charcoal/85 sm:text-base">
        <section>
          <h2 className="font-heading text-xl text-ink">1. Who We Are</h2>
          <p className="mt-3">
            Anand Rasa Fragrance (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is an Indian luxury fragrance
            house based in Gurugram, Haryana. We craft and sell handcrafted attars, zodiac perfume oils,
            planet fragrances, agarbatti, and spiritual incense through our website{" "}
            <strong>anandrasafragnance.com</strong>.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl text-ink">2. Information We Collect</h2>
          <p className="mt-3">When you interact with our website, we may collect:</p>
          <ul className="mt-2 list-disc pl-6 space-y-1">
            <li>
              <strong>Account information</strong> — name, email address, phone number, and shipping
              address when you create an account or place an order.
            </li>
            <li>
              <strong>Order details</strong> — product selections, quantities, payment confirmation
              (we do not store full card details; payments are processed securely by Razorpay).
            </li>
            <li>
              <strong>Browsing data</strong> — pages visited, products viewed, and device/browser
              information collected via cookies and analytics tools (Vercel Analytics).
            </li>
            <li>
              <strong>Communication data</strong> — messages sent via contact forms, bulk enquiry
              forms, or WhatsApp.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-heading text-xl text-ink">3. How We Use Your Information</h2>
          <ul className="mt-3 list-disc pl-6 space-y-1">
            <li>Process and fulfil your orders, including shipping and delivery updates.</li>
            <li>Provide customer support and respond to enquiries.</li>
            <li>Send order confirmations and transactional communications.</li>
            <li>Improve our website, products, and fragrance recommendations.</li>
            <li>Prevent fraud and ensure website security.</li>
          </ul>
          <p className="mt-3">
            We do not sell or rent your personal information to third parties for marketing purposes.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl text-ink">4. Payment Security</h2>
          <p className="mt-3">
            All payments are processed securely through Razorpay. We do not store your credit/debit
            card details on our servers. Razorpay is PCI-DSS compliant and uses industry-standard
            encryption to protect your financial information.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl text-ink">5. Cookies & Analytics</h2>
          <p className="mt-3">
            We use essential cookies for cart functionality and session management. We use Vercel
            Analytics to understand how visitors use our site. These tools collect anonymised
            browsing data and do not personally identify you.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl text-ink">6. Data Storage & Retention</h2>
          <p className="mt-3">
            Your data is stored on secure servers provided by Supabase (database) and Vercel
            (hosting). We retain order data for tax and legal compliance purposes. You may request
            deletion of your account data by contacting us.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl text-ink">7. Your Rights</h2>
          <p className="mt-3">You have the right to:</p>
          <ul className="mt-2 list-disc pl-6 space-y-1">
            <li>Access the personal data we hold about you.</li>
            <li>Request correction of inaccurate information.</li>
            <li>Request deletion of your personal data (subject to legal obligations).</li>
            <li>Withdraw consent for marketing communications at any time.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-heading text-xl text-ink">8. Third-Party Services</h2>
          <p className="mt-3">We use the following third-party services:</p>
          <ul className="mt-2 list-disc pl-6 space-y-1">
            <li><strong>Razorpay</strong> — payment processing</li>
            <li><strong>Vercel</strong> — website hosting and analytics</li>
            <li><strong>Supabase</strong> — database and authentication</li>
            <li><strong>Cloudinary</strong> — image hosting</li>
          </ul>
          <p className="mt-2">Each service has its own privacy policy governing data handling.</p>
        </section>

        <section>
          <h2 className="font-heading text-xl text-ink">9. Children&apos;s Privacy</h2>
          <p className="mt-3">
            Our services are not directed to individuals under 18. We do not knowingly collect
            personal information from children.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl text-ink">10. Changes to This Policy</h2>
          <p className="mt-3">
            We may update this privacy policy from time to time. Changes will be posted on this page
            with an updated &quot;Last updated&quot; date.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl text-ink">11. Contact Us</h2>
          <p className="mt-3">
            For privacy-related questions or data requests, contact us at:{" "}
            <a href="mailto:anandrasafragnance@gmail.com" className="underline-offset-4 hover:underline">
              anandrasafragnance@gmail.com
            </a>{" "}
            or call{" "}
            <a href="tel:+919311336643" className="underline-offset-4 hover:underline">
              +91-93113-36643
            </a>
            .
          </p>
          <p className="mt-2">
            <Link href="/contact" className="underline-offset-4 hover:underline">
              Visit our Contact page →
            </Link>
          </p>
        </section>
      </div>
    </Container>
  );
}
