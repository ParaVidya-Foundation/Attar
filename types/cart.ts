export type CartItem = {
  id: string;
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
