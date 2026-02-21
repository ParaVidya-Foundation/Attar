export type CartItem = {
  id: string;
  variantId?: string;
  slug?: string;
  title: string;
  price: number;
  originalPrice?: number;
  image: string;
  quantity: number;
};

/** Checkout-ready payload shape for Razorpay / backend */
export type CheckoutPayload = {
  items: { product_id: string; quantity: number; price: number }[];
  total: number;
};

/** Guest checkout payload sent to /api/orders/create */
export type OrderPayload = {
  name: string;
  email: string;
  phone: string;
  variant_id: string;
  quantity: number;
};
