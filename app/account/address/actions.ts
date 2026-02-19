"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addAddress(formData: FormData) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("addresses").insert({
    user_id: user.id,
    label: (formData.get("label") as string) || null,
    line1: formData.get("line1") as string,
    line2: (formData.get("line2") as string) || null,
    city: formData.get("city") as string,
    state: (formData.get("state") as string) || null,
    postal_code: (formData.get("postal_code") as string) || null,
    phone: (formData.get("phone") as string) || null,
    is_default: formData.get("is_default") === "true",
  });

  if (error) return { error: error.message };

  revalidatePath("/account/address");
  return { success: true };
}

export async function updateAddress(formData: FormData) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const id = formData.get("id") as string;

  const { error } = await supabase
    .from("addresses")
    .update({
      label: (formData.get("label") as string) || null,
      line1: formData.get("line1") as string,
      line2: (formData.get("line2") as string) || null,
      city: formData.get("city") as string,
      state: (formData.get("state") as string) || null,
      postal_code: (formData.get("postal_code") as string) || null,
      phone: (formData.get("phone") as string) || null,
      is_default: formData.get("is_default") === "true",
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/account/address");
  return { success: true };
}

export async function deleteAddress(id: string) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("addresses")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/account/address");
  return { success: true };
}
