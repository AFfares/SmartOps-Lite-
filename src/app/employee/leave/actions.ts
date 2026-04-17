"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const createSchema = z.object({
  reason: z.string().min(3).max(500),
  startDate: z.string().min(10).max(25),
  endDate: z.string().min(10).max(25),
});

export async function createLeaveRequest(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "EMPLOYEE") throw new Error("Unauthorized");

  const parsed = createSchema.safeParse({
    reason: formData.get("reason"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
  });

  if (!parsed.success) return;

  await db.leaveRequest.create({
    data: {
      employeeUserId: session.user.id,
      reason: parsed.data.reason,
      startDate: new Date(parsed.data.startDate),
      endDate: new Date(parsed.data.endDate),
    },
  });

  revalidatePath("/employee/leave");
}
