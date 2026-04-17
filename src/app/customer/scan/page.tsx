import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function CustomerScanPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Scan QR</h1>
        <p className="mt-1 text-sm text-white/60">Scan a product QR to open the tutorial video and manual.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Scanner</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-white/70">
            Use your phone camera to scan the QR code printed on the product.
          </div>
          <Button asChild variant="secondary">
            <Link href="/qr/scan">Open QR scanner</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
