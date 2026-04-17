import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { CalendarEventsList } from "@/components/demo/calendar-events-list";

export default async function CalendarPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/sign-in");
  if (session.user.role !== "COMPANY_ADMIN" || !session.user.organizationId) redirect("/");

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Calendar</h1>
        <p className="mt-1 text-sm text-white/60">Meetings, planning, and gatherings.</p>
      </div>

      <CalendarEventsList />
    </div>
  );
}
