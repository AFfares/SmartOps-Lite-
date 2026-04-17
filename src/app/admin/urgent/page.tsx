import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function UrgentPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/sign-in");
  if (session.user.role !== "COMPANY_ADMIN" || !session.user.organizationId) redirect("/");

  const notifs = await db.notification.findMany({
    where: { organizationId: session.user.organizationId, urgency: { in: ["HIGH", "CRITICAL"] } },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Urgent Notifications</h1>
        <p className="mt-1 text-sm text-white/60">Critical alerts and action items.</p>
      </div>

      <div className="grid gap-4">
        {notifs.map((n) => (
          <Card key={n.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {n.title} <Badge>{n.urgency}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-white/70">{n.message}</div>
            </CardContent>
          </Card>
        ))}

        {notifs.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No urgent notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-white/70">You&apos;re all clear.</div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
