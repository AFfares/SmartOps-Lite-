import Link from "next/link";

import { db } from "@/lib/db";
import { demoOrganizations, demoProducts } from "@/lib/demo-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type StoreOrg = { id: string; name: string; slug: string };
type StoreProduct = {
  id: string;
  name: string;
  description: string | null;
  priceDzd: number;
  organization: { name: string; slug: string };
};

export default async function StoreIndexPage() {
  let orgs: StoreOrg[] = [];
  let products: StoreProduct[] = [];
  try {
    [orgs, products] = await Promise.all([
      db.organization.findMany({
        orderBy: { name: "asc" },
        select: { id: true, name: true, slug: true },
      }),
      db.product.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { updatedAt: "desc" },
        take: 12,
        select: {
          id: true,
          name: true,
          description: true,
          priceDzd: true,
          organization: { select: { name: true, slug: true } },
        },
      }),
    ]);
  } catch {
    orgs = [];
    products = [];
  }

  const orgsToShow = orgs.length > 0 ? orgs : demoOrganizations;
  const productsToShow = products.length > 0
    ? products
    : demoProducts.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        priceDzd: p.priceDzd,
        organization: { name: p.organization.name, slug: p.organization.slug },
      }));

  return (
    <div className="min-h-screen bg-[#05070d] text-white">
      <div className="mx-auto max-w-6xl px-6 py-12 space-y-8">
        <header className="flex items-center justify-between">
          <Link className="text-sm font-semibold tracking-tight" href="/">
            SmartOps Lite
          </Link>
          <nav className="flex items-center gap-3 text-sm">
            <Link className="text-white/70 hover:text-white" href="/qr/scan">
              Scan QR
            </Link>
            <Link className="rounded-xl bg-white/10 px-3 py-2 hover:bg-white/15" href="/sign-in">
              Sign in
            </Link>
          </nav>
        </header>

        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Stores</h1>
          <p className="mt-2 text-white/70">Choose a company store to browse products, manuals, and tutorials.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {orgsToShow.map((o) => (
            <Card key={o.id}>
              <CardHeader>
                <CardTitle>{o.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-white/70">Slug: {o.slug}</div>
                <Link className="mt-4 inline-block text-sm text-blue-300 hover:text-blue-200" href={`/store/${o.slug}`}>
                  Open store →
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div>
          <h2 className="text-xl font-semibold tracking-tight">Latest products</h2>
          <p className="mt-1 text-sm text-white/60">Recently updated across all stores.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {productsToShow.map((p) => (
            <Card key={p.id}>
              <CardHeader>
                <CardTitle>{p.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-white/60">{p.organization.name}</div>
                <div className="mt-2 text-sm text-white/70">{p.description ?? ""}</div>
                <div className="mt-3 text-sm font-semibold">{new Intl.NumberFormat("fr-DZ").format(p.priceDzd)} DA</div>
                <Link className="mt-4 inline-block text-sm text-blue-300 hover:text-blue-200" href={`/store/${p.organization.slug}/products/${p.id}`}>
                  View →
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
