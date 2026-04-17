"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { DemoCalendarEvent } from "@/lib/demo-data";
import { demoCalendarEvents } from "@/lib/demo-data";
import { useApiArray } from "@/components/demo/use-api-array";

function fmt(dtIso: string) {
  const dt = new Date(dtIso);
  // Local, presentation-friendly
  return dt.toISOString().slice(0, 16).replace("T", " ");
}

export function CalendarEventsList() {
  const events = useApiArray<DemoCalendarEvent>("/api/calendar", demoCalendarEvents);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {events.usingFallback ? <Badge>Demo events</Badge> : <Badge className="border-emerald-500/30 bg-emerald-500/10 text-emerald-100">DB events</Badge>}
        {events.error ? <div className="text-xs text-white/50">(fallback: {events.error})</div> : null}
      </div>

      <div className="grid gap-4">
        {events.data.map((e) => (
          <Card key={e.id}>
            <CardHeader>
              <CardTitle>{e.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-white/70">
                {fmt(e.startAt)} → {fmt(e.endAt)}
              </div>
              {e.location ? <div className="mt-1 text-sm text-white/70">Location: {e.location}</div> : null}
              {e.description ? <div className="mt-2 text-sm text-white/70">{e.description}</div> : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
