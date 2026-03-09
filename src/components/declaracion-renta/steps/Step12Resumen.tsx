"use client";

import Link from "next/link";
import { ExternalLink, Lightbulb, TrendingDown, FileDown, FileSpreadsheet, FileText } from "lucide-react";
import { clsx } from "clsx";
import type { ResultadoDeclaracion } from "@/lib/declaracion-renta/types";
import { useDeclaracion } from "@/lib/declaracion-renta/declaracion-context";
import { exportF210ToPdf, exportF210ToExcel, exportF210ToCsv } from "@/lib/export/declaracion-export";

interface StepProps {
  resultado: ResultadoDeclaracion;
}

function formatCOP(value: number): string {
  return "$" + value.toLocaleString("es-CO");
}

function formatPercent(value: number): string {
  return (value * 100).toFixed(2) + "%";
}

export function Step12Resumen({ resultado }: StepProps) {
  const { state } = useDeclaracion();
  const liq = resultado.liquidacion;
  const cg = resultado.cedulaGeneral;

  return (
    <div className="space-y-6">
      {/* Hero result */}
      <div
        className={clsx(
          "rounded-lg border p-6 text-center",
          liq.saldoPagar > 0
            ? "border-destructive/30 bg-destructive/5"
            : "border-success/30 bg-success/5"
        )}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
          {liq.saldoPagar > 0 ? "Total a pagar" : "Saldo a favor"}
        </p>
        <p className="heading-serif mt-2 text-4xl text-foreground sm:text-5xl">
          {formatCOP(liq.saldoPagar > 0 ? liq.saldoPagar : liq.saldoFavor)}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Tasa efectiva global: <strong>{formatPercent(resultado.tasaEfectivaGlobal)}</strong>
        </p>
      </div>

      {/* Breakdown por cédula */}
      <div className="rounded-md border border-border/60 bg-card p-5">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.05em] text-foreground">
          Desglose por cédula
        </h3>
        <div className="space-y-3">
          <ResultRow
            label="Cédula General (trabajo + capital + no laborales)"
            sublabel={`Base gravable: ${formatCOP(cg.rentaLiquidaGravable)} (${cg.rentaLiquidaGravableUVT.toFixed(1)} UVT)`}
            value={cg.impuestoCedulaGeneral}
          />
          <ResultRow
            label="Cédula Pensiones"
            sublabel={`Gravable: ${formatCOP(resultado.cedulaPensiones.rentaLiquidaGravablePensiones)}`}
            value={resultado.cedulaPensiones.impuestoCedulaPensiones}
          />
          <ResultRow
            label="Cédula Dividendos"
            sublabel={`Sub-cédula 1: ${formatCOP(resultado.cedulaDividendos.subCedula1Impuesto)} | Sub-cédula 2: ${formatCOP(resultado.cedulaDividendos.subCedula2Impuesto)}`}
            value={resultado.cedulaDividendos.impuestoTotalDividendos}
          />
          <ResultRow
            label="Ganancias ocasionales"
            sublabel={`Gravable: ${formatCOP(resultado.gananciasOcasionales.gananciaGravable)}`}
            value={resultado.gananciasOcasionales.impuestoGanancias}
          />

          <hr className="border-border/40" />

          <ResultRow label="Impuesto total de renta" value={liq.impuestoRentaTotal} bold />
          <ResultRow label="(−) Descuentos tributarios" value={-liq.descuentosTributarios} />
          <ResultRow label="Impuesto neto" value={liq.impuestoNeto} bold />
          <ResultRow
            label={`(+) Anticipo siguiente año (${state.perfil.anosDeclarando <= 1 ? "25%" : state.perfil.anosDeclarando === 2 ? "50%" : "75%"})`}
            value={liq.anticipoSiguienteAno}
          />
          <ResultRow label="(−) Total retenciones" value={-liq.totalRetenciones} />
          <ResultRow label="(−) Anticipo año anterior" value={-liq.anticipoAnterior} />
          <ResultRow label="(−) Saldo a favor anterior" value={-liq.saldoFavorAnterior} />

          <hr className="border-border/40" />

          {liq.saldoPagar > 0 ? (
            <ResultRow label="SALDO A PAGAR" value={liq.saldoPagar} bold highlight="destructive" />
          ) : (
            <ResultRow label="SALDO A FAVOR" value={liq.saldoFavor} bold highlight="success" />
          )}
        </div>
      </div>

      {/* Tabla Art. 241 breakdown */}
      {resultado.breakdown.length > 0 && (
        <div className="rounded-md border border-border/60 bg-card p-5">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.05em] text-foreground">
            Desglose marginal Art. 241 ET
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border/40 text-xs uppercase text-muted-foreground">
                  <th className="pb-2 pr-4">Rango (UVT)</th>
                  <th className="pb-2 pr-4">Tarifa</th>
                  <th className="pb-2 pr-4">Base (UVT)</th>
                  <th className="pb-2 text-right">Impuesto</th>
                </tr>
              </thead>
              <tbody>
                {resultado.breakdown.map((row, i) => (
                  <tr key={i} className="border-b border-border/20">
                    <td className="py-2 pr-4 font-values text-foreground">
                      {row.from.toLocaleString("es-CO")} – {row.to === Infinity ? "∞" : row.to.toLocaleString("es-CO")}
                    </td>
                    <td className="py-2 pr-4 font-values text-foreground">
                      {(row.rate * 100).toFixed(0)}%
                    </td>
                    <td className="py-2 pr-4 font-values text-foreground">
                      {row.baseUVT.toFixed(1)}
                    </td>
                    <td className="py-2 text-right font-values font-semibold text-foreground">
                      {formatCOP(row.impuestoCOP)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Patrimonio */}
      <div className="rounded-md border border-border/60 bg-card p-5">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.05em] text-foreground">
          Patrimonio
        </h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-[11px] text-muted-foreground">Bruto</p>
            <p className="font-values text-lg font-semibold text-foreground">
              {formatCOP(resultado.patrimonio.patrimonioBruto)}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Deudas</p>
            <p className="font-values text-lg font-semibold text-foreground">
              {formatCOP(resultado.patrimonio.deudasTotal)}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Líquido</p>
            <p className="font-values text-lg font-semibold text-foreground">
              {formatCOP(resultado.patrimonio.patrimonioLiquido)}
            </p>
          </div>
        </div>
      </div>

      {/* Sugerencias de optimización */}
      {resultado.sugerencias.length > 0 && (
        <div className="rounded-md border border-border/60 bg-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold uppercase tracking-[0.05em] text-foreground">
              Optimización fiscal
            </h3>
          </div>
          <div className="space-y-3">
            {resultado.sugerencias.map((sug) => (
              <div
                key={sug.id}
                className="flex items-start gap-3 rounded-md border border-border/40 bg-muted/20 p-3"
              >
                <TrendingDown className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{sug.titulo}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{sug.descripcion}</p>
                  <div className="mt-1 flex items-center gap-3">
                    <span className="text-xs font-medium text-success">
                      Ahorro potencial: ≈ {formatCOP(sug.ahorroPotencial)}
                    </span>
                    <Link
                      href={`/articulo/${sug.articuloET}`}
                      className="inline-flex items-center gap-1 text-xs text-muted-foreground underline underline-offset-2 decoration-border hover:text-foreground hover:decoration-foreground"
                    >
                      Art. {sug.articuloET} ET
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="rounded-md border border-border/60 bg-muted/30 p-4">
        <p className="text-xs text-muted-foreground">
          <strong>Aviso legal:</strong> Esta herramienta es un ejercicio informativo y no constituye asesoría tributaria.
          Los cálculos son aproximados y pueden variar según la situación particular de cada contribuyente.
          Consulte con un contador público o asesor tributario antes de presentar su declaración oficial ante la DIAN.
          Año gravable: {state.perfil.anoGravable}.
        </p>
      </div>

      {/* Export */}
      <div className="rounded-md border border-border/60 bg-card p-5">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.05em] text-foreground">
          Exportar para DIAN (Formulario 210)
        </h3>
        <p className="mb-4 text-xs text-muted-foreground">
          Descargue el borrador con mapeo de casillas para transcribir al portal MUISCA de la DIAN.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => exportF210ToPdf(state, resultado)}
            className="inline-flex items-center gap-1.5 rounded border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <FileDown className="h-4 w-4" />
            PDF (imprimir)
          </button>
          <button
            type="button"
            onClick={() => exportF210ToExcel(state, resultado)}
            className="inline-flex items-center gap-1.5 rounded border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Excel (.xls)
          </button>
          <button
            type="button"
            onClick={() => exportF210ToCsv(state, resultado)}
            className="inline-flex items-center gap-1.5 rounded border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <FileText className="h-4 w-4" />
            CSV
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Link
          href="/calculadoras/renta"
          className="inline-flex items-center gap-1.5 rounded border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          Calculadora rápida de renta
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
        <Link
          href="/calendario"
          className="inline-flex items-center gap-1.5 rounded border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          Ver fechas de presentación
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

// ── Helper row component ─────────────────────────────────

function ResultRow({
  label,
  sublabel,
  value,
  bold,
  highlight,
}: {
  label: string;
  sublabel?: string;
  value: number;
  bold?: boolean;
  highlight?: "success" | "destructive";
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <div>
        <p
          className={clsx(
            "text-sm",
            bold ? "font-semibold text-foreground" : "text-muted-foreground"
          )}
        >
          {label}
        </p>
        {sublabel && <p className="text-[11px] text-muted-foreground">{sublabel}</p>}
      </div>
      <p
        className={clsx(
          "font-values shrink-0 text-right text-sm",
          bold ? "font-semibold" : "font-medium",
          highlight === "success"
            ? "text-success"
            : highlight === "destructive"
              ? "text-destructive"
              : "text-foreground"
        )}
      >
        {value < 0 ? `(${formatCOP(Math.abs(value))})` : formatCOP(value)}
      </p>
    </div>
  );
}
