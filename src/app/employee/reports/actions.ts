"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const schema = z.object({
  type: z.string().min(2).max(80),
  title: z.string().min(2).max(120),
  description: z.string().min(3).max(2000),
  urgency: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
});

export async function createEmployeeReport(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "EMPLOYEE") throw new Error("Unauthorized");

  const parsed = schema.safeParse({
    type: formData.get("type"),
    title: formData.get("title"),
    description: formData.get("description"),
    urgency: formData.get("urgency"),
  });

  if (!parsed.success) return;

  await db.employeeReport.create({
    data: {
      employeeUserId: session.user.id,
      type: parsed.data.type,
      title: parsed.data.title,
      description: parsed.data.description,
      urgency: parsed.data.urgency,
      attachmentUrls: [],
    },
  });

  revalidatePath("/employee/reports");
}
