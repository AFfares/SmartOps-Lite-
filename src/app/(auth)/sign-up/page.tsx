import Link from "next/link";

import { signUpCompanyAdmin, signUpCustomer, signUpEmployee } from "./actions";

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="min-h-[calc(100vh-0px)] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-5xl rounded-2xl border border-white/10 bg-black/40 backdrop-blur p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Create your SmartOps Lite account</h1>
            <p className="mt-1 text-sm text-white/70">Choose the correct portal: Company, Employee, or Customer.</p>
          </div>
          <Link className="text-sm text-white/70 hover:text-white" href="/sign-in">
            Already have an account?
          </Link>
        </div>

        {error ? (
          <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
            Sign-up failed: {error}
          </div>
        ) : null}

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-white/10 bg-black/50 p-5">
            <h2 className="text-lg font-semibold">Company / Admin</h2>
            <p className="mt-1 text-sm text-white/70">Create a company and the first admin account.</p>
            <form className="mt-4 space-y-3" action={signUpCompanyAdmin}>
              <label className="block">
                <span className="text-sm text-white/80">Company name</span>
                <input className="mt-1 w-full rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-sm" name="companyName" required />
              </label>
              <label className="block">
                <span className="text-sm text-white/80">Company slug</span>
                <input className="mt-1 w-full rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-sm" name="companySlug" placeholder="demo-factory-dz" required />
              </label>
              <label className="block">
                <span className="text-sm text-white/80">Admin name</span>
                <input className="mt-1 w-full rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-sm" name="adminName" required />
              </label>
              <label className="block">
                <span className="text-sm text-white/80">Email</span>
                <input className="mt-1 w-full rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-sm" name="email" type="email" required />
              </label>
              <label className="block">
                <span className="text-sm text-white/80">Password</span>
                <input className="mt-1 w-full rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-sm" name="password" type="password" minLength={8} required />
              </label>
              <button className="w-full rounded-xl bg-linear-to-r from-blue-500 to-sky-400 px-3 py-2 text-sm font-semibold text-black" type="submit">
                Create company
              </button>
            </form>
          </section>

          <section className="rounded-2xl border border-white/10 bg-black/50 p-5">
            <h2 className="text-lg font-semibold">Employee</h2>
            <p className="mt-1 text-sm text-white/70">Join your company using a Join Code (or QR).</p>
            <form className="mt-4 space-y-3" action={signUpEmployee}>
              <label className="block">
                <span className="text-sm text-white/80">Full name</span>
                <input className="mt-1 w-full rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-sm" name="name" required />
              </label>
              <label className="block">
                <span className="text-sm text-white/80">Email</span>
                <input className="mt-1 w-full rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-sm" name="email" type="email" required />
              </label>
              <label className="block">
                <span className="text-sm text-white/80">Password</span>
                <input className="mt-1 w-full rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-sm" name="password" type="password" minLength={8} required />
              </label>
              <label className="block">
                <span className="text-sm text-white/80">Company join code</span>
                <input className="mt-1 w-full rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-sm" name="joinCode" placeholder="DZ-DEMO-2026" required />
              </label>
              <button className="w-full rounded-xl bg-white/90 px-3 py-2 text-sm font-semibold text-black" type="submit">
                Request to join
              </button>
              <p className="text-xs text-white/60">After submitting, the company admin must approve your request.</p>
            </form>
          </section>

          <section className="rounded-2xl border border-white/10 bg-black/50 p-5">
            <h2 className="text-lg font-semibold">Customer</h2>
            <p className="mt-1 text-sm text-white/70">Create a store account to order products.</p>
            <form className="mt-4 space-y-3" action={signUpCustomer}>
              <label className="block">
                <span className="text-sm text-white/80">Full name</span>
                <input className="mt-1 w-full rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-sm" name="name" required />
              </label>
              <label className="block">
                <span className="text-sm text-white/80">Email</span>
                <input className="mt-1 w-full rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-sm" name="email" type="email" required />
              </label>
              <label className="block">
                <span className="text-sm text-white/80">Password</span>
                <input className="mt-1 w-full rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-sm" name="password" type="password" minLength={8} required />
              </label>
              <label className="block">
                <span className="text-sm text-white/80">Company slug</span>
                <input className="mt-1 w-full rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-sm" name="companySlug" placeholder="demo-factory-dz" required />
              </label>
              <button className="w-full rounded-xl bg-white/90 px-3 py-2 text-sm font-semibold text-black" type="submit">
                Create customer account
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
