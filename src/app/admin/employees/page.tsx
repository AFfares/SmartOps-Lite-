import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";

import { approveJoinRequest, rejectJoinRequest } from "./actions";

export default async function EmployeesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/sign-in");
  if (session.user.role !== "COMPANY_ADMIN" || !session.user.organizationId) redirect("/");

  const org = await db.organization.findUnique({
    where: { id: session.user.organizationId },
    select: { name: true, joinCode: true },
  });

  const [employees, joinRequests] = await Promise.all([
    db.user.findMany({
      where: { organizationId: session.user.organizationId, role: "EMPLOYEE" },
      select: { id: true, name: true, email: true, employeeProfile: { select: { department: true, jobTitle: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    db.joinRequest.findMany({
      where: { organizationId: session.user.organizationId, status: "PENDING" },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "asc" },
      take: 50,
    }),
  ]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Employees</h1>
        <p className="mt-1 text-sm text-white/60">Manage staff, attendance, and join approvals.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Company join code</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="text-white">{org?.joinCode ?? "—"}</Badge>
            <a className="text-sm text-blue-300 hover:text-blue-200" href="/admin/settings">
              Generate QR / manage onboarding →
            </a>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pending join requests</CardTitle>
        </CardHeader>
        <CardContent>
          {joinRequests.length === 0 ? (
            <div className="text-sm text-white/70">No pending requests.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <THead>
                  <TR>
                    <TH>User</TH>
                    <TH>Email</TH>
                    <TH>Actions</TH>
                  </TR>
                </THead>
                <TBody>
                  {joinRequests.map((r) => (
                    <TR key={r.id}>
                      <TD className="text-white/80">{r.user.name ?? "—"}</TD>
                      <TD className="text-white/70">{r.user.email}</TD>
                      <TD>
                        <div className="flex items-center gap-2">
                          <form action={approveJoinRequest}>
                            <input type="hidden" name="requestId" value={r.id} />
                            <Button size="sm" type="submit">
                              Approve
                            </Button>
                          </form>
                          <form action={rejectJoinRequest}>
                            <input type="hidden" name="requestId" value={r.id} />
                            <Button variant="outline" size="sm" type="submit">
                              Reject
                            </Button>
                          </form>
                        </div>
                      </TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Employees list</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <THead>
                <TR>
                  <TH>Name</TH>
                  <TH>Email</TH>
                  <TH>Department</TH>
                  <TH>Job</TH>
                </TR>
              </THead>
              <TBody>
                {employees.map((e) => (
                  <TR key={e.id}>
                    <TD className="text-white/80">{e.name ?? "—"}</TD>
                    <TD className="text-white/70">{e.email}</TD>
                    <TD>{e.employeeProfile?.department ?? "—"}</TD>
                    <TD>{e.employeeProfile?.jobTitle ?? "—"}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Attendance insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-white/70">Daily attendance logs and workforce insights are available under HR modules.</div>
        </CardContent>
      </Card>
    </div>
  );
}
