import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";

export default async function InternshipsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/sign-in");
  if (session.user.role !== "COMPANY_ADMIN" || !session.user.organizationId) redirect("/");

  const apps = await db.internshipApplication.findMany({
    where: { organizationId: session.user.organizationId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Internships / Stage</h1>
        <p className="mt-1 text-sm text-white/60">Manage student applications and CV uploads.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <THead>
                <TR>
                  <TH>Name</TH>
                  <TH>Email</TH>
                  <TH>Field</TH>
                  <TH>Duration</TH>
                  <TH>Status</TH>
                </TR>
              </THead>
              <TBody>
                {apps.map((a) => (
                  <TR key={a.id}>
                    <TD className="text-white/80">{a.fullName}</TD>
                    <TD className="text-white/70">{a.email}</TD>
                    <TD>{a.fieldOfStudy}</TD>
                    <TD>{a.durationWeeks} weeks</TD>
                    <TD>{a.status}</TD>
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
