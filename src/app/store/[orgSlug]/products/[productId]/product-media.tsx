"use client";

import Image from "next/image";
import { useMemo } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ProductMedia({
  title,
  images,
  tutorialVideoUrl,
}: {
  title: string;
  images: string[];
  tutorialVideoUrl: string | null;
}) {
  const safeImages = useMemo(() => {
    return images
      .filter((src) => typeof src === "string")
      .map((src) => (src.startsWith("/") ? src : `/${src}`))
      .filter((src) => src.startsWith("/") && !src.startsWith("//"));
  }, [images]);

  const safeVideoUrl = useMemo(() => {
    if (!tutorialVideoUrl) return null;
    if (tutorialVideoUrl.startsWith("http://") || tutorialVideoUrl.startsWith("https://")) return tutorialVideoUrl;
    if (tutorialVideoUrl.startsWith("/")) return tutorialVideoUrl;
    return `/${tutorialVideoUrl}`;
  }, [tutorialVideoUrl]);

  if (safeImages.length === 0 && !safeVideoUrl) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Media</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {safeVideoUrl ? (
          <div className="overflow-hidden rounded-xl border border-white/10 bg-black">
            <video controls className="aspect-video w-full">
              <source src={safeVideoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        ) : null}

        {safeImages.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {safeImages.slice(0, 4).map((src) => (
              <a
                key={src}
                href={src}
                target="_blank"
                rel="noreferrer"
                className="overflow-hidden rounded-xl border border-white/10 bg-black/30"
              >
                <div className="relative h-56 w-full">
                  <Image
                    src={src}
                    alt={title}
                    fill
                    sizes="(min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                    unoptimized={src.startsWith("/we/")}
                  />
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="text-sm text-white/70">No images available.</div>
        )}
      </CardContent>
    </Card>
  );
}
