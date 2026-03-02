import { NextResponse } from "next/server";
import { getCache, setCache, isCacheStale } from "@/lib/indicadores/indicator-cache";
import { fetchAllLive } from "@/lib/indicadores/live-fetcher";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cached = getCache();

    if (cached && !isCacheStale()) {
      return NextResponse.json(
        { ...cached, cached: true },
        { headers: { "Cache-Control": "s-maxage=3600, stale-while-revalidate=7200" } }
      );
    }

    try {
      const fresh = await fetchAllLive();

      if (fresh.indicators.length > 0) {
        setCache(fresh);
      }

      return NextResponse.json(
        { ...fresh, cached: false },
        { headers: { "Cache-Control": "s-maxage=3600, stale-while-revalidate=7200" } }
      );
    } catch {
      if (cached) {
        return NextResponse.json(
          { ...cached, cached: true, stale: true },
          { headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=3600" } }
        );
      }

      return NextResponse.json(
        { indicators: [], fetchedAt: new Date().toISOString(), errors: ["All fetchers failed and no cache available"], cached: false },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error("[api/indicadores/live] Unexpected error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
