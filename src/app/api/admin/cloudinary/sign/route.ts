import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { getCloudinary } from "@/lib/cloudinary";

const bodySchema = z
  .object({
    folder: z.string().min(1).max(120).optional(),
  })
  .strict();

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "COMPANY_ADMIN" || !session.user.organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  let cloudName: string;
  let apiKey: string;
  let signature: string;
  let timestamp: number;
  let folder: string;

  try {
    const cfg = getCloudinary();
    cloudName = cfg.cloudName;
    apiKey = cfg.apiKey;

    timestamp = Math.floor(Date.now() / 1000);
    folder = parsed.data.folder ?? `smartops-lite/${session.user.organizationId}/products`;

    signature = cfg.cloudinary.utils.api_sign_request({ folder, timestamp }, process.env.CLOUDINARY_API_SECRET as string);
  } catch {
    return NextResponse.json({ error: "Cloudinary is not configured" }, { status: 500 });
  }

  return NextResponse.json({
    cloudName,
    apiKey,
    timestamp,
    folder,
    signature,
  });
}
