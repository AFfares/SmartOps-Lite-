import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function CustomerDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/sign-in");
  if (session.user.role !== "CUSTOMER") redirect("/");

  const [ordersCount, recentOrders] = await Promise.all([
    db.order.count({ where: { customerId: session.user.id } }),
    db.order.findMany({
      where: { customerId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: {
        id: true,
        status: true,
        totalDzd: true,
        createdAt: true,
        organization: { select: { name: true, slug: true } },
      },
    }),
  ]);

  const customerName = session.user.name?.trim() ? session.user.name.trim() : "Customer";

  const categories = [
    { title: "CNC Machines", href: "/store?category=cnc" },
    { title: "3D Printers", href: "/store?category=3d" },
    { title: "Robotics", href: "/store?category=robotics" },
    { title: "Electronics", href: "/store?category=electronics" },
    { title: "Safety Equipment", href: "/store?category=safety" },
    { title: "Industrial Tools", href: "/store?category=tools" },
  ] as const;

  const featuredProducts = [
    { id: "p1", name: "NexaCNC Mini Pro", priceDzd: 249000, rating: 4.6 },
    { id: "p2", name: "ForgePrint 3D X1", priceDzd: 179000, rating: 4.4 },
    { id: "p3", name: "RoboArm Kit V2", priceDzd: 99000, rating: 4.2 },
    { id: "p4", name: "Industrial Sensor Pack", priceDzd: 14500, rating: 4.5 },
    { id: "p5", name: "Safety Helmet Smart", priceDzd: 8900, rating: 4.1 },
    { id: "p6", name: "Precision Tool Set", priceDzd: 21500, rating: 4.3 },
  ] as const;

  return (
    <div className="space-y-10">
      {/* Welcome hero */}
      <section className="rounded-3xl border border-slate-800/60 bg-slate-950/30 p-6 backdrop-blur shadow-[0_0_0_1px_rgba(2,6,23,0.35)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-800/60 bg-slate-900/30 px-3 py-1 text-xs text-slate-200/80">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400/80" />
              Logged in
            </div>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-100">
              Welcome back, {customerName}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300/80">
              Explore products and smart industrial solutions. Search parts, scan product QR codes, and get AI-powered recommendations.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <Badge>Premium store experience</Badge>
              <Badge>QR-ready catalog</Badge>
              <Badge>AI recommendations</Badge>
            </div>
          </div>

          <div className="grid w-full gap-3 sm:grid-cols-3 lg:w-auto">
            <Card className="hover:bg-slate-900/40 transition-colors">
              <CardContent className="p-4">
                <div className="text-xs text-slate-400">My Orders</div>
                <div className="mt-1 text-2xl font-semibold text-slate-100">{ordersCount}</div>
                <div className="mt-2">
                  <Link className="text-sm text-indigo-200/90 hover:text-indigo-200" href="/customer/orders">
                    View orders →
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:bg-slate-900/40 transition-colors">
              <CardContent className="p-4">
                <div className="text-xs text-slate-400">Browse</div>
                <div className="mt-1 text-sm font-semibold text-slate-100">Catalog & stores</div>
                <div className="mt-2">
                  <Link className="text-sm text-indigo-200/90 hover:text-indigo-200" href="/store">
                    Open store →
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:bg-slate-900/40 transition-colors">
              <CardContent className="p-4">
                <div className="text-xs text-slate-400">Scan</div>
                <div className="mt-1 text-sm font-semibold text-slate-100">Product QR</div>
                <div className="mt-2">
                  <Link className="text-sm text-indigo-200/90 hover:text-indigo-200" href="/customer/scan">
                    Scan now →
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Product categories */}
      <section>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-slate-100">Product categories</h2>
            <p className="mt-1 text-sm text-slate-400">Jump into the catalog with one click.</p>
          </div>
          <Link className="text-sm text-indigo-200/90 hover:text-indigo-200" href="/store">
            Browse all →
          </Link>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <Link key={c.title} href={c.href} className="group">
              <Card className="h-full transition-all hover:bg-slate-900/45 hover:-translate-y-px">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-slate-100">{c.title}</div>
                    <span className="text-xs text-slate-400 group-hover:text-slate-200">Explore →</span>
                  </div>
                  <div className="mt-3 rounded-2xl border border-slate-800/60 bg-slate-950/40 p-4">
                    <div className="text-xs text-slate-400">Popular picks</div>
                    <div className="mt-1 text-sm text-slate-200/80">Parts • Manuals • Accessories</div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-slate-100">Featured products</h2>
            <p className="mt-1 text-sm text-slate-400">Demo products (safe dummy data until DB is wired).</p>
          </div>
          <Link className="text-sm text-indigo-200/90 hover:text-indigo-200" href="/store">
            View all →
          </Link>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {featuredProducts.map((p) => (
            <Card key={p.id} className="group transition-all hover:bg-slate-900/45 hover:-translate-y-px">
              <CardContent className="p-5">
                <div className="flex gap-4">
                  <div className="h-20 w-20 shrink-0 rounded-2xl border border-slate-800/60 bg-slate-950/40">
                    <div className="h-full w-full rounded-2xl bg-linear-to-br from-indigo-500/10 via-slate-950/10 to-sky-400/10" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-slate-100">{p.name}</div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                      <span className="inline-flex items-center gap-1 text-slate-200/80">
                        <Star className="h-3.5 w-3.5 text-amber-200/80" />
                        {p.rating.toFixed(1)}
                      </span>
                      <span>•</span>
                      <span className="truncate">Industrial-grade</span>
                    </div>
                    <div className="mt-3 text-sm font-semibold text-slate-100">
                      {new Intl.NumberFormat("fr-DZ").format(p.priceDzd)} DA
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled
                    title="Cart is coming soon"
                  >
                    Add to cart
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <Link href="/store">View details</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* AI recommendations */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>Recommended for you</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="text-sm text-slate-200/80">Best products based on your interests</div>
                <div className="mt-1 text-xs text-slate-400">(Placeholder: connect purchase history + browsing events later)</div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {["Robotics", "Sensors", "Safety", "CNC"].map((x) => (
                    <Badge key={x}>{x}</Badge>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button asChild>
                  <Link href="/store">Explore recommendations</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/customer/profile">Update interests</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* QR Code Scanner (central feature) */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>QR Code Scanner</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-2xl">
                <div className="text-sm text-slate-200/80">
                  Scan Product QR Code to instantly open product details, manuals, and tutorials.
                </div>
                <div className="mt-1 text-xs text-slate-400">
                  Future: scanning a QR redirects to the product details page.
                </div>

                <details className="mt-4 rounded-2xl border border-slate-800/60 bg-slate-950/30 p-4">
                  <summary className="cursor-pointer text-sm font-semibold text-slate-100">Scan Product QR Code</summary>
                  <div className="mt-3 grid gap-3 lg:grid-cols-2">
                    <div className="rounded-2xl border border-slate-800/60 bg-slate-950/40 p-4">
                      <div className="text-xs text-slate-400">Camera scanner</div>
                      <div className="mt-2 aspect-video w-full rounded-2xl border border-slate-800/60 bg-slate-900/30" />
                      <div className="mt-2 text-xs text-slate-400">Placeholder preview on dashboard.</div>
                    </div>
                    <div className="rounded-2xl border border-slate-800/60 bg-slate-950/40 p-4">
                      <div className="text-xs text-slate-400">Open full scanner</div>
                      <div className="mt-2 text-sm text-slate-200/80">Use the dedicated scanner page for camera permissions and scanning.</div>
                      <div className="mt-3 flex gap-2">
                        <Button asChild>
                          <Link href="/customer/scan">Open scanner</Link>
                        </Button>
                        <Button variant="outline" asChild>
                          <Link href="/qr/scan">Public QR scan</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </details>
              </div>

              <div className="w-full lg:w-90">
                <Card className="bg-slate-950/20">
                  <CardContent className="p-5">
                    <div className="text-sm font-semibold text-slate-100">Pro tip</div>
                    <div className="mt-2 text-sm text-slate-200/80">
                      Put QR stickers on machines and boxes to open manuals instantly.
                    </div>
                    <div className="mt-4">
                      <Button variant="secondary" asChild>
                        <Link href="/customer/scan">Scan now</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Recent orders (kept lightweight) */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>Recent orders</CardTitle>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <div className="text-sm text-slate-300/80">No orders yet.</div>
            ) : (
              <div className="space-y-2">
                {recentOrders.map((o) => (
                  <Link
                    key={o.id}
                    href={`/customer/orders/${o.id}`}
                    className="block rounded-2xl border border-slate-800/60 bg-slate-950/20 p-4 transition-colors hover:bg-slate-900/35"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-semibold text-slate-100">{o.organization.name}</div>
                      <div className="text-xs text-slate-400">{o.createdAt.toISOString().slice(0, 10)}</div>
                    </div>
                    <div className="mt-1 text-sm text-slate-200/80">
                      Status: {o.status} • Total: {new Intl.NumberFormat("fr-DZ").format(o.totalDzd)} DA
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
