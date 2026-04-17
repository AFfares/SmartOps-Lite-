import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { createEmployeeReport } from "./actions";

export default async function ReportsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/sign-in");
  if (session.user.role !== "EMPLOYEE") redirect("/");

  const reports = await db.employeeReport.findMany({
    where: { employeeUserId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
        <p className="mt-1 text-sm text-white/60">Submit complaints, suggestions, production issues, and machine breakdown reports.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Submit report</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createEmployeeReport} className="grid gap-3">
            <div className="grid gap-3 md:grid-cols-3">
              <input className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm" name="type" placeholder="Type (e.g. Machine breakdown)" required />
              <input className="md:col-span-2 rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm" name="title" placeholder="Title" required />
            </div>
            <textarea className="min-h-28 rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm" name="description" placeholder="Describe the issue" required />
            <div className="flex flex-wrap items-center gap-2">
              <select className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm" name="urgency" defaultValue="MEDIUM">
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
              <Button size="sm" type="submit">Send</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {reports.map((r) => (
          <Card key={r.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {r.title} <Badge>{r.urgency}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-white/70">{r.type}</div>
              <div className="mt-2 text-sm text-white/80 whitespace-pre-wrap">{r.description}</div>
            </CardContent>
          </Card>
        ))}

        {reports.length === 0 ? <div className="text-sm text-white/70">No reports yet.</div> : null}
      </div>
    </div>
  );
}
