import { NextResponse } from "next/server";
import { mapToCardProduct } from "@/lib/productMapper";
import { getCartUpsellRecommendations } from "@/lib/recommendations";

function parseExcludeIds(searchParams: URLSearchParams) {
  return searchParams
    .getAll("exclude")
    .flatMap((value) => value.split(","))
    .map((value) => value.trim())
    .filter(Boolean);
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId")?.trim();

  if (!productId) {
    return NextResponse.json({ error: "productId is required" }, { status: 400 });
  }

  const excludeIds = parseExcludeIds(searchParams);
  const recommendations = await getCartUpsellRecommendations(productId, excludeIds, 3);

  return NextResponse.json(
    {
      products: recommendations.map((product) => mapToCardProduct(product)),
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "private, max-age=120, stale-while-revalidate=300",
      },
    },
  );
}
