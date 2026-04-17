"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/lib/db";

const schema = z.object({
  orgSlug: z.string().min(1),
  name: z.string().min(2).max(120),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().max(40).optional().or(z.literal("")),
  requestType: z.enum(["QUOTE", "INVOICE", "SUPPORT"]).default("QUOTE"),
  contextId: z.string().max(200).optional().or(z.literal("")),
  message: z.string().min(3).max(2000),
});

export async function submitSupportRequest(formData: FormData) {
  const parsed = schema.safeParse({
    orgSlug: formData.get("orgSlug"),
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    requestType: formData.get("requestType"),
    contextId: formData.get("contextId"),
    message: formData.get("message"),
  });

  if (!parsed.success) return;

  const org = await db.organization.findUnique({
    where: { slug: parsed.data.orgSlug },
    select: { id: true, name: true },
  });

  if (!org) return;

  const stage = `${parsed.data.requestType}${parsed.data.contextId ? `:${parsed.data.contextId}` : ""}`;

  await db.$transaction([
    db.lead.create({
      data: {
        organizationId: org.id,
        name: parsed.data.name,
        email: parsed.data.email || null,
        phone: parsed.data.phone || null,
        stage,
      },
    }),
    db.notification.create({
      data: {
        organizationId: org.id,
        title: `Store request: ${parsed.data.requestType}`,
        message: `From: ${parsed.data.name}${parsed.data.email ? ` (${parsed.data.email})` : ""}${parsed.data.phone ? ` • ${parsed.data.phone}` : ""}\n\n${parsed.data.message}`,
        urgency: parsed.data.requestType === "SUPPORT" ? "HIGH" : "MEDIUM",
      },
    }),
  ]);

  revalidatePath(`/store/${parsed.data.orgSlug}/support`);
}
