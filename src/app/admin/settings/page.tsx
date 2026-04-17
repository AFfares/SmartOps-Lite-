import Image from "next/image";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import QRCode from "qrcode";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/sign-in");
  if (session.user.role !== "COMPANY_ADMIN" || !session.user.organizationId) redirect("/");

  const org = await db.organization.findUnique({
    where: { id: session.user.organizationId },
    select: { name: true, slug: true, joinCode: true },
  });

  const qrDataUrl = org?.joinCode ? await QRCode.toDataURL(org.joinCode, { margin: 1, scale: 6 }) : null;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-white/60">Organization onboarding, security, and configuration.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Organization</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-white/70">Name: {org?.name ?? "—"}</div>
          <div className="text-sm text-white/70">Slug: {org?.slug ?? "—"}</div>
          <div className="flex items-center gap-2">
            <div className="text-sm text-white/70">Join code:</div>
            <Badge className="text-white">{org?.joinCode ?? "—"}</Badge>
          </div>
          <div className="text-xs text-white/60">
            Employees can enter this code during registration. Their join request must be approved by an admin.
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Join QR code</CardTitle>
        </CardHeader>
        <CardContent>
          {qrDataUrl ? (
            <Image
              src={qrDataUrl}
              alt="Join QR"
              width={192}
              height={192}
              unoptimized
              className="h-48 w-48 rounded-xl border border-white/10 bg-white p-2"
            />
          ) : (
            <div className="text-sm text-white/70">No join code available.</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-white/70">Role-based permissions and protected routes are enforced by middleware and server checks.</div>
        </CardContent>
      </Card>
    </div>
  );
}
