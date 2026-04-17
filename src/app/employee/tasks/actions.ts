"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const createSchema = z.object({
  title: z.string().min(2).max(140),
  description: z.string().max(2000).optional().or(z.literal("")),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  dueAt: z.string().optional().or(z.literal("")),
});

export async function createTask(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "EMPLOYEE") throw new Error("Unauthorized");
  if (!session.user.organizationId) throw new Error("Pending approval");

  const parsed = createSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    priority: formData.get("priority"),
    dueAt: formData.get("dueAt"),
  });

  if (!parsed.success) return;

  const dueAt = parsed.data.dueAt ? new Date(parsed.data.dueAt) : null;

  await db.employeeTask.create({
    data: {
      organizationId: session.user.organizationId,
      employeeUserId: session.user.id,
      title: parsed.data.title,
      description: parsed.data.description || null,
      priority: parsed.data.priority,
      status: "TODO",
      dueAt,
    },
  });

  revalidatePath("/employee/tasks");
  revalidatePath("/employee/dashboard");
}

const idSchema = z.object({
  taskId: z.string().min(1),
});

export async function toggleTaskStatus(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "EMPLOYEE") throw new Error("Unauthorized");
  if (!session.user.organizationId) throw new Error("Pending approval");

  const parsed = idSchema.safeParse({
    taskId: formData.get("taskId"),
  });
  if (!parsed.success) return;

  const task = await db.employeeTask.findFirst({
    where: {
      id: parsed.data.taskId,
      employeeUserId: session.user.id,
      organizationId: session.user.organizationId,
    },
    select: { id: true, status: true },
  });

  if (!task) return;

  await db.employeeTask.update({
    where: { id: task.id },
    data: { status: task.status === "DONE" ? "TODO" : "DONE" },
  });

  revalidatePath("/employee/tasks");
  revalidatePath("/employee/dashboard");
}

export async function deleteTask(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "EMPLOYEE") throw new Error("Unauthorized");
  if (!session.user.organizationId) throw new Error("Pending approval");

  const parsed = idSchema.safeParse({
    taskId: formData.get("taskId"),
  });
  if (!parsed.success) return;

  await db.employeeTask.deleteMany({
    where: {
      id: parsed.data.taskId,
      employeeUserId: session.user.id,
      organizationId: session.user.organizationId,
    },
  });

  revalidatePath("/employee/tasks");
  revalidatePath("/employee/dashboard");
}
