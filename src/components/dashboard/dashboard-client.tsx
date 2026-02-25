"use client";

import { useMemo, useState } from "react";
import { TimeRangeFilter } from "@/components/dashboard/time-range-filter";
import { ActionKpiCards } from "@/components/dashboard/action-kpi-cards";
import { ReformDrilldownChart } from "@/components/dashboard/reform-drilldown-chart";
import { LibroTreemapChart } from "@/components/dashboard/libro-treemap-chart";
import { TopModifiedTable } from "@/components/dashboard/top-modified-table";
import { TopReferencedTrendTable } from "@/components/dashboard/top-referenced-trend-table";
import { DashboardExportActions } from "@/components/dashboard/dashboard-export-actions";
import { InsightCards } from "@/components/dashboard/insight-cards";

interface DashboardStats {
  total_articles: number;
  libro_distribution: Array<{ name: string; value: number }>;
  top_modified: Array<{
    id: string;
    slug: string;
    titulo: string;
    total_mods: number;
    estado: string;
  }>;
  top_referenced: Array<{
    id: string;
    slug: string;
    titulo: string;
    total_refs: number;
    estado: string;
  }>;
}

interface DashboardRange {
  key: "historico" | "ultima_reforma" | "ultimos_12_meses";
  label: string;
  modified_articles: number;
  modified_percentage: number;
  with_normas: number;
  with_derogado_text: number;
  granularity: "year";
  note?: string;
}

interface DashboardTimeSeries {
  latest_year: number;
  granularity_notice: string;
  ranges: DashboardRange[];
  reform_timeline: Array<{
    year: number;
    total: number;
    laws: Array<{ name: string; count: number }>;
  }>;
  article_modification_trends: Array<{
    slug: string;
    series: Array<{ year: number; count: number }>;
  }>;
}

interface DashboardClientProps {
  stats: DashboardStats;
  timeseries: DashboardTimeSeries;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  articleIndex: any[];
  lastUpdate?: string;
}

export function DashboardClient({ stats, timeseries, articleIndex, lastUpdate }: DashboardClientProps) {
  const [rangeKey, setRangeKey] = useState<DashboardRange["key"]>("historico");
  const [selectedYear, setSelectedYear] = useState<number>(timeseries.latest_year);
  const [selectedLibro, setSelectedLibro] = useState<string | null>(null);

  const articleLibroMap = useMemo(() => {
    const map = new Map<string, string>();
    articleIndex.forEach(art => {
      if (art.slug && art.libro) map.set(art.slug, art.libro);
    });
    return map;
  }, [articleIndex]);

  const currentRange =
    timeseries.ranges.find((range) => range.key === rangeKey) || timeseries.ranges[0];

  const filteredTimeline = useMemo(() => {
    if (rangeKey === "historico") return timeseries.reform_timeline;
    return timeseries.reform_timeline.filter(
      (entry) => entry.year === timeseries.latest_year
    );
  }, [rangeKey, timeseries.latest_year, timeseries.reform_timeline]);

  const effectiveSelectedYear = useMemo(() => {
    if (filteredTimeline.length === 0) return timeseries.latest_year;
    if (filteredTimeline.some((entry) => entry.year === selectedYear)) {
      return selectedYear;
    }
    return filteredTimeline[filteredTimeline.length - 1].year;
  }, [filteredTimeline, selectedYear, timeseries.latest_year]);

  const topLaw = useMemo(() => {
    const map = new Map<string, number>();
    for (const entry of filteredTimeline) {
      for (const law of entry.laws) {
        map.set(law.name, (map.get(law.name) || 0) + law.count);
      }
    }
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)[0];
  }, [filteredTimeline]);

  const exportRows = filteredTimeline.map((entry) => ({
    year: entry.year,
    total_reformas: entry.total,
    leyes_distintas: entry.laws.length,
    ley_principal: entry.laws[0]?.name || "",
  }));

  const filteredTopModified = useMemo(() => {
    if (!selectedLibro) return stats.top_modified;
    return stats.top_modified.filter(art => articleLibroMap.get(art.slug) === selectedLibro);
  }, [selectedLibro, stats.top_modified, articleLibroMap]);

  const filteredTopReferenced = useMemo(() => {
    let result = stats.top_referenced;
    if (selectedLibro) {
      result = result.filter(art => articleLibroMap.get(art.slug) === selectedLibro);
    }
    return result;
  }, [selectedLibro, stats.top_referenced, articleLibroMap]);

  const sortedTrends = useMemo(() => {
    if (!selectedYear) return filteredTopReferenced;

    return [...filteredTopReferenced].sort((a, b) => {
      const trendA = timeseries.article_modification_trends.find(t => t.slug === a.slug);
      const trendB = timeseries.article_modification_trends.find(t => t.slug === b.slug);
      const valA = trendA?.series.find(s => s.year === selectedYear)?.count || 0;
      const valB = trendB?.series.find(s => s.year === selectedYear)?.count || 0;
      return valB - valA;
    });
  }, [selectedYear, filteredTopReferenced, timeseries.article_modification_trends]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center print:hidden">
        <div className="flex flex-col gap-1">
          <TimeRangeFilter
            value={rangeKey}
            onChange={(next) => {
              setRangeKey(next as DashboardRange["key"]);
              setSelectedYear(timeseries.latest_year);
            }}
            options={timeseries.ranges.map((range) => ({
              key: range.key,
              label: range.label,
              description: range.note,
            }))}
          />
          {lastUpdate && (
            <p className="text-[10px] text-muted-foreground">
              Última actualización: {new Date(lastUpdate).toLocaleString()}
            </p>
          )}
        </div>
        <DashboardExportActions
          filenamePrefix={`dashboard-et-${rangeKey}`}
          payload={{ stats, timeseries }}
          rowsForCsv={exportRows}
        />
      </div>

      <ActionKpiCards
        modifiedArticles={currentRange.modified_articles}
        modifiedPercentage={currentRange.modified_percentage}
        withNormas={currentRange.with_normas}
        withDerogadoText={currentRange.with_derogado_text}
        topLaw={topLaw || null}
      />

      <InsightCards stats={stats} timeseries={timeseries} />

      <div className="rounded-lg border border-border/60 bg-muted/20 px-4 py-2 text-xs text-muted-foreground print:hidden">
        {currentRange.note || timeseries.granularity_notice}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className={selectedLibro ? "opacity-50 pointer-events-none grayscale" : ""}>
          <ReformDrilldownChart
            data={filteredTimeline}
            selectedYear={effectiveSelectedYear}
            onYearSelect={setSelectedYear}
          />
        </div>
        <LibroTreemapChart
          data={stats.libro_distribution}
          selectedLibro={selectedLibro}
          onSelect={setSelectedLibro}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <TopModifiedTable 
          articles={filteredTopModified} 
          title={selectedLibro ? `Más modificados en ${selectedLibro}` : undefined}
        />
        <TopReferencedTrendTable
          articles={sortedTrends}
          trends={timeseries.article_modification_trends}
          title={selectedLibro ? `Más referenciados en ${selectedLibro}` : undefined}
        />
      </div>
    </div>
  );
}
