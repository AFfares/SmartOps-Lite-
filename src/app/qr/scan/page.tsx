"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

declare global {
  // BarcodeDetector is not yet in TS lib.dom for all targets.
  // eslint-disable-next-line no-var
  var BarcodeDetector: undefined | (new (opts: { formats: string[] }) => { detect: (video: HTMLVideoElement) => Promise<Array<{ rawValue: string }>> });
}

export default function QrScanPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [manualValue, setManualValue] = useState("");
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let stop = false;

    async function start() {
      setError(null);

      if (!videoRef.current) return;

      if (!navigator.mediaDevices?.getUserMedia) {
        setError("Camera not available in this browser.");
        return;
      }

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });

        videoRef.current.srcObject = stream;
        await videoRef.current.play();

        if (!globalThis.BarcodeDetector) {
          setError("QR scanning is not supported here. Use manual input below.");
          return;
        }

        const detector = new globalThis.BarcodeDetector({ formats: ["qr_code"] });

        const loop = async () => {
          if (stop) return;
          if (!videoRef.current) return;

          try {
            const barcodes = await detector.detect(videoRef.current);
            const raw = barcodes?.[0]?.rawValue;
            if (raw) {
              stop = true;
              router.push(`/qr/${encodeURIComponent(raw)}`);
              return;
            }
          } catch {
            // Ignore detection errors and keep scanning.
          }

          requestAnimationFrame(loop);
        };

        requestAnimationFrame(loop);
      } catch {
        setError("Camera permission denied or unavailable.");
      }
    }

    if (isScanning) void start();

    return () => {
      stop = true;
      if (stream) {
        for (const t of stream.getTracks()) t.stop();
      }
    };
  }, [isScanning, router]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">QR Scanner</h1>
        <p className="mt-1 text-sm text-white/60">Scan a product QR code to open the tutorial video and manual.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Camera</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-black/30">
            <video ref={videoRef} className="h-full w-full object-cover" muted playsInline />
          </div>

          {error ? <div className="text-sm text-amber-200">{error}</div> : null}

          <div className="flex flex-wrap gap-2">
            <Button size="sm" type="button" onClick={() => setIsScanning(true)}>
              Start scanning
            </Button>
            <Button size="sm" variant="secondary" type="button" onClick={() => setIsScanning(false)}>
              Stop
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manual input</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-white/70">If your browser can’t scan, paste the QR content (e.g. <span className="text-white">product:cnc-minicut</span>).</div>
          <input
            className="w-full rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-sm"
            value={manualValue}
            onChange={(e) => setManualValue(e.target.value)}
            placeholder="product:..."
          />
          <Button
            size="sm"
            variant="secondary"
            type="button"
            onClick={() => {
              const v = manualValue.trim();
              if (!v) return;
              router.push(`/qr/${encodeURIComponent(v)}`);
            }}
          >
            Open
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
