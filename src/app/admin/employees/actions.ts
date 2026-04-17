"use server";

import { z } from "zod";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const idSchema = z.string().min(1);

export async function approveJoinRequest(formData: FormData) {
  const requestId = idSchema.parse(formData.get("requestId"));

  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "COMPANY_ADMIN" || !session.user.organizationId) {
    throw new Error("Unauthorized");
  }

  const req = await db.joinRequest.findFirst({
    where: { id: requestId, organizationId: session.user.organizationId, status: "PENDING" },
    include: { user: { select: { id: true } } },
  });
  if (!req) return;

  await db.$transaction([
    db.user.update({
      where: { id: req.userId },
      data: {
        organizationId: session.user.organizationId,
        employeeProfile: {
          create: {},
        },
      },
    }),
    db.joinRequest.update({
      where: { id: requestId },
      data: { status: "APPROVED", reviewedAt: new Date(), reviewedByUserId: session.user.id },
    }),
  ]);

  revalidatePath("/admin/employees");
}

export async function rejectJoinRequest(formData: FormData) {
  const requestId = idSchema.parse(formData.get("requestId"));

  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "COMPANY_ADMIN" || !session.user.organizationId) {
    throw new Error("Unauthorized");
  }

  await db.joinRequest.updateMany({
    where: { id: requestId, organizationId: session.user.organizationId, status: "PENDING" },
    data: { status: "REJECTED", reviewedAt: new Date(), reviewedByUserId: session.user.id },
  });

  revalidatePath("/admin/employees");
}
