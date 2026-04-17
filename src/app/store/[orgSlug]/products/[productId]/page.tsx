import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { buyNow } from "./actions";
import { ProductMedia } from "./product-media";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ orgSlug: string; productId: string }>;
}) {
  const { orgSlug, productId } = await params;
  const org = await db.organization.findUnique({ where: { slug: orgSlug }, select: { id: true } });
  if (!org) notFound();

  const product = await db.product.findFirst({
    where: { id: productId, organizationId: org.id, status: "PUBLISHED" },
  });

  if (!product) notFound();

  const mediaImages = (product.images ?? []).filter((src) => src !== "/we/p.jpg" && src !== "we/p.jpg");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">{product.name}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Badge>Availability: {product.quantity > 0 ? "In stock" : "Out of stock"}</Badge>
          <Badge>Price: {new Intl.NumberFormat("fr-DZ").format(product.priceDzd)} DA</Badge>
        </div>
        {product.description ? <p className="mt-3 text-white/70">{product.description}</p> : null}
      </div>

      <ProductMedia title={product.name} images={mediaImages} tutorialVideoUrl={product.tutorialVideoUrl} />

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Technical specifications Section */}
        <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm lg:col-span-2">
          <h3 className="mb-4 text-lg font-semibold text-foreground">Technical specifications</h3>

          <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-border bg-muted/30 md:aspect-video">
            <Image
              src="/we/p.jpg"
              alt="Technical Specifications"
              fill
              className="object-contain p-2"
              priority
              unoptimized
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <form action={buyNow}>
              <input type="hidden" name="orgSlug" value={orgSlug} />
              <input type="hidden" name="productId" value={product.id} />
              <input type="hidden" name="quantity" value="1" />
              <Button className="w-full" type="submit" disabled={product.quantity <= 0}>
                Buy now
              </Button>
            </form>
            <Button variant="secondary" className="w-full" asChild>
              <Link href={`/store/${orgSlug}/support?product=${product.id}`}>Request quote</Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href={`/store/${orgSlug}/support?invoice=${product.id}`}>Request official invoice</Link>
            </Button>
            <Button variant="secondary" className="w-full" asChild>
              <Link href={`/store/${orgSlug}/ai?product=${product.id}`}>Ask AI</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manuals & tutorials</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-white/70">
            PDF manual and video tutorial URLs can be attached from the company catalog manager.
          </div>
          <div className="mt-3 space-y-2 text-sm">
            <div>
              Manual: {product.manualUrl ? <a className="text-blue-300" href={product.manualUrl}>Download</a> : "—"}
            </div>
            <div>
              Video: {product.tutorialVideoUrl ? <a className="text-blue-300" href={product.tutorialVideoUrl}>Open</a> : "—"}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
