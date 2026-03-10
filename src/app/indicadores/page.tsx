"use client";

import { useMemo, useState } from "react";
import { BarChart3, Search, Download, Info } from "lucide-react";
import {
  INDICADORES_CATEGORIAS,
  INDICADORES_DESTACADOS_IDS,
  INDICADORES_MAP,
  INDICADORES_ITEMS,
  UVT_COMPARATIVO,
  INDICADORES_LAST_UPDATE,
  type IndicatorCategory,
  type IndicatorItem,
} from "@/config/indicadores-data";
import { ReferencePageLayout } from "@/components/layout/ReferencePageLayout";
import { IndicatorsHero } from "@/components/indicators/IndicatorsHero";
import { IndicatorTrendChart } from "@/components/indicators/IndicatorTrendChart";
import { UvtCopInlineCalculator } from "@/components/indicators/UvtCopInlineCalculator";
import { UvtYoyTable } from "@/components/indicators/UvtYoyTable";
import { IndicatorCard } from "@/components/indicators/IndicatorCard";
import { Toast } from "@/components/ui/Toast";
import { useLiveIndicators } from "@/lib/hooks/useLiveIndicators";

function useFilteredCategories(search: string): IndicatorCategory[] {
  return useMemo(() => {
    if (!search.trim()) return INDICADORES_CATEGORIAS;

    const lowerSearch = search.toLowerCase().trim();
    return INDICADORES_CATEGORIAS.map((category) => ({
      ...category,
      items: category.items.filter(
        (item) =>
          item.nombre.toLowerCase().includes(lowerSearch) ||
          item.valor.toLowerCase().includes(lowerSearch) ||
          item.paraQueSirve.toLowerCase().includes(lowerSearch) ||
          item.fechaCorte.toLowerCase().includes(lowerSearch)
      ),
    })).filter((category) => category.items.length > 0);
  }, [search]);
}

export default function IndicadoresPage() {
  const [search, setSearch] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const { liveData, lastUpdated } = useLiveIndicators();

  const highlightedIndicators = INDICADORES_DESTACADOS_IDS.map((id) => INDICADORES_MAP[id]).filter(
    Boolean
  ) as IndicatorItem[];
  const filteredCategories = useFilteredCategories(search);
  const uvtValue = INDICADORES_MAP.uvt?.valorNumerico ?? 0;

  const triggerToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2200);
  };

  const handleCopy = async (item: IndicatorItem) => {
    const payload = item.valorNumerico.toString();
    try {
      await navigator.clipboard.writeText(payload);
      triggerToast(`Valor copiado: ${item.nombre}`);
    } catch {
      triggerToast("No fue posible copiar el valor");
    }
  };

  const handleExportCsv = () => {
    const headers = ["Indicador", "Valor", "Unidad", "Fecha de Corte", "Categoría", "Para qué sirve"];
    const rows = INDICADORES_ITEMS.map((item) => [
      item.nombre,
      item.valor,
      item.unidad,
      item.fechaCorte,
      item.categoria,
      `"${item.paraQueSirve.replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers, ...rows].map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `indicadores-economicos-${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <ReferencePageLayout
      title="Indicadores Económicos 2026"
      description="Monitorea los indicadores críticos para cálculos tributarios, convierte UVT en segundos y proyecta decisiones con contexto histórico."
      icon={BarChart3}
      updatedAt={INDICADORES_LAST_UPDATE}
      rightContent={
        <button
          onClick={handleExportCsv}
          className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          <Download className="h-4 w-4" />
          Exportar CSV
        </button>
      }
    >
      <IndicatorsHero indicators={highlightedIndicators} liveOverrides={liveData ?? undefined} />

      <div className="grid gap-4 lg:grid-cols-2">
        <UvtCopInlineCalculator uvtValue={uvtValue} />
        <UvtYoyTable rows={UVT_COMPARATIVO} />
      </div>

      <section className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar indicador, utilidad o fecha de corte..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-12 w-full rounded border border-border bg-card pl-10 pr-3 text-sm outline-none focus:border-foreground/40 focus:ring-1 focus:ring-foreground/20"
          />
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {filteredCategories.length > 0 ? (
            filteredCategories.map((category) => (
              <section key={category.id} className="rounded-lg border border-border/60 bg-card p-5 shadow-sm">
                <h2 className="heading-serif mb-3 text-xl text-foreground">{category.categoria}</h2>
                <div className="space-y-3">
                  {category.items.map((item) => (
                    <IndicatorCard key={item.id} item={item} onCopy={handleCopy} liveValue={liveData?.get(item.id)} />
                  ))}
                </div>
              </section>
            ))
          ) : (
            <div className="lg:col-span-2 rounded-lg border border-border/60 bg-muted/20 p-10 text-center">
              <p className="text-lg heading-serif text-foreground">Sin resultados</p>
              <p className="mt-2 text-sm text-muted-foreground">
                No encontramos ese indicador. Prueba con UVT, TRM o usura.
              </p>
            </div>
          )}
        </div>
      </section>

      <section>
        <h3 className="mb-3 heading-serif text-2xl text-foreground">Tendencias históricas clave (5-10 años)</h3>
        <div className="grid gap-4 lg:grid-cols-2">
          {highlightedIndicators.map((indicator) => (
            <IndicatorTrendChart key={indicator.id} indicator={indicator} />
          ))}
        </div>
      </section>

      <div className="rounded-lg border border-border/60 bg-muted/30 p-4 text-xs text-muted-foreground">
        <p className="flex items-center gap-2">
          <Info className="h-4 w-4 shrink-0" />
          <span>
            <strong>Nota de actualización:</strong> Datos base actualizados al {INDICADORES_LAST_UPDATE}.
            {lastUpdated && (
              <> TRM en vivo actualizada: {new Date(lastUpdated).toLocaleString("es-CO")}.</>
            )}{" "}
            Esta herramienta es de carácter informativo. Para liquidaciones oficiales y vinculantes, consulte siempre la fuente oficial
            (DIAN, Banco de la República, DANE) y verifique el corte diario si aplica.
          </span>
        </p>
      </div>

      <Toast message={toastMessage} visible={toastVisible} />
    </ReferencePageLayout>
  );
}
