import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { EmployeeTasksSummaryClient } from "./tasks-summary-client";

export default async function EmployeeDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/sign-in");
  if (session.user.role !== "EMPLOYEE") redirect("/");
  if (!session.user.organizationId) redirect("/sign-in?pending=1");

  const unreadNotifications = await db.notification.count({
    where: {
      organizationId: session.user.organizationId,
      userId: session.user.id,
      readAt: null,
    },
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">My Dashboard</h1>
        <p className="mt-1 text-sm text-white/60">Welcome{session.user.name ? `, ${session.user.name}` : ""}.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-white/70">Check in/out and view work days.</div>
            <div className="mt-3 text-sm">
              <Link className="text-blue-300 hover:text-blue-200" href="/employee/attendance">
                Open →
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tasks</CardTitle>
          </CardHeader>
          <EmployeeTasksSummaryClient />
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            {unreadNotifications === 0 ? (
              <div className="text-sm text-white/70">All caught up.</div>
            ) : (
              <div className="text-sm text-white/70">Unread: <span className="font-semibold text-white">{unreadNotifications}</span></div>
            )}
            <div className="mt-3 text-sm">
              <Link className="text-blue-300 hover:text-blue-200" href="/employee/notifications">
                Open →
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            <a className="rounded-xl border border-white/10 bg-black/30 p-4 hover:bg-white/5" href="/employee/leave">
              Submit leave request
            </a>
            <a className="rounded-xl border border-white/10 bg-black/30 p-4 hover:bg-white/5" href="/employee/reports">
              Report issue / suggestion
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
