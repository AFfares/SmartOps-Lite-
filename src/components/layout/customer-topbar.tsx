"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { signOut } from "next-auth/react";
import { Bell, QrCode, Search, ShoppingCart, UserCircle2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type CustomerTopbarProps = {
  title?: string;
  customerName?: string | null;
};

export function CustomerTopbar({ title = "Customer Dashboard", customerName }: CustomerTopbarProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const displayName = useMemo(() => {
    if (customerName && customerName.trim().length > 0) return customerName;
    return "Customer";
  }, [customerName]);

  return (
    <div className="flex flex-col gap-3 border-b border-slate-800/60 bg-slate-950/30 px-5 py-4 backdrop-blur lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-3">
        <div className="text-sm font-semibold text-slate-100">{title}</div>
        <Badge className="hidden lg:inline-flex">Welcome, {displayName}</Badge>
      </div>

      <div className="flex flex-1 items-center gap-3 lg:justify-end">
        <form
          className="relative w-full max-w-xl"
          onSubmit={(e) => {
            e.preventDefault();
            const trimmed = query.trim();
            if (!trimmed) return;
            router.push(`/store?search=${encodeURIComponent(trimmed)}`);
          }}
        >
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, parts, manuals…"
            className="h-10 w-full rounded-xl border border-slate-800/60 bg-slate-950/40 pl-10 pr-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-400/30"
          />
        </form>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/customer/scan">
              <QrCode className="h-4 w-4" />
              <span className="hidden sm:inline">QR Scan</span>
            </Link>
          </Button>

          <Button variant="ghost" size="sm" aria-label="Cart">
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden xl:inline">Cart</span>
            <Badge className="ml-1">0</Badge>
          </Button>

          <Button variant="ghost" size="sm" aria-label="Notifications">
            <Bell className="h-4 w-4" />
            <span className="hidden xl:inline">Notifications</span>
            <Badge className="ml-1">0</Badge>
          </Button>

          <details className="relative">
            <summary className="list-none">
              <Button variant="secondary" size="sm" type="button">
                <UserCircle2 className="h-4 w-4" />
                <span className="hidden xl:inline">{displayName}</span>
              </Button>
            </summary>

            <div className="absolute right-0 z-20 mt-2 w-48 rounded-2xl border border-slate-800/60 bg-slate-950/90 p-2 shadow-[0_0_0_1px_rgba(2,6,23,0.35)]">
              <Link
                href="/customer/profile"
                className="block rounded-xl px-3 py-2 text-sm text-slate-100/80 hover:bg-slate-800/40 hover:text-slate-100"
              >
                Profile
              </Link>
              <button
                className="block w-full rounded-xl px-3 py-2 text-left text-sm text-slate-100/80 hover:bg-slate-800/40 hover:text-slate-100"
                type="button"
                onClick={() => {
                  void signOut({ callbackUrl: "/" });
                }}
              >
                Sign out
              </button>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}
