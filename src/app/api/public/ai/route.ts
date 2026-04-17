import { z } from "zod";

const bodySchema = z.object({
  prompt: z.string().min(3).max(2000),
});

export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const systemPrompt =
    "You are SmartOps Lite customer product assistant. Be concise, practical, and safety-aware. If you lack company-specific product data, ask clarifying questions.";

  const openRouterKey = process.env.OPENROUTER_API_KEY;
  const openAiKey = process.env.OPENAI_API_KEY;

  const provider: "openrouter" | "openai" | null = openRouterKey ? "openrouter" : openAiKey ? "openai" : null;
  if (!provider) {
    return Response.json(
      { error: "AI not configured. Set OPENROUTER_API_KEY or OPENAI_API_KEY in .env" },
      { status: 501 }
    );
  }

  const upstreamUrl =
    provider === "openrouter" ? "https://openrouter.ai/api/v1/chat/completions" : "https://api.openai.com/v1/chat/completions";

  const res = await fetch(upstreamUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${provider === "openrouter" ? openRouterKey : openAiKey}`,
      "Content-Type": "application/json",
      ...(provider === "openrouter"
        ? {
            "HTTP-Referer": process.env.OPENROUTER_REFERER ?? "http://localhost:3000",
            "X-Title": process.env.OPENROUTER_APP_NAME ?? "SmartOps Lite",
          }
        : {}),
    },
    body: JSON.stringify({
      model:
        provider === "openrouter"
          ? process.env.OPENROUTER_MODEL ?? "google/gemini-2.0-flash-001"
          : process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      stream: true,
      temperature: 0.4,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: parsed.data.prompt },
      ],
    }),
  });

  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => "");
    return Response.json(
      { error: `AI request failed (${res.status}). ${text.slice(0, 500)}`.trim() },
      { status: 502 }
    );
  }

  return new Response(res.body, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
    },
  });
}