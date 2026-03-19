/**
 * Admin product queries — delegates to the service layer.
 */
import { productsService } from "@/lib/admin/services";

export type { ProductWithVariants } from "@/lib/admin/services/products.service";

export async function getProductById(id: string) {
  const result = await productsService.getProductById(id);
  if (!result.ok) throw new Error(result.error);
  return result.data;
}
