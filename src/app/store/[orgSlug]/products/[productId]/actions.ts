"use server";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const buyNowSchema = z.object({
  orgSlug: z.string().min(1),
  productId: z.string().min(1),
  quantity: z.coerce.number().int().min(1).max(20).default(1),
});

export async function buyNow(formData: FormData) {
  const parsed = buyNowSchema.safeParse({
    orgSlug: formData.get("orgSlug"),
    productId: formData.get("productId"),
    quantity: formData.get("quantity") ?? 1,
  });

  if (!parsed.success) {
    redirect("/store");
  }

  const { orgSlug, productId, quantity } = parsed.data;

  const session = await getServerSession(authOptions);
  if (!session) redirect("/sign-in");
  if (session.user.role !== "CUSTOMER") redirect("/");

  const org = await db.organization.findUnique({ where: { slug: orgSlug }, select: { id: true, slug: true } });
  if (!org) redirect("/");

  const product = await db.product.findFirst({
    where: { id: productId, organizationId: org.id, status: "PUBLISHED" },
    select: { id: true, priceDzd: true, quantity: true },
  });

  if (!product) redirect(`/store/${orgSlug}/products`);

  const order = await db.$transaction(async (tx) => {
    const fresh = await tx.product.findUnique({
      where: { id: product.id },
      select: { quantity: true, priceDzd: true, organizationId: true, status: true },
    });

    if (!fresh || fresh.organizationId !== org.id || fresh.status !== "PUBLISHED") {
      redirect(`/store/${orgSlug}/products`);
    }

    if (fresh.quantity < quantity) {
      redirect(`/store/${orgSlug}/products/${productId}`);
    }

    await tx.product.update({
      where: { id: product.id },
      data: { quantity: { decrement: quantity } },
    });

    return tx.order.create({
      data: {
        organizationId: org.id,
        customerId: session.user.id,
        status: "PENDING",
        paymentMethod: "CASH_ON_DELIVERY",
        totalDzd: fresh.priceDzd * quantity,
        items: {
          create: [
            {
              productId: product.id,
              quantity,
              unitPriceDzd: fresh.priceDzd,
            },
          ],
        },
      },
      select: { id: true },
    });
  });

  redirect(`/customer/orders/${order.id}`);
}
