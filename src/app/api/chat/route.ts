import { NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  prompt: z.string().min(3).max(4000),
});

export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI not configured. Set OPENROUTER_API_KEY in .env" },
      { status: 501 }
    );
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": process.env.OPENROUTER_REFERER ?? "http://localhost:3000",
      "X-Title": process.env.OPENROUTER_APP_NAME ?? "SmartOps Lite",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL ?? "google/gemini-2.0-flash-001",
      messages: [{ role: "user", content: parsed.data.prompt }],
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    return NextResponse.json(
      { error: `AI request failed (${response.status}). ${text.slice(0, 500)}`.trim() },
      { status: 502 }
    );
  }

  const data = (await response.json().catch(() => null)) as unknown;
  return NextResponse.json(data);
}