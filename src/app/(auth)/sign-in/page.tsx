"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSession, signIn, signOut } from "next-auth/react";

function safeCallbackUrl(input: string | null) {
  if (!input) return "/";
  // Prevent open redirects: only allow same-origin relative paths.
  if (input.startsWith("/") && !input.startsWith("//")) return input;
  return "/";
}

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [callbackUrl, setCallbackUrl] = useState("/");
  const [pendingApproval, setPendingApproval] = useState(false);

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    setCallbackUrl(safeCallbackUrl(sp.get("callbackUrl")));
    setPendingApproval(sp.get("pending") === "1");
  }, []);

  return (
    <div className="min-h-[calc(100vh-0px)] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-black/40 backdrop-blur p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]">
        <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
      <p className="mt-1 text-sm text-white/70">SmartOps Lite</p>

        {pendingApproval ? (
          <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-100">
            Your employee join request is pending approval by the company admin.
            <div className="mt-2 flex gap-2">
              <button
                className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/15"
                type="button"
                onClick={() => window.location.reload()}
              >
                Refresh
              </button>
              <button
                className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/15"
                type="button"
                onClick={() => signOut({ callbackUrl: "/sign-in" })}
              >
                Sign out
              </button>
            </div>
          </div>
        ) : null}

        <form
          className="mt-6 space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            setLoading(true);
            try {
              const res = await signIn("credentials", {
                email,
                password,
                redirect: false,
                callbackUrl,
              });

              if (!res || res.error) {
                setError("Invalid email or password.");
                return;
              }

              // If user just signed in from /sign-in directly, callbackUrl is usually "/".
              // In that case, route users to their correct portal based on role.
              const target = res.url ?? callbackUrl;
              if (target === "/") {
                const session = await getSession();
                const role = session?.user?.role;

                if (role === "COMPANY_ADMIN") {
                  window.location.href = "/admin/overview";
                  return;
                }

                if (role === "EMPLOYEE") {
                  window.location.href = "/employee/dashboard";
                  return;
                }

                if (role === "CUSTOMER") {
                  window.location.href = "/customer/dashboard";
                  return;
                }
              }

              window.location.href = target;
            } finally {
              setLoading(false);
            }
          }}
        >
          <label className="block">
            <span className="text-sm text-white/80">Email</span>
            <input
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/40"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoComplete="email"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm text-white/80">Password</span>
            <input
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/40"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="current-password"
              required
            />
          </label>

          {error ? <p className="text-sm text-red-400">{error}</p> : null}

          <button
            disabled={loading}
            className="w-full rounded-xl bg-linear-to-r from-blue-500 to-sky-400 px-3 py-2 text-sm font-semibold text-black disabled:opacity-60"
            type="submit"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <Link className="block text-center text-sm text-white/70 hover:text-white" href="/sign-up">
            Create an account
          </Link>
        </form>

        <div className="mt-6 rounded-xl border border-white/10 bg-black/50 p-3 text-xs text-white/70">
          <div className="font-semibold text-white/80">Demo accounts (after seeding):</div>
          <ul className="mt-2 space-y-1">
            <li>Admin: admin@smartops-lite.com / Admin123!</li>
            <li>Employee: employee1@smartops-lite.com / Admin123!</li>
            <li>Customer: customer1@smartops-lite.com / Admin123!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
