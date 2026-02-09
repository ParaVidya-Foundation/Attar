import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { Container } from "@/components/ui/Container";
import { CartPage } from "@/components/cart/CartPage";

export const metadata: Metadata = pageMetadata({
  title: "Cart",
  description: "Review your cart. Frontend-only demo cart stored in your browser.",
  path: "/cart",
  type: "website",
});

export default function CartRoute() {
  return (
    <Container>
      <CartPage />
    </Container>
  );
}
