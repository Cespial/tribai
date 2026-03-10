"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search, Calendar, Filter, Table2, CalendarDays, ExternalLink, Newspaper } from "lucide-react";
import { clsx } from "clsx";
import { OBLIGACIONES, CALENDARIO_DISCLAIMER, CALENDARIO_LAST_UPDATE, CALENDARIO_FISCAL_YEAR } from "@/config/calendario-data";
import { NOVEDADES_ENRIQUECIDAS } from "@/config/novedades-data";
import { getRelacionObligacion } from "@/config/relaciones-tributarias";
import { ReferencePageLayout } from "@/components/layout/ReferencePageLayout";
import { AddToCalendarButton } from "@/components/calendar/AddToCalendarButton";
import { DeadlineStatusBadge } from "@/components/calendar/DeadlineStatusBadge";
import {
  CalendarRangeTabs,
  type CalendarRangeFilter,
} from "@/components/calendar/CalendarRangeTabs";
import { UpcomingDeadlinesPanel } from "@/components/calendar/UpcomingDeadlinesPanel";
import { ExportFilteredIcsButton } from "@/components/calendar/ExportFilteredIcsButton";
import { CalendarMonthGrid } from "@/components/calendar/CalendarMonthGrid";
import { MobileMonthSwipe } from "@/components/calendar/MobileMonthSwipe";
import { NitProfileFilter } from "@/components/calendar/NitProfileFilter";
import { useCalendarProfiles, type CalendarProfile } from "@/hooks/useCalendarProfiles";
import { daysUntil, getDeadlineStatus } from "@/lib/calendar/status";
import { extractNitFilters, matchesAnyNitFilter } from "@/lib/calendar/nit";
import type { CalendarDeadlineItem } from "@/types/calendar";

