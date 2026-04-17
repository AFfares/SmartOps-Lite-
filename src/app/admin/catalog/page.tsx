import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

import { createDraftProduct, publishProduct } from "./actions";
import { MediaUploader } from "./media-uploader";

export default async function CatalogPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/sign-in");
  if (session.user.role !== "COMPANY_ADMIN" || !session.user.organizationId) redirect("/");

  const products = await db.product.findMany({
    where: { organizationId: session.user.organizationId },
    orderBy: { updatedAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Product Catalog</h1>
        <p className="mt-1 text-sm text-white/60">Create drafts, publish products, and attach images/manuals/videos.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add product</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createDraftProduct} className="grid gap-3 md:grid-cols-4">
            <input
              className="md:col-span-2 rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm"
              name="name"
              placeholder="Product name"
              required
            />
            <input
              className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm"
              name="priceDzd"
              placeholder="Price (DA)"
              type="number"
              min={0}
              required
            />
            <div className="flex gap-2">
              <input
                className="flex-1 rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm"
                name="quantity"
                placeholder="Qty"
                type="number"
                min={0}
                required
              />
              <Button type="submit" size="sm">Save draft</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <THead>
                <TR>
                  <TH>Name</TH>
                  <TH>Status</TH>
                  <TH>Price</TH>
                  <TH>Qty</TH>
                  <TH>Media</TH>
                  <TH>Actions</TH>
                </TR>
              </THead>
              <TBody>
                {products.map((p) => (
                  <TR key={p.id}>
                    <TD className="text-white/80">{p.name}</TD>
                    <TD>
                      <Badge>{p.status}</Badge>
                    </TD>
                    <TD>{new Intl.NumberFormat("fr-DZ").format(p.priceDzd)} DA</TD>
                    <TD>{p.quantity}</TD>
                    <TD>
                      <MediaUploader productId={p.id} imagesCount={p.images.length} />
                    </TD>
                    <TD>
                      {p.status === "DRAFT" ? (
                        <form action={publishProduct}>
                          <input type="hidden" name="productId" value={p.id} />
                          <Button variant="secondary" size="sm" type="submit">
                            Publish
                          </Button>
                        </form>
                      ) : (
                        <span className="text-sm text-white/60">Published</span>
                      )}
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
