/**
 * Razorpay server helpers — SERVER ONLY
 * Uses RAZORPAY_KEY_SECRET (never expose client-side)
 */
import Razorpay from "razorpay";

const KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

export function getRazorpayClient(): Razorpay {
  if (!KEY_ID || !KEY_SECRET) {
    throw new Error("Missing RAZORPAY_KEY_SECRET or NEXT_PUBLIC_RAZORPAY_KEY_ID");
  }
  return new Razorpay({ key_id: KEY_ID, key_secret: KEY_SECRET });
}

/**
 * Create a Razorpay order (in paise for INR)
 */
export async function createRazorpayOrder(params: {
  amount: number; // in paise (INR * 100)
  currency?: string;
  receipt?: string;
}) {
  const client = getRazorpayClient();
  const order = await client.orders.create({
    amount: params.amount,
    currency: params.currency ?? "INR",
    receipt: params.receipt ?? undefined,
  });
  return order;
}

/**
 * Verify Razorpay webhook signature
 * TODO: Implement in razorpay-webhook Edge Function
 */
export function verifyWebhookSignature(body: string, signature: string, secret?: string): boolean {
  const secretToUse = secret ?? WEBHOOK_SECRET;
  if (!secretToUse) {
    console.warn("RAZORPAY_WEBHOOK_SECRET not set — cannot verify webhook");
    return false;
  }
  const crypto = require("crypto");
  const expected = crypto.createHmac("sha256", secretToUse).update(body).digest("hex");
  return expected === signature;
}
