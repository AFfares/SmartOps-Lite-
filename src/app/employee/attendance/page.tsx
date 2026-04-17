import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";

import { checkIn, checkOut } from "./actions";

export default async function AttendancePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/sign-in");
  if (session.user.role !== "EMPLOYEE") redirect("/");

  const logs = await db.attendanceLog.findMany({
    where: { employeeUserId: session.user.id },
    orderBy: { date: "desc" },
    take: 30,
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Attendance</h1>
        <p className="mt-1 text-sm text-white/60">Check in/out and review your work hours.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Today</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <form action={checkIn}>
              <Button size="sm" type="submit">Check in</Button>
            </form>
            <form action={checkOut}>
              <Button variant="secondary" size="sm" type="submit">Check out</Button>
            </form>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <THead>
                <TR>
                  <TH>Date</TH>
                  <TH>Status</TH>
                  <TH>Check-in</TH>
                  <TH>Check-out</TH>
                </TR>
              </THead>
              <TBody>
                {logs.map((l) => (
                  <TR key={l.id}>
                    <TD className="text-white/70">{l.date.toISOString().slice(0, 10)}</TD>
                    <TD>{l.status}</TD>
                    <TD className="text-white/70">{l.checkInAt ? l.checkInAt.toISOString().slice(11, 16) : "—"}</TD>
                    <TD className="text-white/70">{l.checkOutAt ? l.checkOutAt.toISOString().slice(11, 16) : "—"}</TD>
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
