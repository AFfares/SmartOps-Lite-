import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";

export default async function ProductionPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/sign-in");
  if (session.user.role !== "COMPANY_ADMIN" || !session.user.organizationId) redirect("/");

  const items = await db.productionOrder.findMany({
    where: { organizationId: session.user.organizationId },
    orderBy: { updatedAt: "desc" },
    take: 20,
    include: { issues: true },
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Production</h1>
        <p className="mt-1 text-sm text-white/60">Track stages, delays, bottlenecks, and machine/power issues.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active production orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <THead>
                <TR>
                  <TH>Order</TH>
                  <TH>Status</TH>
                  <TH>Qty total</TH>
                  <TH>Progress</TH>
                  <TH>Issues</TH>
                </TR>
              </THead>
              <TBody>
                {items.map((o) => {
                  const done = o.deliveredQty;
                  const pct = o.quantityTotal ? Math.round((done / o.quantityTotal) * 100) : 0;
                  return (
                    <TR key={o.id}>
                      <TD className="text-white/80">{o.orderId ?? o.id.slice(0, 8)}</TD>
                      <TD>
                        <Badge>{o.status.replaceAll("_", " ")}</Badge>
                        {o.isDelayed ? <Badge className="ml-2 border-red-500/30 bg-red-500/10 text-red-200">DELAYED</Badge> : null}
                      </TD>
                      <TD>{o.quantityTotal}</TD>
                      <TD>{pct}%</TD>
                      <TD>{o.issues.length}</TD>
                    </TR>
                  );
                })}
              </TBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Stage example</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-white/70">100 units: 40 completed, 30 packaging, 30 in progress.</div>
        </CardContent>
      </Card>
    </div>
  );
}
