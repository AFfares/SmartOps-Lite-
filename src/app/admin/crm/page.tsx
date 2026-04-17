import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";

export default async function CrmPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/sign-in");
  if (session.user.role !== "COMPANY_ADMIN" || !session.user.organizationId) redirect("/");

  const orgId = session.user.organizationId;
  const [clients, leads] = await Promise.all([
    db.crmClient.findMany({ where: { organizationId: orgId }, orderBy: { updatedAt: "desc" }, take: 20 }),
    db.lead.findMany({ where: { organizationId: orgId }, orderBy: { createdAt: "desc" }, take: 20 }),
  ]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">CRM</h1>
        <p className="mt-1 text-sm text-white/60">Clients, opportunities, order history, and unpaid balances.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Clients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <THead>
                <TR>
                  <TH>Name</TH>
                  <TH>Email</TH>
                  <TH>Loyal</TH>
                  <TH>Debt (DZD)</TH>
                </TR>
              </THead>
              <TBody>
                {clients.map((c) => (
                  <TR key={c.id}>
                    <TD className="text-white/80">{c.name}</TD>
                    <TD className="text-white/70">{c.email ?? "—"}</TD>
                    <TD>{c.isLoyal ? "Yes" : "No"}</TD>
                    <TD>{new Intl.NumberFormat("fr-DZ").format(c.debtDzd)}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Leads</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <THead>
                <TR>
                  <TH>Name</TH>
                  <TH>Stage</TH>
                  <TH>Contact</TH>
                </TR>
              </THead>
              <TBody>
                {leads.map((l) => (
                  <TR key={l.id}>
                    <TD className="text-white/80">{l.name}</TD>
                    <TD className="text-white/70">{l.stage ?? "—"}</TD>
                    <TD className="text-white/70">{l.email ?? l.phone ?? "—"}</TD>
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
