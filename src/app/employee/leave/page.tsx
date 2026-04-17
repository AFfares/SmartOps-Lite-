import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";

import { createLeaveRequest } from "./actions";

export default async function LeaveRequestsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/sign-in");
  if (session.user.role !== "EMPLOYEE") redirect("/");

  const requests = await db.leaveRequest.findMany({
    where: { employeeUserId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Leave Requests</h1>
        <p className="mt-1 text-sm text-white/60">Submit leave requests and attach medical proof (optional).</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Submit request</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createLeaveRequest} className="grid gap-3 md:grid-cols-3">
            <input
              className="md:col-span-3 rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm"
              name="reason"
              placeholder="Reason"
              required
            />
            <input className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm" name="startDate" type="date" required />
            <input className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm" name="endDate" type="date" required />
            <Button size="sm" type="submit">Submit</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>My requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <THead>
                <TR>
                  <TH>Dates</TH>
                  <TH>Status</TH>
                  <TH>Reason</TH>
                </TR>
              </THead>
              <TBody>
                {requests.map((r) => (
                  <TR key={r.id}>
                    <TD className="text-white/70">
                      {r.startDate.toISOString().slice(0, 10)} → {r.endDate.toISOString().slice(0, 10)}
                    </TD>
                    <TD>{r.status}</TD>
                    <TD className="text-white/80">{r.reason}</TD>
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
