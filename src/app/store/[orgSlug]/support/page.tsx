import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { submitSupportRequest } from "./actions";

export default async function StoreSupportPage({
  params,
  searchParams,
}: {
  params: Promise<{ orgSlug: string }>;
  searchParams: Promise<{ product?: string; invoice?: string }>;
}) {
  const { orgSlug } = await params;
  const sp = await searchParams;

  const org = await db.organization.findUnique({
    where: { slug: orgSlug },
    select: { name: true },
  });

  const contextId = sp.product ?? sp.invoice ?? "";
  const defaultType = sp.invoice ? "INVOICE" : sp.product ? "QUOTE" : "SUPPORT";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Support</h1>
        <p className="mt-1 text-sm text-white/60">Send a quote request, invoice request, or support question to {org?.name ?? orgSlug}.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Request form</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={submitSupportRequest} className="grid gap-3 md:grid-cols-2">
            <input type="hidden" name="orgSlug" value={orgSlug} />
            <input type="hidden" name="contextId" value={contextId} />

            <label className="block md:col-span-2">
              <span className="text-sm text-white/80">Your name</span>
              <input className="mt-1 w-full rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-sm" name="name" required />
            </label>

            <label className="block">
              <span className="text-sm text-white/80">Email (optional)</span>
              <input className="mt-1 w-full rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-sm" name="email" type="email" />
            </label>

            <label className="block">
              <span className="text-sm text-white/80">Phone (optional)</span>
              <input className="mt-1 w-full rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-sm" name="phone" />
            </label>

            <label className="block md:col-span-2">
              <span className="text-sm text-white/80">Request type</span>
              <select className="mt-1 w-full rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-sm" name="requestType" defaultValue={defaultType}>
                <option value="QUOTE">Quote request</option>
                <option value="INVOICE">Official invoice request</option>
                <option value="SUPPORT">Support question</option>
              </select>
            </label>

            <label className="block md:col-span-2">
              <span className="text-sm text-white/80">Message</span>
              <textarea className="mt-1 w-full rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-sm" name="message" rows={5} required placeholder="Describe what you need (quantity, delivery wilaya, company name, etc.)" />
            </label>

            <div className="md:col-span-2">
              <Button size="sm" type="submit">Send request</Button>
            </div>

            {contextId ? (
              <div className="md:col-span-2 text-xs text-white/60">Context: {contextId}</div>
            ) : null}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
