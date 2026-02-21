import { createAdminClient } from "@/lib/supabase/admin";
import { assertAdminEnv } from "@/lib/admin/envCheck";

export async function getProductById(id: string) {
  try {
    assertAdminEnv();
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("[admin productQueries] getProductById Supabase error", { error, id });
      throw error;
    }
    if (!data) {
      console.error("[admin productQueries] getProductById no data", { id });
      return null;
    }
    return data;
  } catch (err) {
    console.error("[admin productQueries] getProductById failed", { error: err, id });
    throw err;
  }
}
