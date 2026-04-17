"use client";

import { signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";

export function Topbar({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-800/60 bg-slate-950/30 px-5 py-4 backdrop-blur">
      <div className="text-sm font-semibold text-slate-100">{title}</div>
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            void signOut({ callbackUrl: "/" });
          }}
        >
          Sign out
        </Button>
      </div>
    </div>
  );
}
