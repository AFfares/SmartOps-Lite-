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

type ChatApiResponse = {
  choices?: Array<{
    message?: { content?: string };
  }>;
  error?: string;
};

export default function StoreAiPage() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const suggestions = useMemo(
    () => [
      "Which product fits my budget of 500k DA?",
      "Compare these two products and recommend one.",
      "What should I check before buying this part?",
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
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: content }),
      });

      if (!res.ok) {
        const json = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(json?.error ?? `Request failed (${res.status})`);
      }

      const data = (await res.json().catch(() => null)) as ChatApiResponse | null;
      const answer = data?.choices?.[0]?.message?.content;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: typeof answer === "string" && answer.trim().length > 0 ? answer : "(No response)" }
            : m
        )
      );
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
        <h1 className="text-2xl font-semibold tracking-tight">Product AI Assistant</h1>
        <p className="mt-1 text-sm text-white/60">Ask technical questions, compare models, or find the best option for your budget.</p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
        <textarea
          className="w-full resize-none rounded-xl border border-white/10 bg-black/60 p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/40"
          rows={4}
          placeholder="Example: Which product fits my small factory and budget of 500k DA?"
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
