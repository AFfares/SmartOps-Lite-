import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { demoTasks } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!session.user.organizationId) {
    return NextResponse.json(demoTasks, { headers: { "Cache-Control": "no-store" } });
  }

  const where =
    session.user.role === "EMPLOYEE"
      ? {
          organizationId: session.user.organizationId,
          employeeUserId: session.user.id,
        }
      : {
          organizationId: session.user.organizationId,
        };

  const tasks = await db.employeeTask.findMany({
    where,
    orderBy: [{ status: "asc" }, { dueAt: "asc" }, { createdAt: "desc" }],
    take: 50,
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      priority: true,
      dueAt: true,
      createdAt: true,
    },
  });

  if (tasks.length === 0) {
    return NextResponse.json(demoTasks, { headers: { "Cache-Control": "no-store" } });
  }

  const payload = tasks.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description ?? "",
    status: t.status,
    priority: t.priority,
    dueAt: t.dueAt ? t.dueAt.toISOString() : null,
    createdAt: t.createdAt.toISOString(),
  }));

  return NextResponse.json(payload, { headers: { "Cache-Control": "no-store" } });
}
