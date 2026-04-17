"use client";

import { useEffect, useState } from "react";

type ApiArrayState<T> = {
  data: T[];
  loading: boolean;
  usingFallback: boolean;
  error: string | null;
};

export function useApiArray<T>(url: string, fallback: T[]): ApiArrayState<T> {
  const [state, setState] = useState<ApiArrayState<T>>({
    data: fallback,
    loading: true,
    usingFallback: true,
    error: null,
  });

  useEffect(() => {
    let alive = true;

    async function run() {
      try {
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const json = (await res.json()) as unknown;
        const arr = Array.isArray(json) ? (json as T[]) : [];

        if (!alive) return;

        if (arr.length === 0) {
          setState({ data: fallback, loading: false, usingFallback: true, error: null });
          return;
        }

        setState({ data: arr, loading: false, usingFallback: false, error: null });
      } catch (e) {
        if (!alive) return;
        const msg = e instanceof Error ? e.message : "Unknown error";
        setState({ data: fallback, loading: false, usingFallback: true, error: msg });
      }
    }

    void run();

    return () => {
      alive = false;
    };
  }, [url, fallback]);

  return state;
}
