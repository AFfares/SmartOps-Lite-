"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

function randomId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

type SseChunk = {
  choices?: Array<{
    delta?: { content?: string };
    text?: string;
  }>;
};

function extractSseTextDelta(json: unknown): string {
  const chunk = json as SseChunk;
  // OpenAI-style streaming: choices[0].delta.content
  const deltaContent = chunk?.choices?.[0]?.delta?.content;
  if (typeof deltaContent === "string") return deltaContent;

  // Some providers use: choices[0].text
  const text = chunk?.choices?.[0]?.text;
  if (typeof text === "string") return text;

  return "";
}

async function readSseStream(res: Response, onText: (t: string) => void) {
  if (!res.body) return;

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // SSE events are separated by blank lines.
    const events = buffer.split("\n\n");
    buffer = events.pop() ?? "";

    for (const evt of events) {
      const lines = evt.split("\n");
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;

        const data = trimmed.slice(5).trim();
        if (!data) continue;
        if (data === "[DONE]") return;

        try {
          const json = JSON.parse(data);
          const delta = extractSseTextDelta(json);
          if (delta) onText(delta);
        } catch {
          // ignore malformed chunks
        }
      }
    }
  }
}

export default function AdminAiPage() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const suggestions = useMemo(
    () => [
      "Why did profits drop this month?",
      "Which stock will run out soon?",
      "Summarize pending orders and next actions.",
    ],
    []
  );

  async function handleAsk(nextPrompt?: string) {
    const content = (nextPrompt ?? prompt).trim();
    if (content.length < 3 || loading) return;

    setError(null);
    setLoading(true);

    const userMsg: ChatMessage = { id: randomId(), role: "user", content };
    const assistantId = randomId();
    const assistantMsg: ChatMessage = { id: assistantId, role: "assistant", content: "" };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setPrompt("");

    try {
      const res = await fetch("/api/admin/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: content }),
      });

      if (!res.ok) {
        const json = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(json?.error ?? `Request failed (${res.status})`);
      }

      await readSseStream(res, (delta) => {
        setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + delta } : m)));
      });

      setMessages((prev) => prev.map((m) => (m.id === assistantId && m.content.trim().length === 0 ? { ...m, content: "(No response)" } : m)));
    } catch (e) {
      const message = e instanceof Error ? e.message : "AI request failed";
      setError(message);
      setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, content: "AI is not configured or request failed." } : m)));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Company AI Assistant</h1>
        <p className="mt-1 text-sm text-white/60">
          Ask: “Why profits dropped?”, “Which stock runs out soon?”, “Suggest marketing campaigns.”
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
        <textarea
          className="w-full resize-none rounded-xl border border-white/10 bg-black/60 p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/40"
          rows={4}
          placeholder="Example: Predict when Steel Sheets will run out based on recent movements."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            disabled={loading || prompt.trim().length < 3}
            onClick={() => handleAsk()}
          >
            {loading ? "Thinking..." : "Ask"}
          </Button>

          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              disabled={loading}
              onClick={() => handleAsk(s)}
              className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-white/70 hover:bg-black/50 disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>
        {error ? <div className="mt-3 text-xs text-red-300">{error}</div> : null}
      </div>

      {messages.length > 0 ? (
        <div className="space-y-3">
          {messages.map((m) => (
            <div
              key={m.id}
              className={
                m.role === "user"
                  ? "ml-auto max-w-4xl rounded-2xl border border-white/10 bg-blue-500/10 p-4 text-sm text-white/90"
                  : "mr-auto max-w-4xl rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80"
              }
            >
              <div className="text-xs text-white/50">{m.role === "user" ? "You" : "Assistant"}</div>
              <div className="mt-2 whitespace-pre-wrap">{m.content}</div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
