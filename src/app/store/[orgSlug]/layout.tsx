import Link from "next/link";

import { db } from "@/lib/db";

export default async function StoreLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const org = await db.organization.findUnique({ where: { slug: orgSlug }, select: { name: true } });

  return (
    <div className="min-h-screen">
      <header className="border-b border-white/10 bg-black/20 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link className="text-sm font-semibold tracking-tight" href="/">
            SmartOps Lite
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link className="text-white/70 hover:text-white" href={`/store/${orgSlug}`}>
              Home
            </Link>
            <Link className="text-white/70 hover:text-white" href={`/store/${orgSlug}/products`}>
              Products
            </Link>
            <Link className="text-white/70 hover:text-white" href={`/store/${orgSlug}/support`}>
              Support
            </Link>
            <Link className="rounded-xl bg-white/10 px-3 py-2 hover:bg-white/15" href="/sign-in">
              Sign in
            </Link>
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="text-xs text-white/60">Store: {org?.name ?? orgSlug}</div>
        {children}
      </div>
    </div>
  );
}
