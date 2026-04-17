import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { demoProducts } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

export async function GET() {
  const products = await db.product.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { updatedAt: "desc" },
    take: 30,
    select: {
      id: true,
      name: true,
      description: true,
      priceDzd: true,
      images: true,
      organization: { select: { id: true, name: true, slug: true } },
      category: { select: { name: true } },
    },
  });

  if (products.length === 0) {
    return NextResponse.json(demoProducts, { headers: { "Cache-Control": "no-store" } });
  }

  const payload = products.map((p) => ({
    id: p.id,
    organization: p.organization,
    name: p.name,
    description: p.description ?? "",
    priceDzd: p.priceDzd,
    image: p.images[0] ?? null,
    category: p.category?.name ?? null,
  }));

  return NextResponse.json(payload, { headers: { "Cache-Control": "no-store" } });
}
