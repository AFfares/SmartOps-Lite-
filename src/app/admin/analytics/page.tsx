import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AnalyticsPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="mt-1 text-sm text-white/60">Sales trends, profitability reports, and smart forecasts.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Smart analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-white/70">Connect revenue, expenses, production downtime, and unpaid invoices to explain profit changes.</div>
        </CardContent>
      </Card>
    </div>
  );
}
