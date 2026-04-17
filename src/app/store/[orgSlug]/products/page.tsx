import Link from "next/link";

import { db } from "@/lib/db";
import { demoProducts } from "@/lib/demo-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ProductsPage({ params }: { params: Promise<{ orgSlug: string }> }) {
  const { orgSlug } = await params;
  const org = await db.organization.findUnique({ where: { slug: orgSlug }, select: { id: true } });
  const products = org
    ? await db.product.findMany({ where: { organizationId: org.id, status: "PUBLISHED" }, orderBy: { name: "asc" } })
    : [];

  const productsToShow = products.length > 0
    ? products
    : demoProducts
        .filter((p) => p.organization.slug === orgSlug)
        .map((p) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          priceDzd: p.priceDzd,
        }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
        <p className="mt-1 text-sm text-white/60">Browse the catalog and request quotes/invoices.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {productsToShow.map((p) => (
          <Card key={p.id}>
            <CardHeader>
              <CardTitle>{p.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-white/70">{p.description ?? ""}</div>
              <div className="mt-3 text-sm font-semibold">{new Intl.NumberFormat("fr-DZ").format(p.priceDzd)} DA</div>
              <Link className="mt-4 inline-block text-sm text-blue-300 hover:text-blue-200" href={`/store/${orgSlug}/products/${p.id}`}>
                Open →
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
