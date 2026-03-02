import { NextResponse } from "next/server";
import { setCache } from "@/lib/indicadores/indicator-cache";
import { fetchAllLive } from "@/lib/indicadores/live-fetcher";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[cron/indicadores] Starting scheduled fetch...");

    const result = await fetchAllLive();

    if (result.indicators.length > 0) {
      setCache(result);
    }

    console.log(
      `[cron/indicadores] Completed. Fetched: ${result.indicators.map((i) => i.id).join(", ")}. Errors: ${result.errors.length > 0 ? result.errors.join("; ") : "none"}`
    );

    return NextResponse.json({
      success: true,
      fetched: result.indicators.map((i) => i.id),
      errors: result.errors,
      fetchedAt: result.fetchedAt,
    });
  } catch (error) {
    console.error("[cron/indicadores] Fatal error:", error);
    return NextResponse.json({ error: "Cron job failed" }, { status: 500 });
  }
}
