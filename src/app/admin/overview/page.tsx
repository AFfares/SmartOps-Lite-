import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { demoCalendarEvents } from "@/lib/demo-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MonthlyRevenueChart } from "@/components/charts/monthly-revenue-chart";
import { AdminOverviewMetricsClient } from "./metrics-client";

export default async function AdminOverviewPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/sign-in");
  if (session.user.role !== "COMPANY_ADMIN" || !session.user.organizationId) redirect("/");

  const orgId = session.user.organizationId;

  const org = await db.organization.findUnique({
    where: { id: orgId },
    select: { name: true },
  });

  const now = new Date();

  const [adminsCount, employeesCount, customersCount, productsCount, ordersCount, openTasksCount, upcomingEventsDb] =
    await Promise.all([
      db.user.count({ where: { organizationId: orgId, role: "COMPANY_ADMIN" } }),
      db.user.count({ where: { organizationId: orgId, role: "EMPLOYEE" } }),
      db.user.count({ where: { organizationId: orgId, role: "CUSTOMER" } }),

      db.product.count({
        where: { organizationId: orgId, status: "PUBLISHED" },
      }),

      db.order.count({ where: { organizationId: orgId } }),

      // ✅ FIX: enum-safe query (no Prisma/Postgres mismatch risk)
      db.employeeTask.count({
        where: {
          organizationId: orgId,
          OR: [
            { status: "TODO" },
            { status: "IN_PROGRESS" },
          ],
        },
      }),

      db.calendarEvent.findMany({
        where: { organizationId: orgId, startAt: { gte: now } },
        orderBy: { startAt: "asc" },
        take: 4,
        select: { id: true, title: true, startAt: true, location: true },
      }),
    ]);

  const upcomingEvents =
    upcomingEventsDb.length > 0
      ? upcomingEventsDb.map((e) => ({
          id: e.id,
          title: e.title,
          startAt: e.startAt.toISOString(),
          location: e.location,
          isDemo: false,
        }))
      : demoCalendarEvents.slice(0, 4).map((e) => ({
          id: e.id,
          title: e.title,
          startAt: e.startAt,
          location: e.location,
          isDemo: true,
        }));

  const revenueSeries = [
    { month: "Jan", revenueK: 420 },
    { month: "Feb", revenueK: 380 },
    { month: "Mar", revenueK: 510 },
    { month: "Apr", revenueK: 610 },
    { month: "May", revenueK: 560 },
    { month: "Jun", revenueK: 680 },
    { month: "Jul", revenueK: 720 },
    { month: "Aug", revenueK: 700 },
    { month: "Sep", revenueK: 810 },
    { month: "Oct", revenueK: 860 },
    { month: "Nov", revenueK: 920 },
    { month: "Dec", revenueK: 980 },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <p className="mt-1 text-sm text-white/60">{org?.name ?? ""}</p>
      </div>

      <AdminOverviewMetricsClient />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Card>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
            <CardDescription>Admins, employees, customers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              {adminsCount + employeesCount + customersCount}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Products</CardTitle>
            <CardDescription>Published catalog</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{productsCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Orders</CardTitle>
            <CardDescription>All customer orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{ordersCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Tasks</CardTitle>
            <CardDescription>Open employee tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{openTasksCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>Calendar next 4 items</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{upcomingEvents.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Revenue (K DZD)</CardTitle>
          <CardDescription>Interactive trend</CardDescription>
        </CardHeader>
        <CardContent>
          <MonthlyRevenueChart data={revenueSeries} />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Meeting Schedule</CardTitle>
            <CardDescription>Upcoming events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {upcomingEvents.map((e) => (
                <div
                  key={e.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/30 px-3 py-2"
                >
                  <div>
                    <div className="text-sm font-medium">{e.title}</div>
                    <div className="mt-0.5 text-xs text-white/60">
                      {new Date(e.startAt).toLocaleString()}{" "}
                      {e.location ? `• ${e.location}` : ""}
                    </div>
                  </div>
                  {e.isDemo && <div className="text-xs text-white/50">Demo</div>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Production Status</CardTitle>
            <CardDescription>In-progress summary</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-white/70">
              Track manufacturing, assembly, packaging, and delivery in the Production module.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}