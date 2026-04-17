import Link from "next/link";
import { notFound } from "next/navigation";

import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function QrLandingPage({ params }: { params: Promise<{ data: string }> }) {
  const { data } = await params;

  const product = await db.product.findFirst({
    where: { qrCodeData: data },
    include: { organization: { select: { name: true, slug: true } } },
  });

  if (!product) notFound();

  return (
    <div className="min-h-screen bg-[#05070d] text-white">
      <div className="mx-auto max-w-3xl px-6 py-10 space-y-6">
        <div>
          <div className="text-xs text-white/60">Store: {product.organization.name}</div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">{product.name}</h1>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge>QR</Badge>
            <Badge>Price: {new Intl.NumberFormat("fr-DZ").format(product.priceDzd)} DA</Badge>
          </div>
          {product.description ? <p className="mt-3 text-white/70">{product.description}</p> : null}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tutorial video</CardTitle>
          </CardHeader>
          <CardContent>
            {product.tutorialVideoUrl ? (
              <div className="space-y-3">
                {product.tutorialVideoUrl.endsWith(".mp4") ? (
                  <video className="w-full rounded-xl border border-white/10" controls src={product.tutorialVideoUrl} />
                ) : (
                  <a className="text-blue-300 hover:text-blue-200" href={product.tutorialVideoUrl}>
                    Open video
                  </a>
                )}
                <div className="text-xs text-white/60">If the video doesn’t load, open it in a new tab.</div>
              </div>
            ) : (
              <div className="text-sm text-white/70">No tutorial video attached for this product.</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Manual</CardTitle>
          </CardHeader>
          <CardContent>
            {product.manualUrl ? (
              <a className="text-blue-300 hover:text-blue-200" href={product.manualUrl}>
                Download manual
              </a>
            ) : (
              <div className="text-sm text-white/70">No manual attached.</div>
            )}
          </CardContent>
        </Card>

        <div className="text-sm">
          <Link className="text-blue-300 hover:text-blue-200" href={`/store/${product.organization.slug}/products/${product.id}`}>
            View product page →
          </Link>
        </div>
      </div>
    </div>
  );
}
