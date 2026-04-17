import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";

export default async function SuppliersPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/sign-in");
  if (session.user.role !== "COMPANY_ADMIN" || !session.user.organizationId) redirect("/");

  const suppliers = await db.supplier.findMany({
    where: { organizationId: session.user.organizationId },
    orderBy: { updatedAt: "desc" },
    take: 50,
    include: { invoices: true },
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Suppliers</h1>
        <p className="mt-1 text-sm text-white/60">Raw material suppliers, reliability score, and invoices.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Suppliers list</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <THead>
                <TR>
                  <TH>Name</TH>
                  <TH>Score</TH>
                  <TH>Last purchase</TH>
                  <TH>Unpaid invoices</TH>
                </TR>
              </THead>
              <TBody>
                {suppliers.map((s) => (
                  <TR key={s.id}>
                    <TD className="text-white/80">{s.name}</TD>
                    <TD>{s.reliabilityScore}</TD>
                    <TD className="text-white/70">{s.lastPurchaseAt ? s.lastPurchaseAt.toISOString().slice(0, 10) : "—"}</TD>
                    <TD>{s.invoices.filter((i) => !i.isPaid).length}</TD>
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
