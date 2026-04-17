"use client";

import Link from "next/link";

import { CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { DemoTask } from "@/lib/demo-data";
import { demoTasks } from "@/lib/demo-data";
import { useApiArray } from "@/components/demo/use-api-array";

export function EmployeeTasksSummaryClient() {
  const tasks = useApiArray<DemoTask>("/api/tasks", demoTasks);

  const pending = tasks.data.filter((t) => t.status === "TODO" || t.status === "IN_PROGRESS");
  const done = tasks.data.filter((t) => t.status === "DONE");

  return (
    <CardContent>
      <div className="flex flex-wrap items-center gap-2 text-sm text-white/70">
        <span>
          Open: <span className="font-semibold text-white">{pending.length}</span>
        </span>
        <span className="text-white/30">•</span>
        <span>
          Done: <span className="font-semibold text-white">{done.length}</span>
        </span>
        {tasks.usingFallback ? <Badge className="ml-1">Demo</Badge> : <Badge className="ml-1 border-emerald-500/30 bg-emerald-500/10 text-emerald-100">DB</Badge>}
      </div>

      <div className="mt-3 space-y-2">
        {pending.slice(0, 3).map((t) => (
          <div key={t.id} className="rounded-xl border border-white/10 bg-black/30 p-3">
            <div className="font-medium">{t.title}</div>
            <div className="mt-1 text-xs text-white/60">{t.description}</div>
          </div>
        ))}

        {pending.length === 0 ? <div className="text-sm text-white/70">No open tasks.</div> : null}
      </div>

      <div className="mt-3 text-sm">
        <Link className="text-blue-300 hover:text-blue-200" href="/employee/tasks">
          View tasks →
        </Link>
      </div>
    </CardContent>
  );
}
