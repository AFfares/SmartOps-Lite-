import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/sign-in");
  if (session.user.role !== "EMPLOYEE" || !session.user.organizationId) redirect("/");

  const notifs = await db.notification.findMany({
    where: {
      organizationId: session.user.organizationId,
      OR: [{ userId: null }, { userId: session.user.id }],
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
        <p className="mt-1 text-sm text-white/60">Company updates, notices, and alerts.</p>
      </div>

      <div className="grid gap-4">
        {notifs.map((n) => (
          <Card key={n.id}>
            <CardHeader>
              <CardTitle>{n.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-white/70">{n.message}</div>
            </CardContent>
          </Card>
        ))}
        {notifs.length === 0 ? <div className="text-sm text-white/70">No notifications.</div> : null}
      </div>
    </div>
  );
}
