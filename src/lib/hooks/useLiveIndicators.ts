"use client";

import { useState, useEffect } from "react";
import type { LiveIndicator } from "@/lib/indicadores/live-fetcher";

interface UseLiveIndicatorsResult {
  liveData: Map<string, LiveIndicator> | null;
  isLoading: boolean;
  lastUpdated: string | null;
}

export function useLiveIndicators(): UseLiveIndicatorsResult {
  const [liveData, setLiveData] = useState<Map<string, LiveIndicator> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchLive() {
      try {
        const res = await fetch("/api/indicadores/live");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        if (cancelled) return;

        if (data.indicators && Array.isArray(data.indicators)) {
          const map = new Map<string, LiveIndicator>();
          for (const indicator of data.indicators) {
            map.set(indicator.id, indicator);
          }
          setLiveData(map);
          setLastUpdated(data.fetchedAt ?? null);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("[useLiveIndicators] Fetch failed:", err instanceof Error ? err.message : err);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchLive();
    return () => { cancelled = true; };
  }, []);

  return { liveData, isLoading, lastUpdated };
}
