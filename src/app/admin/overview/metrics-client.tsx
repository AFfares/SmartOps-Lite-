"use client";

import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { DemoOrder, DemoProduct, DemoTask } from "@/lib/demo-data";
import { demoOrders, demoProducts, demoTasks } from "@/lib/demo-data";
import { useApiArray } from "@/components/demo/use-api-array";

function fmtDzd(amount: number) {
  return new Intl.NumberFormat("fr-DZ", { maximumFractionDigits: 0 }).format(amount) + " DZD";
}

export function AdminOverviewMetricsClient() {
  const products = useApiArray<DemoProduct>("/api/products", demoProducts);
  const orders = useApiArray<DemoOrder>("/api/orders", demoOrders);
  const tasks = useApiArray<DemoTask>("/api/tasks", demoTasks);

  const pendingOrders = orders.data.filter((o) => String(o.status) === "PENDING").length;
  const openTasks = tasks.data.filter((t) => t.status === "TODO" || t.status === "IN_PROGRESS").length;

  const revenueToday = orders.data
    .filter((o) => {
      const dt = new Date(o.createdAt);
      const now = new Date();
      return (
        dt.getFullYear() === now.getFullYear() &&
        dt.getMonth() === now.getMonth() &&
        dt.getDate() === now.getDate()
      );
    })
    .reduce((sum, o) => sum + (o.totalDzd || 0), 0);

  const usingFallback = products.usingFallback || orders.usingFallback || tasks.usingFallback;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="text-sm font-semibold text-slate-100">Live stats</div>
          {usingFallback ? <Badge>Demo data</Badge> : <Badge className="border-emerald-500/30 bg-emerald-500/10 text-emerald-100">DB data</Badge>}
        </div>
        <div className="text-xs text-slate-400">
          {products.error || orders.error || tasks.error ? "Some data failed to load, showing demo." : ""}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Today</CardTitle>
            <CardDescription>Based on recent orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{fmtDzd(revenueToday)}</div>
            <div className="mt-1 text-xs text-white/60">Orders: {orders.data.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Orders</CardTitle>
            <CardDescription>To confirm / process</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{pendingOrders}</div>
            <div className="mt-1 text-xs text-white/60">
              <Link className="text-indigo-200/90 hover:text-indigo-200" href="/admin/production">Open production →</Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Catalog Products</CardTitle>
            <CardDescription>Published items</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{products.data.length}</div>
            <div className="mt-1 text-xs text-white/60">
              <Link className="text-indigo-200/90 hover:text-indigo-200" href="/admin/catalog">Manage catalog →</Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Open Tasks</CardTitle>
            <CardDescription>Employee workload</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{openTasks}</div>
            <div className="mt-1 text-xs text-white/60">Tasks: {tasks.data.length}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
