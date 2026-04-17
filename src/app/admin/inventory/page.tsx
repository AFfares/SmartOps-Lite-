import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";

export default async function InventoryPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/sign-in");
  if (session.user.role !== "COMPANY_ADMIN" || !session.user.organizationId) redirect("/");

  const items = await db.inventoryItem.findMany({
    where: { organizationId: session.user.organizationId },
    orderBy: { updatedAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Inventory</h1>
        <p className="mt-1 text-sm text-white/60">Real-time tracking, stock movement, and shortage alerts.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <THead>
                <TR>
                  <TH>SKU</TH>
                  <TH>Name</TH>
                  <TH>Type</TH>
                  <TH>Qty</TH>
                  <TH>Location</TH>
                </TR>
              </THead>
              <TBody>
                {items.map((i) => (
                  <TR key={i.id}>
                    <TD className="text-white/80">{i.sku}</TD>
                    <TD>{i.name}</TD>
                    <TD>
                      <Badge>{i.type.replaceAll("_", " ")}</Badge>
                    </TD>
                    <TD>
                      {i.quantity}
                      {typeof i.minQuantity === "number" && i.quantity < i.minQuantity ? (
                        <Badge className="ml-2 border-amber-500/30 bg-amber-500/10 text-amber-200">LOW</Badge>
                      ) : null}
                    </TD>
                    <TD className="text-white/70">{i.location ?? "—"}</TD>
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
