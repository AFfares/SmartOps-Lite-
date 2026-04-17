import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { demoTasks } from "@/lib/demo-data";

import { createTask, deleteTask, toggleTaskStatus } from "./actions";

function priorityBadgeClass(priority: string) {
  if (priority === "HIGH") return "border-red-500/30 bg-red-500/10 text-red-200";
  if (priority === "MEDIUM") return "border-amber-500/30 bg-amber-500/10 text-amber-100";
  return "border-emerald-500/30 bg-emerald-500/10 text-emerald-100";
}

export default async function TasksPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/sign-in");
  if (session.user.role !== "EMPLOYEE") redirect("/");
  if (!session.user.organizationId) redirect("/sign-in?pending=1");

  const tasks = await db.employeeTask.findMany({
    where: {
      employeeUserId: session.user.id,
      organizationId: session.user.organizationId,
    },
    orderBy: [{ status: "asc" }, { dueAt: "asc" }, { createdAt: "desc" }],
    take: 50,
  });

  const pending = tasks.filter((t) => t.status === "TODO" || t.status === "IN_PROGRESS");
  const done = tasks.filter((t) => t.status === "DONE");

  const demoPending = demoTasks.filter((t) => t.status === "TODO" || t.status === "IN_PROGRESS");
  const demoDone = demoTasks.filter((t) => t.status === "DONE");

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Tasks</h1>
        <p className="mt-1 text-sm text-white/60">Personal tasks and deadlines for your workday.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add a task</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createTask} className="grid gap-3 md:grid-cols-2">
            <label className="block md:col-span-2">
              <span className="text-sm text-white/80">Title</span>
              <input
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-sm"
                name="title"
                required
                placeholder="e.g. Prepare daily production report"
              />
            </label>

            <label className="block md:col-span-2">
              <span className="text-sm text-white/80">Description (optional)</span>
              <textarea
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-sm"
                name="description"
                rows={3}
                placeholder="Add context, checklist, or notes"
              />
            </label>

            <label className="block">
              <span className="text-sm text-white/80">Priority</span>
              <select
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-sm"
                name="priority"
                defaultValue="MEDIUM"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </label>

            <label className="block">
              <span className="text-sm text-white/80">Due date (optional)</span>
              <input
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-sm"
                name="dueAt"
                type="date"
              />
            </label>

            <div className="md:col-span-2">
              <Button type="submit" size="sm">
                Add task
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Open ({pending.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {pending.length === 0 ? (
            <div className="space-y-3">
              <div className="text-sm text-white/70">No open tasks in DB yet. Showing demo tasks.</div>
              <div className="overflow-x-auto">
                <Table>
                  <THead>
                    <TR>
                      <TH>Task</TH>
                      <TH>Status</TH>
                      <TH>Priority</TH>
                      <TH>Due</TH>
                      <TH className="w-45">Actions</TH>
                    </TR>
                  </THead>
                  <TBody>
                    {demoPending.map((t) => (
                      <TR key={t.id}>
                        <TD>
                          <div className="font-medium">{t.title}</div>
                          {t.description ? <div className="mt-1 text-xs text-white/60">{t.description}</div> : null}
                        </TD>
                        <TD>
                          <Badge className="bg-yellow-500/10 text-yellow-100 border-yellow-500/30">{t.status}</Badge>
                        </TD>
                        <TD>
                          <Badge className={priorityBadgeClass(t.priority)}>{t.priority}</Badge>
                        </TD>
                        <TD className="text-white/70">{t.dueAt ? t.dueAt.slice(0, 10) : "—"}</TD>
                        <TD>
                          <Badge>Demo</Badge>
                        </TD>
                      </TR>
                    ))}
                  </TBody>
                </Table>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <THead>
                  <TR>
                    <TH>Task</TH>
                    <TH>Status</TH>
                    <TH>Priority</TH>
                    <TH>Due</TH>
                    <TH className="w-45">Actions</TH>
                  </TR>
                </THead>
                <TBody>
                  {pending.map((t) => (
                    <TR key={t.id}>
                      <TD>
                        <div className="font-medium">{t.title}</div>
                        {t.description ? <div className="mt-1 text-xs text-white/60">{t.description}</div> : null}
                      </TD>
                      <TD>
                        <Badge className="bg-yellow-500/10 text-yellow-100 border-yellow-500/30">{t.status}</Badge>
                      </TD>
                      <TD>
                        <Badge className={priorityBadgeClass(t.priority)}>{t.priority}</Badge>
                      </TD>
                      <TD className="text-white/70">{t.dueAt ? t.dueAt.toISOString().slice(0, 10) : "—"}</TD>
                      <TD>
                        <div className="flex flex-wrap gap-2">
                          <form action={toggleTaskStatus}>
                            <input type="hidden" name="taskId" value={t.id} />
                            <Button size="sm" type="submit">
                              Mark done
                            </Button>
                          </form>
                          <form action={deleteTask}>
                            <input type="hidden" name="taskId" value={t.id} />
                            <Button variant="secondary" size="sm" type="submit">
                              Delete
                            </Button>
                          </form>
                        </div>
                      </TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Done ({done.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {done.length === 0 ? (
            <div className="space-y-2">
              <div className="text-sm text-white/70">No completed tasks in DB yet. Showing demo tasks.</div>
              {demoDone.slice(0, 5).map((t) => (
                <div
                  key={t.id}
                  className="flex items-start justify-between gap-3 rounded-xl border border-white/10 bg-black/30 p-3"
                >
                  <div>
                    <div className="font-medium line-through text-white/70">{t.title}</div>
                    {t.dueAt ? <div className="mt-1 text-xs text-white/50">Due: {t.dueAt.slice(0, 10)}</div> : null}
                  </div>
                  <Badge>Demo</Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {done.slice(0, 10).map((t) => (
                <div
                  key={t.id}
                  className="flex items-start justify-between gap-3 rounded-xl border border-white/10 bg-black/30 p-3"
                >
                  <div>
                    <div className="font-medium line-through text-white/70">{t.title}</div>
                    {t.dueAt ? <div className="mt-1 text-xs text-white/50">Due: {t.dueAt.toISOString().slice(0, 10)}</div> : null}
                  </div>
                  <form action={toggleTaskStatus}>
                    <input type="hidden" name="taskId" value={t.id} />
                    <Button variant="outline" size="sm" type="submit">
                      Undo
                    </Button>
                  </form>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
