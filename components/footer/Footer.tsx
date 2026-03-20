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
  { name: "Nakshatra Attar", href: "/collections/nakshatra" },
  { name: "Chakra Attar", href: "/collections/Chakra-attar" },
  { name: "Stress Relief Attar", href: "/collections/stress" },
  { name: "Love Attar", href: "/collections/Love-attar" },
  { name: "Incense Sticks", href: "/collections/Incense" },
  { name: "Gift Sets", href: "/gift-sets" },
];

const supportLinks = [
  { name: "Contact Us", href: "/contact" },
  { name: "Shipping Policy", href: "/policies#shipping" },
  { name: "Bulk Enquiry", href: "/bulk-enquiry" },
  { name: "FAQ", href: "/faq" },
  { name: "Astro Fragrance Finder", href: "/find-fragrance" },
];

const companyLinks = [
  { name: "About Anand Rasa", href: "/about" },
  { name: "Blog", href: "/blog" },
  { name: "Privacy Policy", href: "/privacy" },
  { name: "Terms & Conditions", href: "/terms" },
  { name: "Refund Policy", href: "/policies#returns" },
];

const socialLinks = [
  { name: "Instagram", href: "https://www.instagram.com/anand__rasa/", Icon: Instagram },
  {
    name: "Facebook",
    href: "https://www.facebook.com/profile.php?id=61584373649018",
    Icon: Facebook,
  },
  { name: "YouTube", href: "https://www.youtube.com/@anandrasafragnance", Icon: Youtube },
  // LinkedIn handle to be updated later when available
  { name: "LinkedIn", href: "https://www.linkedin.com", Icon: Linkedin },
];

const payments = [
  { name: "Visa", src: "/Footer/visa-icon.svg", width: 48, height: 28 },
  { name: "MasterCard", src: "/Footer/master-card-icon.svg", width: 48, height: 28 },
  { name: "UPI", src: "/Footer/upi-payment-icon.svg", width: 48, height: 28 },
  { name: "Razorpay", src: "/Footer/razorpay-icon.svg", width: 64, height: 28 },
];

/* =========================
   COMPONENT
========================= */

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white text-neutral-700">

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
                  href="mailto:anandrasafragnance@gmail.com"
                  className="hover:text-neutral-900 transition-colors"
                >
                  anandrasafragnance@gmail.com
                </a>
              </p>
              <p>
                <a href="tel:+919311336643" className="hover:text-neutral-900 transition-colors">
                  +91-93113-36643
                </a>
              </p>
              <p>
                <a
                  href="https://wa.me/919311336643"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-neutral-900 transition-colors"
                >
                  WhatsApp: +91-93113-36643
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
              src="/Footer/Footer.webp"
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
