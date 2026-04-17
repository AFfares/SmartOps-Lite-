import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";

export default async function SalaryPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/sign-in");
  if (session.user.role !== "EMPLOYEE") redirect("/");

  const rows = await db.payroll.findMany({
    where: { employeeUserId: session.user.id },
    orderBy: { month: "desc" },
    take: 24,
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Salary</h1>
        <p className="mt-1 text-sm text-white/60">Payroll overview and payment status.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payroll</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <THead>
                <TR>
                  <TH>Month</TH>
                  <TH>Amount (DZD)</TH>
                  <TH>Paid</TH>
                </TR>
              </THead>
              <TBody>
                {rows.map((r) => (
                  <TR key={r.id}>
                    <TD className="text-white/70">{r.month.toISOString().slice(0, 7)}</TD>
                    <TD>{new Intl.NumberFormat("fr-DZ").format(r.amountDzd)}</TD>
                    <TD>{r.isPaid ? "Yes" : "No"}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </div>
          {rows.length === 0 ? <div className="mt-3 text-sm text-white/70">No payroll entries yet.</div> : null}
        </CardContent>
      </Card>
    </div>
  );
}
