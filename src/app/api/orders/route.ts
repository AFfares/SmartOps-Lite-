import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { demoOrders } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!session.user.organizationId) {
    return NextResponse.json(demoOrders, { headers: { "Cache-Control": "no-store" } });
  }

  const where =
    session.user.role === "CUSTOMER"
      ? {
          customerId: session.user.id,
        }
      : {
          organizationId: session.user.organizationId,
        };

  const orders = await db.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      status: true,
      totalDzd: true,
      createdAt: true,
      organization: { select: { id: true, name: true, slug: true } },
      items: { select: { id: true } },
    },
  });

  if (orders.length === 0) {
    return NextResponse.json(demoOrders, { headers: { "Cache-Control": "no-store" } });
  }

  const payload = orders.map((o) => ({
    id: o.id,
    organization: o.organization,
    status: o.status,
    totalDzd: o.totalDzd,
    createdAt: o.createdAt.toISOString(),
    itemsCount: o.items.length,
  }));

  return NextResponse.json(payload, { headers: { "Cache-Control": "no-store" } });
}
