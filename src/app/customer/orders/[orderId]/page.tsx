import Link from "next/link";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";

export default async function CustomerOrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/sign-in");
  if (session.user.role !== "CUSTOMER") redirect("/");

  const { orderId } = await params;

  const order = await db.order.findFirst({
    where: {
      id: orderId,
      customerId: session.user.id,
    },
    include: {
      organization: { select: { name: true, slug: true } },
      items: { include: { product: { select: { name: true, id: true } } } },
    },
  });

  if (!order) notFound();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Order details</h1>
        <p className="mt-1 text-sm text-white/60">
          Store: <span className="text-white">{order.organization.name}</span>
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-white/70 space-y-1">
          <div>Order ID: <span className="text-white">{order.id}</span></div>
          <div>Status: <span className="text-white">{order.status}</span></div>
          <div>Payment method: <span className="text-white">{order.paymentMethod}</span></div>
          <div>Total: <span className="text-white">{new Intl.NumberFormat("fr-DZ").format(order.totalDzd)} DA</span></div>
          <div>Date: <span className="text-white">{order.createdAt.toISOString().slice(0, 10)}</span></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <THead>
                <TR>
                  <TH>Product</TH>
                  <TH>Qty</TH>
                  <TH>Unit</TH>
                  <TH>Total</TH>
                </TR>
              </THead>
              <TBody>
                {order.items.map((i) => (
                  <TR key={i.id}>
                    <TD>
                      <Link className="text-blue-300 hover:text-blue-200" href={`/store/${order.organization.slug}/products/${i.product.id}`}>
                        {i.product.name}
                      </Link>
                    </TD>
                    <TD className="text-white/70">{i.quantity}</TD>
                    <TD className="text-white/70">{new Intl.NumberFormat("fr-DZ").format(i.unitPriceDzd)} DA</TD>
                    <TD className="text-white/70">{new Intl.NumberFormat("fr-DZ").format(i.unitPriceDzd * i.quantity)} DA</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="text-sm">
        <Link className="text-blue-300 hover:text-blue-200" href="/customer/orders">← Back to orders</Link>
      </div>
    </div>
  );
}
