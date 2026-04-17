"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

type SignResponse = {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  signature: string;
};

async function signUpload(folder?: string): Promise<SignResponse> {
  const res = await fetch("/api/admin/cloudinary/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folder }),
  });
  const json = (await res.json()) as Partial<SignResponse> & { error?: string };
  if (!res.ok) throw new Error(json.error ?? "Sign failed");

  const required = ["cloudName", "apiKey", "timestamp", "folder", "signature"] as const;
  for (const k of required) {
    if (json[k] === undefined || json[k] === null) throw new Error("Invalid sign response");
  }

  return json as SignResponse;
}

async function uploadToCloudinary(file: File, folder?: string) {
  const signed = await signUpload(folder);

  const form = new FormData();
  form.append("file", file);
  form.append("api_key", signed.apiKey);
  form.append("timestamp", String(signed.timestamp));
  form.append("signature", signed.signature);
  form.append("folder", signed.folder);

  const uploadUrl = `https://api.cloudinary.com/v1_1/${signed.cloudName}/auto/upload`;
  const res = await fetch(uploadUrl, { method: "POST", body: form });
  const json = (await res.json()) as { secure_url?: string; error?: { message?: string } };
  if (!res.ok) throw new Error(json.error?.message ?? "Upload failed");
  if (!json.secure_url) throw new Error("Upload failed");
  return json.secure_url;
}

async function saveProductMedia(productId: string, kind: "image" | "manual" | "tutorialVideo", url: string) {
  const res = await fetch("/api/admin/catalog/product-media", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId, kind, url }),
  });

  const json = (await res.json()) as { ok?: true; error?: string };
  if (!res.ok) throw new Error(json.error ?? "Save failed");
  return json.ok === true;
}

function isTooLarge(file: File, maxMb: number) {
  return file.size > maxMb * 1024 * 1024;
}

export function MediaUploader({ productId, imagesCount }: { productId: string; imagesCount: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState<null | "image" | "manual" | "tutorialVideo">(null);
  const [err, setErr] = useState<string | null>(null);

  const imageRef = useRef<HTMLInputElement | null>(null);
  const manualRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLInputElement | null>(null);

  async function handle(kind: "image" | "manual" | "tutorialVideo", file: File | null) {
    if (!file) return;
    setErr(null);

    const maxMb = kind === "image" ? 15 : kind === "manual" ? 25 : 80;
    if (isTooLarge(file, maxMb)) {
      setErr(`File too large (max ${maxMb}MB).`);
      return;
    }

    setBusy(kind);
    try {
      const url = await uploadToCloudinary(file);
      await saveProductMedia(productId, kind, url);
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(null);
      if (imageRef.current) imageRef.current.value = "";
      if (manualRef.current) manualRef.current.value = "";
      if (videoRef.current) videoRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <div className="text-xs text-white/60">Images: {imagesCount}</div>
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={imageRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handle("image", e.target.files?.[0] ?? null)}
        />
        <Button size="sm" variant="secondary" type="button" disabled={busy !== null} onClick={() => imageRef.current?.click()}>
          {busy === "image" ? "Uploading..." : "Add image"}
        </Button>

        <input
          ref={manualRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => handle("manual", e.target.files?.[0] ?? null)}
        />
        <Button size="sm" variant="outline" type="button" disabled={busy !== null} onClick={() => manualRef.current?.click()}>
          {busy === "manual" ? "Uploading..." : "Set manual"}
        </Button>

        <input
          ref={videoRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(e) => handle("tutorialVideo", e.target.files?.[0] ?? null)}
        />
        <Button size="sm" variant="ghost" type="button" disabled={busy !== null} onClick={() => videoRef.current?.click()}>
          {busy === "tutorialVideo" ? "Uploading..." : "Set video"}
        </Button>
      </div>

      {err ? <div className="text-xs text-red-300">{err}</div> : null}
    </div>
  );
}
