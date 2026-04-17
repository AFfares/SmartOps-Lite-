import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MonthlyRevenueChart } from "@/components/charts/monthly-revenue-chart";

function dzd(n: number) {
  return new Intl.NumberFormat("fr-DZ", { maximumFractionDigits: 0 }).format(n) + " DZD";
}

export default async function FinancePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/sign-in");
  if (session.user.role !== "COMPANY_ADMIN" || !session.user.organizationId) redirect("/");

  const orgId = session.user.organizationId;

  const [expensesCount, unpaidInvoices, payrollCount] = await Promise.all([
    db.expense.count({ where: { organizationId: orgId } }),
    db.invoice.count({ where: { organizationId: orgId, isPaid: false } }),
    db.payroll.count({ where: { organizationId: orgId } }),
  ]);

  const series = [
    { month: "Jan", revenueK: 420 },
    { month: "Feb", revenueK: 380 },
    { month: "Mar", revenueK: 510 },
    { month: "Apr", revenueK: 610 },
    { month: "May", revenueK: 560 },
    { month: "Jun", revenueK: 680 },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Finance</h1>
        <p className="mt-1 text-sm text-white/60">Revenue, expenses, payroll, invoices, and profitability.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Expenses</CardTitle>
            <CardDescription>Recorded transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{expensesCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Unpaid invoices</CardTitle>
            <CardDescription>Client debt tracking</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{unpaidInvoices}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Payroll entries</CardTitle>
            <CardDescription>Salary processing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{payrollCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly revenue trend (K DZD)</CardTitle>
          <CardDescription>Use this to spot drops and seasonality.</CardDescription>
        </CardHeader>
        <CardContent>
          <MonthlyRevenueChart data={series} />
          <div className="mt-3 text-xs text-white/60">Example: {dzd(610000)} in April (610K DZD)</div>
        </CardContent>
      </Card>
    </div>
  );
}
