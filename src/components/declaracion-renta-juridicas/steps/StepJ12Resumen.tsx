"use client";

import Link from "next/link";
import { ExternalLink, FileDown, FileSpreadsheet, FileText } from "lucide-react";
import { clsx } from "clsx";
import type { ResultadoDeclaracionJuridica } from "@/lib/declaracion-renta-juridicas/types";
import { useDeclaracionJuridica } from "@/lib/declaracion-renta-juridicas/declaracion-juridica-context";
import { exportF110ToPdf, exportF110ToExcel, exportF110ToCsv } from "@/lib/export/declaracion-export";

interface StepProps {
  resultado: ResultadoDeclaracionJuridica;
}

function formatCOP(value: number): string {
  return "$" + value.toLocaleString("es-CO");
}

function formatPercent(value: number): string {
  return (value * 100).toFixed(2) + "%";
}

export function StepJ12Resumen({ resultado }: StepProps) {
  const { state } = useDeclaracionJuridica();
  const liq = resultado.liquidacion;
  const dep = resultado.depuracion;

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
          {formatCOP(liq.saldoPagar > 0 ? liq.saldoPagar : liq.totalSaldoFavor)}
        </p>
        <div className="mt-2 flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <span>
            Tarifa: <strong>{formatPercent(resultado.tarifaAplicada)}</strong>
          </span>
          <span>
            Tasa efectiva: <strong>{formatPercent(resultado.tasaEfectiva)}</strong>
          </span>
        </div>
      </div>

      {/* Depuración de renta */}
      <div className="rounded-md border border-border/60 bg-card p-5">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.05em] text-foreground">
          Depuración de renta
        </h3>
        <div className="space-y-3">
          <ResultRow label="Ingresos brutos (Cas 53)" value={dep.ingresosBrutos} />
          <ResultRow label="(−) Devoluciones y descuentos (Cas 54)" value={-dep.devolucionesDescuentos} />
          <ResultRow label="(−) INCRNGO (Cas 55)" value={-dep.incrngo} />
          <ResultRow label="Ingresos netos (Cas 56)" value={dep.ingresosNetos} bold />
          <ResultRow label="(−) Costos y gastos (Cas 62)" value={-dep.totalCostosGastos} />
          <ResultRow label="Renta líquida ordinaria (Cas 65)" value={dep.rentaLiquidaOrdinaria} bold />
          {dep.compensacionPerdidas > 0 && (
            <ResultRow label="(−) Compensación pérdidas (Cas 67)" value={-dep.compensacionPerdidas} />
          )}
          <ResultRow label="Renta líquida (Cas 68)" value={dep.rentaLiquida} bold />
          {dep.rentasExentas > 0 && (
            <ResultRow label="(−) Rentas exentas (Cas 71)" value={-dep.rentasExentas} />
          )}
          <ResultRow label="Renta líquida gravable (Cas 73)" value={dep.rentaLiquidaGravable} bold highlight="destructive" />
        </div>
      </div>

      {/* Liquidación */}
      <div className="rounded-md border border-border/60 bg-card p-5">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.05em] text-foreground">
          Liquidación del impuesto
        </h3>
        <div className="space-y-3">
          <ResultRow
            label={`Impuesto sobre renta gravable (${formatPercent(resultado.tarifaAplicada)}) (Cas 82)`}
            value={liq.impuestoRentaLiquidaGravable}
          />
          {liq.impuestoDividendosTotal > 0 && (
            <ResultRow label="Impuesto dividendos (Cas 83-86)" value={liq.impuestoDividendosTotal} />
          )}
          <ResultRow label="Total impuesto rentas líquidas (Cas 87)" value={liq.totalImpuestoRentasLiquidas} bold />
          {liq.totalDescuentos > 0 && (
            <ResultRow label="(−) Descuentos tributarios (Cas 88)" value={-liq.totalDescuentos} />
          )}
          <ResultRow label="Impuesto neto de renta (Cas 89)" value={liq.impuestoNetoRenta} bold />
          {liq.impuestoGananciasOcasionales > 0 && (
            <ResultRow label="(+) Impuesto ganancias ocasionales (Cas 90)" value={liq.impuestoGananciasOcasionales} />
          )}
          <ResultRow label="Total impuesto a cargo (Cas 92)" value={liq.totalImpuestoCargo} bold />

          <hr className="border-border/40" />

          <ResultRow label="(−) Anticipo año anterior (Cas 93)" value={-liq.anticipoAnterior} />
          <ResultRow label="(−) Saldo a favor anterior (Cas 94)" value={-liq.saldoFavorAnterior} />
          <ResultRow label="(−) Total retenciones (Cas 97)" value={-liq.totalRetenciones} />
          <ResultRow
            label={`(+) Anticipo siguiente año (${state.perfil.anosDeclarando <= 1 ? "25%" : state.perfil.anosDeclarando === 2 ? "50%" : "75%"}) (Cas 98)`}
            value={liq.anticipoSiguienteAno}
          />
          {liq.sobretasa > 0 && (
            <ResultRow label="(+) Sobretasa (Cas 99)" value={liq.sobretasa} />
          )}

          <hr className="border-border/40" />

          {liq.saldoPagar > 0 ? (
            <ResultRow label="SALDO A PAGAR (Cas 100)" value={liq.saldoPagar} bold highlight="destructive" />
          ) : (
            <ResultRow label="SALDO A FAVOR (Cas 103)" value={liq.totalSaldoFavor} bold highlight="success" />
          )}
        </div>
      </div>

      {/* TTD */}
      {resultado.ttd.aplica && (
        <div className="rounded-md border border-border/60 bg-card p-5">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.05em] text-foreground">
            Tasa de tributación depurada (Art. 240 Par. 6)
          </h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-[11px] text-muted-foreground">TTD</p>
              <p className="font-values text-lg font-semibold text-foreground">
                {formatPercent(resultado.ttd.tasaTributacionDepurada)}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">Mínima</p>
              <p className="font-values text-lg font-semibold text-foreground">15.00%</p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">Impuesto adicional</p>
              <p className={`font-values text-lg font-semibold ${resultado.ttd.impuestoAdicionar > 0 ? "text-destructive" : "text-success"}`}>
                {formatCOP(resultado.ttd.impuestoAdicionar)}
              </p>
            </div>
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
            <p className="text-[11px] text-muted-foreground">Pasivos</p>
            <p className="font-values text-lg font-semibold text-foreground">
              {formatCOP(resultado.patrimonio.pasivos)}
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

      {/* Sobretasa */}
      {resultado.sobretasa.aplica && (
        <div className="rounded-md border border-border/60 bg-card p-5">
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-[0.05em] text-foreground">
            Sobretasa
          </h3>
          <p className="text-sm text-foreground">
            Tasa: <strong className="font-values">{formatPercent(resultado.sobretasa.tasa)}</strong>
            {" · "}
            Valor: <strong className="font-values">{formatCOP(resultado.sobretasa.impuestoSobretasa)}</strong>
          </p>
        </div>
      )}

      {/* Export */}
      <div className="rounded-md border border-border/60 bg-card p-5">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.05em] text-foreground">
          Exportar para DIAN (Formulario 110)
        </h3>
        <p className="mb-4 text-xs text-muted-foreground">
          Descargue el borrador con mapeo de casillas para transcribir al portal MUISCA de la DIAN.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => exportF110ToPdf(state, resultado)}
            className="inline-flex items-center gap-1.5 rounded border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <FileDown className="h-4 w-4" />
            PDF (imprimir)
          </button>
          <button
            type="button"
            onClick={() => exportF110ToExcel(state, resultado)}
            className="inline-flex items-center gap-1.5 rounded border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Excel (.xls)
          </button>
          <button
            type="button"
            onClick={() => exportF110ToCsv(state, resultado)}
            className="inline-flex items-center gap-1.5 rounded border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <FileText className="h-4 w-4" />
            CSV
          </button>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="rounded-md border border-border/60 bg-muted/30 p-4">
        <p className="text-xs text-muted-foreground">
          <strong>Aviso legal:</strong> Esta herramienta es un ejercicio informativo y no constituye asesoría tributaria.
          Los cálculos son aproximados. Consulte con un contador público antes de presentar su declaración
          oficial ante la DIAN. Año gravable: {state.perfil.anoGravable}.
        </p>
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
