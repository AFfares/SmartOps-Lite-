"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

function startOfTodayUtc() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export async function checkIn() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "EMPLOYEE") throw new Error("Unauthorized");

  const today = startOfTodayUtc();

  await db.attendanceLog.upsert({
    where: { employeeUserId_date: { employeeUserId: session.user.id, date: today } },
    update: { status: "PRESENT", checkInAt: new Date() },
    create: {
      employeeUserId: session.user.id,
      date: today,
      status: "PRESENT",
      checkInAt: new Date(),
    },
  });

  revalidatePath("/employee/attendance");
}

export async function checkOut() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "EMPLOYEE") throw new Error("Unauthorized");

  const today = startOfTodayUtc();

  await db.attendanceLog.updateMany({
    where: { employeeUserId: session.user.id, date: today },
    data: { checkOutAt: new Date() },
  });

  revalidatePath("/employee/attendance");
}
