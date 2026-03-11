/**
 * Razorpay server helpers — SERVER ONLY
 * Uses RAZORPAY_KEY_SECRET (never expose client-side)
 */
import Razorpay from "razorpay";
import crypto from "crypto";
import { serverError, serverWarn } from "@/lib/security/logger";
import { getServerEnv } from "@/lib/env";

export function getRazorpayClient(): Razorpay {
  const env = getServerEnv();
  const keyId = env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error("Missing RAZORPAY_KEY_SECRET or NEXT_PUBLIC_RAZORPAY_KEY_ID");
  }
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

export async function createRazorpayOrder(params: { amount: number; currency?: string; receipt?: string }) {
  if (!Number.isInteger(params.amount) || params.amount <= 0) {
    throw new Error(`Razorpay order amount must be a positive integer paise value. Received: ${params.amount}`);
  }
  const currency = (params.currency ?? "INR").toUpperCase();
  if (currency !== "INR") {
    throw new Error(`Unsupported Razorpay currency: ${currency}. Only INR is allowed.`);
  }

  const client = getRazorpayClient();
  try {
    serverWarn(
      "razorpay",
      `Creating order: amount=${params.amount} currency=${currency} receipt=${params.receipt ?? "none"}`,
    );
    const order = await client.orders.create({
      amount: params.amount,
      currency,
      receipt: params.receipt ?? undefined,
    });
    serverWarn("razorpay", `Order created: id=${order.id} amount=${order.amount} currency=${order.currency}`);
    return order;
  } catch (error) {
    const message =
      error && typeof error === "object" && "error" in error
        ? JSON.stringify((error as { error: unknown }).error)
        : error;
    serverError("razorpay create order", message);
    throw error;
  }
}

export function verifyWebhookSignature(body: string, signature: string, secret?: string): boolean {
  const secretToUse = secret ?? getServerEnv().RAZORPAY_WEBHOOK_SECRET;
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
  const secret = getServerEnv().RAZORPAY_KEY_SECRET;
  if (!secret) return false;
  const body = `${params.orderId}|${params.paymentId}`;
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
  const expectedBuf = Buffer.from(expected, "utf8");
  const actualBuf = Buffer.from(params.signature, "utf8");
  return expectedBuf.length === actualBuf.length && crypto.timingSafeEqual(expectedBuf, actualBuf);
}
