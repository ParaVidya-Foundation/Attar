/**
 * GET /api/admin/orders/[id] — Get single order details for admin
 */
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

async function checkAdmin() {
  const { createServerClient } = await import("@/lib/supabase/server");
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    throw new Error("Unauthorized");
  }

  return user;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await checkAdmin();
    const { id } = await params;

    const admin = createAdminClient();

    // Get order with customer details
    const { data: order, error: orderError } = await admin
      .from("orders")
      .select(
        "id,user_id,name,email,phone,status,total_amount,currency,razorpay_order_id,razorpay_payment_id,created_at,updated_at"
      )
      .eq("id", id)
      .is("deleted_at", null)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Get order items
    const { data: items } = await admin
      .from("order_items")
      .select("product_id,size_ml,qty,unit_price")
      .eq("order_id", id);

    // Get product names
    const productIds = items?.map((i) => i.product_id) ?? [];
    const { data: products } = await admin
      .from("products")
      .select("id,name")
      .in("id", productIds);

    const productMap = new Map(products?.map((p) => [p.id, p.name]) ?? []);

    // Get payment details
    const { data: payment } = await admin
      .from("payments")
      .select("id,razorpay_payment_id,status,amount,currency,created_at")
      .eq("order_id", id)
      .single();

    // Get customer email if user_id exists
    let customerEmail = order.email;
    if (order.user_id && !customerEmail) {
      const { data: profile } = await admin
        .from("profiles")
        .select("email")
        .eq("id", order.user_id)
        .single();
      customerEmail = profile?.email ?? null;
    }

    return NextResponse.json({
      order: {
        ...order,
        customerEmail,
      },
      items: items?.map((item) => ({
        ...item,
        productName: productMap.get(item.product_id) ?? "Unknown",
      })),
      payment,
    });
  } catch (err) {
    if (err instanceof Error && err.message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[ADMIN ORDER DETAIL API ERROR]", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
