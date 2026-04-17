import Link from "next/link";

import { db } from "@/lib/db";
import { demoOrganizations, demoProducts } from "@/lib/demo-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function StoreHomePage({ params }: { params: Promise<{ orgSlug: string }> }) {
  const { orgSlug } = await params;
  const org = await db.organization.findUnique({ where: { slug: orgSlug }, select: { id: true, name: true } });
  const products = org
    ? await db.product.findMany({
        where: { organizationId: org.id, status: "PUBLISHED" },
        orderBy: { updatedAt: "desc" },
        take: 6,
      })
    : [];

  const demoOrg = demoOrganizations.find((o) => o.slug === orgSlug) ?? null;
  const title = org?.name ?? demoOrg?.name ?? "Store";
  const productsToShow = products.length > 0
    ? products
    : demoProducts
        .filter((p) => p.organization.slug === orgSlug)
        .slice(0, 6)
        .map((p) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          priceDzd: p.priceDzd,
        }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 text-white/70">Smart digital catalog with manuals, tutorials, and AI recommendations.</p>
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
              <div className="mt-4">
                <Button variant="secondary" size="sm" asChild>
                  <Link href={`/store/${orgSlug}/products/${p.id}`}>View</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>AI Assistant</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-white/70">
            Ask: “Which product fits my factory?” or “Difference between A and B?”
          </div>
          <div className="mt-4">
            <Button variant="secondary" size="sm" asChild>
              <Link href={`/store/${orgSlug}/ai`}>Open AI assistant</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
