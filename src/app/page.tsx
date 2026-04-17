import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (session?.user?.role === "COMPANY_ADMIN") redirect("/admin/overview");
  if (session?.user?.role === "EMPLOYEE") redirect("/employee/dashboard");

  // Customers can browse without auth; when authenticated, send to their store.
  if (session?.user?.role === "CUSTOMER") {
    // After sign-in, customers should land on their portal dashboard.
    redirect("/customer/dashboard");
  }

  const featured = await db.product.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { updatedAt: "desc" },
    take: 6,
    select: {
      id: true,
      name: true,
      description: true,
      priceDzd: true,
      organization: { select: { name: true, slug: true } },
    },
  });

  return (
    <div className="min-h-screen bg-[#05070d] text-white">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <header className="flex items-center justify-between">
          <div className="text-lg font-semibold tracking-tight">SmartOps Lite</div>
          <nav className="flex items-center gap-3 text-sm">
            <Link className="text-white/70 hover:text-white" href="/store">
              Store
            </Link>
            <Link className="text-white/70 hover:text-white" href="/qr/scan">
              Scan QR
            </Link>
            <Link className="rounded-xl bg-white/10 px-3 py-2 hover:bg-white/15" href="/sign-in">
              Sign in
            </Link>
            <Link className="rounded-xl bg-linear-to-r from-blue-500 to-sky-400 px-3 py-2 font-semibold text-black" href="/sign-up">
              Get started
            </Link>
          </nav>
        </header>

        <main className="mt-16 grid gap-10 lg:grid-cols-2 lg:items-center">
          <section>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight">
              One AI-driven operating system for modern operations teams.
            </h1>
            <p className="mt-4 text-white/70 leading-relaxed">
              SmartOps Lite merges ERP, CRM, HR, production, inventory, analytics, and e-commerce into a single secure platform.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link className="rounded-xl bg-linear-to-r from-blue-500 to-sky-400 px-4 py-2 text-sm font-semibold text-black" href="/sign-up">
                Create company
              </Link>
              <Link className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15" href="/store">
                Browse store
              </Link>
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { title: "Production", desc: "Track stages, delays, and bottlenecks." },
                { title: "Inventory", desc: "Real-time stock, movements, low-stock alerts." },
                { title: "HR Portal", desc: "Attendance, leave, reports, documents." },
                { title: "E-commerce", desc: "Catalog, orders, invoices, support." },
                { title: "CRM", desc: "Clients, suppliers, leads, reliability." },
                { title: "AI Assistant", desc: "Insights, forecasts, recommendations." },
              ].map((x) => (
                <div key={x.title} className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <div className="font-semibold">{x.title}</div>
                  <div className="mt-1 text-sm text-white/70">{x.desc}</div>
                </div>
              ))}
            </div>
          </section>
        </main>

        <section className="mt-14">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">Featured products</h2>
              <p className="mt-1 text-sm text-white/60">From demo stores (seeded data).</p>
            </div>
            <Link className="text-sm text-blue-300 hover:text-blue-200" href="/store">
              View all →
            </Link>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => (
              <Link
                key={p.id}
                href={`/store/${p.organization.slug}/products/${p.id}`}
                className="rounded-2xl border border-white/10 bg-black/30 p-5 hover:bg-white/5"
              >
                <div className="text-xs text-white/60">{p.organization.name}</div>
                <div className="mt-2 font-semibold">{p.name}</div>
                <div className="mt-1 text-sm text-white/70">{p.description ?? ""}</div>
                <div className="mt-3 text-sm font-semibold">{new Intl.NumberFormat("fr-DZ").format(p.priceDzd)} DA</div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
