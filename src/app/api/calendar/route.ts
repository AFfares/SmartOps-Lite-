import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { demoCalendarEvents } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!session.user.organizationId) {
    return NextResponse.json(demoCalendarEvents, { headers: { "Cache-Control": "no-store" } });
  }

  const events = await db.calendarEvent.findMany({
    where: { organizationId: session.user.organizationId },
    orderBy: { startAt: "asc" },
    take: 50,
    select: {
      id: true,
      title: true,
      description: true,
      startAt: true,
      endAt: true,
      location: true,
    },
  });

  if (events.length === 0) {
    return NextResponse.json(demoCalendarEvents, { headers: { "Cache-Control": "no-store" } });
  }

  const payload = events.map((e) => ({
    id: e.id,
    title: e.title,
    description: e.description ?? "",
    startAt: e.startAt.toISOString(),
    endAt: e.endAt.toISOString(),
    location: e.location,
  }));

  return NextResponse.json(payload, { headers: { "Cache-Control": "no-store" } });
}
