import Link from "next/link";
import Image from "next/image";
import { Instagram, Facebook, Youtube, Linkedin } from "lucide-react";
import { LOGO_PATH } from "@/lib/seo";

/* =========================
   DATA (Static — SEO friendly)
========================= */

const collections = [
  { name: "Planets Attar", href: "/collections/planets" },
  { name: "Zodiac Attar", href: "/collections/zodiac" },
  { name: "Stress Relief Attar", href: "/collections/stress" },
  { name: "Incense Sticks", href: "/collections/Incense" },
  { name: "Gift Sets", href: "/gift-sets" },
];

const supportLinks = [
  { name: "Contact Us", href: "/contact" },

  { name: "Shipping Policy", href: "/policies#shipping" },

  { name: "Bulk Enquiry", href: "/bulk-enquiry" },
  { name: "FAQ", href: "/faq" },
];

const companyLinks = [
  { name: "About Anand Rasa", href: "/about" },
  { name: "Our Story", href: "/our-story" },
  { name: "Blog", href: "/blog" },
  { name: "Privacy Policy", href: "/privacy" },
  { name: "Terms & Conditions", href: "/terms" },
];

const socialLinks = [
  { name: "Instagram", href: "https://www.instagram.com/anandrasafragnance", Icon: Instagram },
  { name: "Facebook", href: "https://www.facebook.com/anandrasafragnance", Icon: Facebook },
  { name: "YouTube", href: "https://www.youtube.com/@anandrasafragnance", Icon: Youtube },
  { name: "LinkedIn", href: "https://www.linkedin.com/company/anandrasafragnance", Icon: Linkedin },
];

const payments = [
  { name: "Visa", src: "/visa-icon.svg", width: 48, height: 28 },
  { name: "MasterCard", src: "/master-card-icon.svg", width: 48, height: 28 },
  { name: "UPI", src: "/upi-payment-icon.svg", width: 48, height: 28 },
  { name: "Razorpay", src: "/razorpay-icon.svg", width: 64, height: 28 },
];

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Anand Rasa",
  url: "https://anandrasafragnance.com",
  sameAs: socialLinks.map((s) => s.href),
};

/* =========================
   COMPONENT
========================= */

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white text-neutral-700">
      {/* SEO Structured Data */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />

      <div className="mx-auto max-w-7xl px-6 py-14 md:py-20">
        {/* ================= MAIN GRID ================= */}
        <section className="grid gap-12 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-5">
            <Link href="/" aria-label="Anand Rasa home">
              <Image
                src={LOGO_PATH}
                alt="Anand Rasa"
                width={300}
                height={80}
                className="h-14 w-auto object-contain md:h-16"
                priority={false}
              />
            </Link>

            <p className="max-w-xs text-sm leading-7 text-neutral-600">
              Luxury spiritual attars inspired by Vedic tradition.
            </p>

            <div className="space-y-1 text-sm text-neutral-500">
              <p>Anand Rasa Fragrance</p>
              <p>Gurugram, Haryana, India</p>
              <p>
                <a
                  href="mailto:hello@anandrasafragnance.com"
                  className="hover:text-neutral-900 transition-colors"
                >
                  hello@anandrasafragnance.com
                </a>
              </p>
              <p>
                <a href="tel:+919000000000" className="hover:text-neutral-900 transition-colors">
                  +91-90000-00000
                </a>
              </p>
            </div>
          </div>

          {/* Collections */}
          <nav aria-label="Collections" className="space-y-4">
            <p className="text-xs font-semibold tracking-[0.2em] text-neutral-500">COLLECTIONS</p>
            <ul className="space-y-2.5">
              {collections.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-neutral-600 transition-colors duration-200 hover:text-neutral-900"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Support */}
          <nav aria-label="Support" className="space-y-4">
            <p className="text-xs font-semibold tracking-[0.2em] text-neutral-500">SUPPORT</p>
            <ul className="space-y-2.5">
              {supportLinks.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-neutral-600 transition-colors duration-200 hover:text-neutral-900"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Company */}
          <nav aria-label="Company" className="space-y-4">
            <p className="text-xs font-semibold tracking-[0.2em] text-neutral-500">COMPANY</p>
            <ul className="space-y-2.5">
              {companyLinks.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-neutral-600 transition-colors duration-200 hover:text-neutral-900"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </section>

        {/* ================= SOCIAL + PAYMENTS ================= */}
        <section className="mt-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            {socialLinks.map(({ name, href, Icon }) => (
              <Link
                key={name}
                href={href}
                aria-label={name}
                className="flex h-9 w-9 items-center justify-center text-neutral-500 opacity-70 transition-all duration-200 hover:opacity-100 hover:text-neutral-900"
              >
                <Icon className="h-4 w-4" />
              </Link>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            {payments.map((p) => (
              <Image
                key={p.name}
                src={p.src}
                alt={p.name}
                width={p.width}
                height={p.height}
                loading="lazy"
                className="h-4 w-auto opacity-80 sm:h-5 md:h-6"
              />
            ))}
          </div>
        </section>

        {/* Divider */}
        <div className="mt-10 border-t border-neutral-200" />

        {/* ================= LARGE BRAND IMAGE (90%) ================= */}
        <section className="mt-10 flex flex-col items-center gap-4 text-center">
          <div className="w-full flex justify-center">
            <Image
              src="/Footer.webp"
              alt="Anand Rasa"
              width={1800}
              height={600}
              priority
              className="w-full h-auto object-contain"
            />
          </div>

          <p className="text-xs text-neutral-500">
            © {new Date().getFullYear()} Anand Rasa. All rights reserved.
          </p>
        </section>
      </div>
    </footer>
  );
}

export default Footer;
