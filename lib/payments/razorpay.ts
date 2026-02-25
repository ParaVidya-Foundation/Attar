/**
 * Razorpay server helpers — SERVER ONLY
 * Uses RAZORPAY_KEY_SECRET (never expose client-side)
 */
import Razorpay from "razorpay";
import crypto from "crypto";
import { serverWarn } from "@/lib/security/logger";
import { getServerEnv } from "@/lib/env";

export function getRazorpayClient(): Razorpay {
  if (!process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("Razorpay not configured");
  }
  const env = getServerEnv();
  const keyId = env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error("Missing RAZORPAY_KEY_SECRET or NEXT_PUBLIC_RAZORPAY_KEY_ID");
  }
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

export async function createRazorpayOrder(params: { amount: number; currency?: string; receipt?: string }) {
  const client = getRazorpayClient();
  const order = await client.orders.create({
    amount: params.amount,
    currency: params.currency ?? "INR",
    receipt: params.receipt ?? undefined,
  });
  return order;
}

export function verifyWebhookSignature(body: string, signature: string, secret?: string): boolean {
  const secretToUse = secret ?? process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secretToUse) {
    serverWarn("razorpay", "RAZORPAY_WEBHOOK_SECRET not set — cannot verify webhook");
    return false;
  }
  const expected = crypto.createHmac("sha256", secretToUse).update(body).digest("hex");
  return expected === signature;
}

export function verifyPaymentSignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return false;
  const body = `${params.orderId}|${params.paymentId}`;
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
  return expected === params.signature;
}