function monthToken(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthDateFromToken(token: string): Date {
  const [year, month] = token.split("-").map(Number);
  return new Date(year, (month ?? 1) - 1, 1);
}

function getMonthFromIso(fechaIso: string): string {
  return fechaIso.slice(0, 7);
}

function isWithinSelectedRange(fechaIso: string, range: CalendarRangeFilter): boolean {
  const [year, month, day] = fechaIso.split("-").map(Number);
  const target = new Date(year, (month ?? 1) - 1, day ?? 1);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (range === "anio") {
    return target.getFullYear() === CALENDARIO_FISCAL_YEAR;
  }

  if (range === "semana") {
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    return target >= today && target <= nextWeek;
  }

  if (range === "proximos30") {
    const next30 = new Date(today);
    next30.setDate(today.getDate() + 30);
    return target >= today && target <= next30;
  }

  if (range === "mes") {
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    return target >= start && target < end;
  }

  const quarterStartMonth = Math.floor(today.getMonth() / 3) * 3;
  const quarterStart = new Date(today.getFullYear(), quarterStartMonth, 1);
  const quarterEnd = new Date(today.getFullYear(), quarterStartMonth + 3, 1);
  return target >= quarterStart && target < quarterEnd;
}

function getVisibleMonths(range: CalendarRangeFilter): Date[] {
  const now = new Date();
  const year = now.getFullYear();

  if (range === "anio") {
    return Array.from({ length: 12 }, (_, index) => new Date(CALENDARIO_FISCAL_YEAR, index, 1));
  }

  if (range === "mes" || range === "semana" || range === "proximos30") {
    return [new Date(year, now.getMonth(), 1)];
  }

  const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
  return Array.from({ length: 3 }, (_, index) => new Date(year, quarterStartMonth + index, 1));
}

function buildDeadlineId(obligacion: string, periodo: string, ultimoDigito: string, fecha: string): string {
  return `${obligacion}-${periodo}-${ultimoDigito}-${fecha}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

function CalendarioPageContent() {
  const searchParams = useSearchParams();
  const novedadParam = searchParams.get("novedad");

  const [search, setSearch] = useState("");
  const [nitValue, setNitValue] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState<string>("todos");
  const [obligacionFiltro, setObligacionFiltro] = useState<string>("todas");
  const [rangeFilter, setRangeFilter] = useState<CalendarRangeFilter>(() => (novedadParam ? "anio" : "mes"));
  const [viewMode, setViewMode] = useState<"tabla" | "mes">("tabla");

  const { profiles, activeProfileId, saveProfile, deleteProfile, setActiveProfile, importProfiles, exportProfiles } = useCalendarProfiles();

  const obligationsList = useMemo<CalendarDeadlineItem[]>(() => {
    const list: CalendarDeadlineItem[] = [];

    OBLIGACIONES.forEach((ob) => {
      const relacion = getRelacionObligacion(ob.obligacion);
      ob.vencimientos.forEach((v) => {
        const status = getDeadlineStatus(v.fecha);
        list.push({
          id: buildDeadlineId(ob.obligacion, v.periodo, v.ultimoDigito, v.fecha),
          obligacion: ob.obligacion,
          descripcion: ob.descripcion,
          periodo: v.periodo,
          ultimoDigito: v.ultimoDigito,
          fecha: v.fecha,
          tipoContribuyente: ob.tipoContribuyente,
          tipoObligacion: relacion.tipoObligacion,
          etiquetaTipo: relacion.etiqueta,
          tipoBadgeClassName: relacion.badgeClassName,
          tipoPuntoClassName: relacion.puntoClassName,
          calculadoraHref: relacion.calculadoraHref,
          relatedIndicatorIds: relacion.relatedIndicatorIds,
          relatedNovedadIds: relacion.relatedNovedadIds,
          articulosET: relacion.articulosET,
          status,
          daysToDeadline: daysUntil(v.fecha),
        });
      });
    });

    return list.sort((a, b) => a.fecha.localeCompare(b.fecha));
  }, []);

  const nitFilters = useMemo(() => extractNitFilters(nitValue), [nitValue]);

  const filteredItems = useMemo(() => {
    const lowerSearch = search.trim().toLowerCase();

    return obligationsList.filter((item) => {
      const matchesSearch =
        !lowerSearch ||
        item.obligacion.toLowerCase().includes(lowerSearch) ||
        item.periodo.toLowerCase().includes(lowerSearch) ||
        item.descripcion.toLowerCase().includes(lowerSearch);

      const matchesNit = matchesAnyNitFilter(item.ultimoDigito, nitFilters);
      const matchesTipo = tipoFiltro === "todos" || item.tipoContribuyente === tipoFiltro;
      const matchesObligacion = obligacionFiltro === "todas" || item.obligacion === obligacionFiltro;
      const matchesRange = isWithinSelectedRange(item.fecha, rangeFilter);
      const matchesNovedad = !novedadParam || item.relatedNovedadIds.includes(novedadParam);

      return matchesSearch && matchesNit && matchesTipo && matchesObligacion && matchesRange && matchesNovedad;
    });
  }, [obligationsList, search, nitFilters, tipoFiltro, obligacionFiltro, rangeFilter, novedadParam]);

  const upcomingItems = useMemo(() => {
    return filteredItems
      .filter((item) => item.status !== "vencido")
      .sort((a, b) => a.fecha.localeCompare(b.fecha))
      .slice(0, 3);
  }, [filteredItems]);

  const uniqueObligations = useMemo(
    () => Array.from(new Set(OBLIGACIONES.map((item) => item.obligacion))).sort((a, b) => a.localeCompare(b)),
    []
  );

  const visibleMonths = useMemo(() => getVisibleMonths(rangeFilter), [rangeFilter]);
  const [monthCursorToken, setMonthCursorToken] = useState(() => monthToken(getVisibleMonths("mes")[0]));
  const safeMonthCursorToken = visibleMonths.some((date) => monthToken(date) === monthCursorToken)
    ? monthCursorToken
    : monthToken(visibleMonths[0]);
  const currentMonthIndex = visibleMonths.findIndex((date) => monthToken(date) === safeMonthCursorToken);
  const currentMonthDate = monthDateFromToken(safeMonthCursorToken);

  const getItemsForMonth = (month: Date) => {
    const token = monthToken(month);
    return filteredItems
      .filter((item) => getMonthFromIso(item.fecha) === token)
      .sort((a, b) => a.fecha.localeCompare(b.fecha));
  };

  const handleApplyProfile = (profile: CalendarProfile | null) => {
    if (!profile) {
      setActiveProfile(null);
      return;
    }
    setActiveProfile(profile.id);
    setNitValue(profile.nitFilters.join(","));
  };

  const recentCalendarNews = useMemo(() => {
    const now = new Date();
    const threshold = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 60);
    return NOVEDADES_ENRIQUECIDAS.filter(
      (n) => n.cambiaCalendario && new Date(n.fecha) >= threshold
    ).slice(0, 1);
  }, []);

  return (
    <ReferencePageLayout
      title={`Calendario Tributario ${CALENDARIO_FISCAL_YEAR}`}
      description="Visualiza tus vencimientos críticos por NIT, exporta tus fechas y prioriza obligaciones para evitar sanciones."
      icon={Calendar}
      updatedAt={CALENDARIO_LAST_UPDATE}
    >
      <UpcomingDeadlinesPanel items={upcomingItems} />

      {!novedadParam && recentCalendarNews.length > 0 && (
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm text-foreground shadow-sm">
          <div className="flex items-center gap-2 font-medium">
            <Newspaper className="h-4 w-4" />
            Novedad normativa reciente: {recentCalendarNews[0].titulo}
          </div>
          <p className="mt-1 opacity-80">
            Esta resolución puede afectar tus plazos.
            <Link
              href={`/calendario?novedad=${recentCalendarNews[0].id}`}
              className="ml-2 font-semibold underline underline-offset-2 decoration-primary hover:decoration-current"
            >
              Filtrar calendario por esta novedad
            </Link>
          </p>
        </div>
      )}

      {novedadParam && (
        <div className="rounded-lg border border-border/60 bg-muted/50 p-4 text-sm text-foreground shadow-sm">
          Mostrando obligaciones impactadas por la novedad <strong>{novedadParam}</strong>.
          <Link
            href="/calendario"
            className="ml-2 font-medium underline underline-offset-2 decoration-foreground/40 hover:decoration-current"
          >
            Ver calendario completo
          </Link>
        </div>
      )}

      <NitProfileFilter
        nitValue={nitValue}
        onNitValueChange={(value) => {
          setNitValue(value);
          if (activeProfileId) setActiveProfile(null);
        }}
        nitFilters={nitFilters}
        profiles={profiles}
        activeProfileId={activeProfileId}
        onApplyProfile={handleApplyProfile}
        onSaveProfile={saveProfile}
        onDeleteProfile={deleteProfile}
        onImportProfiles={importProfiles}
        onExportProfiles={exportProfiles}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="relative lg:col-span-2">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar obligación, período o contexto..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-12 w-full rounded border border-border bg-card pl-10 pr-3 text-sm outline-none focus:border-foreground/40 focus:ring-1 focus:ring-foreground/20"
          />
        </div>

        <select
          value={tipoFiltro}
          onChange={(event) => setTipoFiltro(event.target.value)}
          className="h-12 w-full rounded border border-border bg-card px-3 text-sm outline-none focus:border-foreground/40 focus:ring-1 focus:ring-foreground/20"
        >
          <option value="todos">Todos los contribuyentes</option>
          <option value="naturales">Personas naturales</option>
          <option value="juridicas">Personas jurídicas</option>
          <option value="grandes">Grandes contribuyentes</option>
        </select>

        <select
          value={obligacionFiltro}
          onChange={(event) => setObligacionFiltro(event.target.value)}
          className="h-12 w-full rounded border border-border bg-card px-3 text-sm outline-none focus:border-foreground/40 focus:ring-1 focus:ring-foreground/20"
        >
          <option value="todas">Todas las obligaciones</option>
          {uniqueObligations.map((obligacion) => (
            <option key={obligacion} value={obligacion}>
              {obligacion}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <CalendarRangeTabs value={rangeFilter} onChange={setRangeFilter} />
          <div className="inline-flex rounded-md border border-border bg-card p-1">
            <button
              type="button"
              onClick={() => setViewMode("tabla")}
              className={clsx(
                "inline-flex items-center gap-1 rounded px-2.5 py-1.5 text-xs font-medium sm:text-sm",
                viewMode === "tabla"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Table2 className="h-3.5 w-3.5" />
              Tabla
            </button>
            <button
              type="button"
              onClick={() => setViewMode("mes")}
              className={clsx(
                "inline-flex items-center gap-1 rounded px-2.5 py-1.5 text-xs font-medium sm:text-sm",
                viewMode === "mes"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <CalendarDays className="h-3.5 w-3.5" />
              Mensual
            </button>
          </div>
        </div>

        <ExportFilteredIcsButton items={filteredItems.filter((item) => item.status !== "vencido")} />
      </div>

      {viewMode === "mes" && (
        <>
          <CalendarMonthGrid
            monthDate={currentMonthDate}
            items={getItemsForMonth(currentMonthDate)}
            onPrevMonth={() => {
              if (currentMonthIndex <= 0) return;
              setMonthCursorToken(monthToken(visibleMonths[currentMonthIndex - 1]));
            }}
            onNextMonth={() => {
              if (currentMonthIndex >= visibleMonths.length - 1) return;
              setMonthCursorToken(monthToken(visibleMonths[currentMonthIndex + 1]));
            }}
            canPrevMonth={currentMonthIndex > 0}
            canNextMonth={currentMonthIndex >= 0 && currentMonthIndex < visibleMonths.length - 1}
          />

          <MobileMonthSwipe months={visibleMonths} getItemsForMonth={getItemsForMonth} />
        </>
      )}

      {viewMode === "tabla" && (
        <div className="rounded-lg border border-border/60 bg-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-[11px] uppercase tracking-[0.05em] font-medium text-muted-foreground">Obligación</th>
                  <th className="px-4 py-3 text-[11px] uppercase tracking-[0.05em] font-medium text-muted-foreground">Periodo</th>
                  <th className="px-4 py-3 text-[11px] uppercase tracking-[0.05em] font-medium text-muted-foreground">NIT</th>
                  <th className="px-4 py-3 text-[11px] uppercase tracking-[0.05em] font-medium text-muted-foreground">Vencimiento</th>
                  <th className="px-4 py-3 text-[11px] uppercase tracking-[0.05em] font-medium text-muted-foreground">Estado</th>
                  <th className="px-4 py-3 text-[11px] uppercase tracking-[0.05em] font-medium text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <tr
                      key={item.id}
                      className={clsx(
                        "hover:bg-muted/30 transition-colors",
                        item.status === "vencido" && "bg-muted/10",
                        novedadParam && item.relatedNovedadIds.includes(novedadParam) && "bg-primary/5"
                      )}
                    >
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-medium text-foreground">{item.obligacion}</span>
                            <span
                              className={clsx(
                                "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium",
                                item.tipoBadgeClassName
                              )}
                            >
                              {item.etiquetaTipo}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">{item.descripcion}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{item.periodo}</td>
                      <td className="px-4 py-3">
                        <span
                          className={clsx(
                            "font-mono text-sm",
                            nitFilters.length > 0 && "rounded bg-primary/10 px-1.5 py-0.5 text-primary"
                          )}
                        >
                          {item.ultimoDigito}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground">{item.fecha}</td>
                      <td className="px-4 py-3">
                        <DeadlineStatusBadge status={item.status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {item.status !== "vencido" && (
                            <AddToCalendarButton
                              title={`${item.obligacion} (NIT ${item.ultimoDigito})`}
                              date={item.fecha}
                              description={`Periodo: ${item.periodo}.\n\n${item.descripcion}${
                                item.articulosET ? `\n\nArtículos ET: ${item.articulosET.join(", ")}` : ""
                              }\n\nGenerado por SuperApp Tributaria Colombia.`}
                            />
                          )}
                          <Link
                            href={item.calculadoraHref}
                            className="inline-flex items-center gap-1 rounded border border-border px-2 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                          >
                            Calculadora
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                          {item.relatedNovedadIds[0] && (
                            <Link
                              href={`/novedades?id=${item.relatedNovedadIds[0]}`}
                              className="inline-flex items-center gap-1 rounded border border-border px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            >
                              Novedad
                              <ExternalLink className="h-3 w-3" />
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <Filter className="h-8 w-8 opacity-20" />
                        <p>No se encontraron vencimientos con los filtros aplicados.</p>
                        <p className="text-xs">Prueba otro NIT o amplía la vista a trimestre.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-border/40 bg-muted/30 p-4 text-xs text-muted-foreground">
        <p>
          <strong>Nota legal:</strong> {CALENDARIO_DISCLAIMER}
        </p>
      </div>
    </ReferencePageLayout>
  );
}

export default function CalendarioPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Cargando calendario...</div>}>
      <CalendarioPageContent />
    </Suspense>
  );
}
