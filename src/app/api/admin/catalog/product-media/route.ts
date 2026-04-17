import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const bodySchema = z
  .object({
    productId: z.string().min(1).max(100),
    kind: z.enum(["image", "manual", "tutorialVideo"]),
    url: z.string().url().max(2000),
  })
  .strict();

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "COMPANY_ADMIN" || !session.user.organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { productId, kind, url } = parsed.data;

  if (kind === "image") {
    const updated = await db.product.updateMany({
      where: { id: productId, organizationId: session.user.organizationId },
      data: { images: { push: url } },
    });

    if (updated.count === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  }

  if (kind === "manual") {
    const updated = await db.product.updateMany({
      where: { id: productId, organizationId: session.user.organizationId },
      data: { manualUrl: url },
    });

    if (updated.count === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  }

  const updated = await db.product.updateMany({
    where: { id: productId, organizationId: session.user.organizationId },
    data: { tutorialVideoUrl: url },
  });

  if (updated.count === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
