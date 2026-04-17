import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";

export default async function CustomerOrdersPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/sign-in");
  if (session.user.role !== "CUSTOMER") redirect("/");

  const orders = await db.order.findMany({
    where: { customerId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      organization: { select: { name: true } },
      items: { include: { product: { select: { name: true } } } },
    },
    take: 50,
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">My Orders</h1>
        <p className="mt-1 text-sm text-white/60">Track your purchases across stores.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Orders ({orders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-sm text-white/70">No orders found.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <THead>
                  <TR>
                    <TH>Date</TH>
                    <TH>Store</TH>
                    <TH>Status</TH>
                    <TH>Total</TH>
                    <TH>Items</TH>
                    <TH></TH>
                  </TR>
                </THead>
                <TBody>
                  {orders.map((o) => (
                    <TR key={o.id}>
                      <TD className="text-white/70">{o.createdAt.toISOString().slice(0, 10)}</TD>
                      <TD>{o.organization.name}</TD>
                      <TD>{o.status}</TD>
                      <TD className="text-white/70">{new Intl.NumberFormat("fr-DZ").format(o.totalDzd)} DA</TD>
                      <TD className="text-white/70">
                        {o.items
                          .slice(0, 2)
                          .map((i) => `${i.product.name} x${i.quantity}`)
                          .join(", ")}
                        {o.items.length > 2 ? ` +${o.items.length - 2} more` : ""}
                      </TD>
                      <TD>
                        <Link className="text-blue-300 hover:text-blue-200" href={`/customer/orders/${o.id}`}>
                          View →
                        </Link>
                      </TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
