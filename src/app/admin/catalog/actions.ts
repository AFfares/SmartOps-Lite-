"use server";

import { z } from "zod";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const createSchema = z.object({
  name: z.string().min(2).max(120),
  priceDzd: z.coerce.number().int().min(0).max(1_000_000_000),
  quantity: z.coerce.number().int().min(0).max(1_000_000_000),
});

export async function createDraftProduct(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "COMPANY_ADMIN" || !session.user.organizationId) throw new Error("Unauthorized");

  const parsed = createSchema.safeParse({
    name: formData.get("name"),
    priceDzd: formData.get("priceDzd"),
    quantity: formData.get("quantity"),
  });
  if (!parsed.success) return;

  await db.product.create({
    data: {
      organizationId: session.user.organizationId,
      name: parsed.data.name,
      priceDzd: parsed.data.priceDzd,
      quantity: parsed.data.quantity,
      images: [],
      status: "DRAFT",
    },
  });

  revalidatePath("/admin/catalog");
}

export async function publishProduct(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "COMPANY_ADMIN" || !session.user.organizationId) throw new Error("Unauthorized");

  const productId = z.string().min(1).parse(formData.get("productId"));

  await db.product.updateMany({
    where: { id: productId, organizationId: session.user.organizationId },
    data: { status: "PUBLISHED" },
  });

  revalidatePath("/admin/catalog");
}
