import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Refund Policy",
  description: "Refund and return policy for Anand Ras orders.",
  path: "/refund",
});

export default function RefundPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-heading text-3xl tracking-tight text-neutral-900">Refund Policy</h1>
      <p className="mt-4 text-sm text-neutral-600">
        Refund and return eligibility is reviewed per order condition and support verification.
      </p>
      <p className="mt-2 text-sm text-neutral-600">
        For help with a recent order, contact support with your order ID and payment reference.
      </p>
    </main>
  );
}
