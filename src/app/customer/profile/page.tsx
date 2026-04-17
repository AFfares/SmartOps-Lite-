import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function CustomerProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/sign-in");
  if (session.user.role !== "CUSTOMER") redirect("/");

  const profile = await db.customerProfile.findUnique({
    where: { userId: session.user.id },
    select: { phone: true, address: true },
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="mt-1 text-sm text-white/60">Account details.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-white/70">
          <div>Name: <span className="text-white">{session.user.name ?? "—"}</span></div>
          <div>Email: <span className="text-white">{session.user.email}</span></div>
          <div>Phone: <span className="text-white">{profile?.phone ?? "—"}</span></div>
          <div>Address: <span className="text-white">{profile?.address ?? "—"}</span></div>
        </CardContent>
      </Card>
    </div>
  );
}
