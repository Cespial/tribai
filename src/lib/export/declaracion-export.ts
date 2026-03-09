/* ═══════════════════════════════════════════════════════════
   declaracion-export.ts — Export Declaración de Renta
   PDF (browser print), Excel-compatible (HTML→XLS), CSV
   Mapeo de casillas DIAN para F210 y F110
   ═══════════════════════════════════════════════════════════ */

import type { DeclaracionState, ResultadoDeclaracion } from "@/lib/declaracion-renta/types";
import type {
  DeclaracionJuridicaState,
  ResultadoDeclaracionJuridica,
} from "@/lib/declaracion-renta-juridicas/types";
import { printLegalDocument } from "./toLegalPdf";
import { toCsv, downloadCsvFile } from "./toCsv";

// ── Utilidades ─────────────────────────────────────────────

function fmt(value: number): string {
  return value.toLocaleString("es-CO");
}

function pct(value: number): string {
  return (value * 100).toFixed(2) + "%";
}

function downloadExcel(filename: string, html: string): void {
  if (typeof window === "undefined") return;
  const blob = new Blob([html], {
    type: "application/vnd.ms-excel;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ═══════════════════════════════════════════════════════════
//  F210 — Personas Naturales
// ═══════════════════════════════════════════════════════════

interface CasillaF210 {
  casilla: string;
  concepto: string;
  valor: number;
}

function buildCasillasF210(
  state: DeclaracionState,
  r: ResultadoDeclaracion
): CasillaF210[] {
  const pat = r.patrimonio;
  const cg = r.cedulaGeneral;
  const cp = r.cedulaPensiones;
  const cd = r.cedulaDividendos;
  const go = r.gananciasOcasionales;
  const liq = r.liquidacion;

  return [
    // Patrimonio
    { casilla: "29", concepto: "Patrimonio bruto", valor: pat.patrimonioBruto },
    { casilla: "30", concepto: "Deudas", valor: pat.deudasTotal },
    { casilla: "31", concepto: "Patrimonio líquido", valor: pat.patrimonioLiquido },

    // Cédula General — Ingresos
    { casilla: "32", concepto: "Ingresos brutos rentas de trabajo", valor: cg.ingresosBrutosTrabajo },
    { casilla: "33", concepto: "Ingresos no constitutivos de renta (trabajo)", valor: cg.INCRTrabajo },
    { casilla: "34", concepto: "Rentas de capital brutas", valor: cg.ingresosBrutosCapital },
    { casilla: "35", concepto: "Rentas no laborales brutas", valor: cg.ingresosBrutosNoLaborales },
    { casilla: "36", concepto: "INCRNGO capital + no laborales", valor: cg.INCRCapitalTotal + cg.INCRNoLaboralesTotal },
    { casilla: "37", concepto: "Deducciones aplicadas", valor: cg.deduccionesAplicadas },

    // Cédula General — Depuración
    { casilla: "38", concepto: "Renta líquida cédula general", valor: cg.rentaLiquidaCedulaGeneral },
    { casilla: "39", concepto: "Rentas exentas aplicadas (cédula general)", valor: cg.rentasExentasAplicadas },
    { casilla: "40", concepto: "Renta líquida gravable cédula general", valor: cg.rentaLiquidaGravable },

    // Pensiones
    { casilla: "41", concepto: "Ingresos brutos pensiones", valor: cp.ingresosBrutosPensiones },
    { casilla: "42", concepto: "INCRNGO pensiones", valor: cp.INCRPensiones },
    { casilla: "43", concepto: "Renta exenta pensiones", valor: cp.rentaExentaPensiones },
    { casilla: "44", concepto: "Renta líquida gravable pensiones", valor: cp.rentaLiquidaGravablePensiones },

    // Dividendos
    { casilla: "45", concepto: "Dividendos sub-cédula 1 (total)", valor: cd.subCedula1Total },
    { casilla: "46", concepto: "Impuesto dividendos sub-cédula 1", valor: cd.subCedula1Impuesto },
    { casilla: "47", concepto: "Dividendos sub-cédula 2 (total)", valor: cd.subCedula2Total },
    { casilla: "48", concepto: "Impuesto dividendos sub-cédula 2", valor: cd.subCedula2Impuesto },

    // Ganancias Ocasionales
    { casilla: "53", concepto: "Ganancias ocasionales brutas", valor: go.gananciasBrutas },
    { casilla: "54", concepto: "Costos ganancias ocasionales", valor: go.costosGanancias },
    { casilla: "55", concepto: "Ganancias no gravadas y exentas", valor: go.gananciaExenta },
    { casilla: "56", concepto: "Ganancias ocasionales gravables", valor: go.gananciaGravable },

    // Liquidación
    { casilla: "57", concepto: "Impuesto cédula general (Art. 241)", valor: cg.impuestoCedulaGeneral },
    { casilla: "58", concepto: "Impuesto cédula pensiones", valor: cp.impuestoCedulaPensiones },
    { casilla: "59", concepto: "Total impuesto dividendos", valor: cd.impuestoTotalDividendos },
    { casilla: "61", concepto: "Total impuesto sobre renta", valor: liq.impuestoRentaTotal },
    { casilla: "62", concepto: "Descuentos tributarios", valor: liq.descuentosTributarios },
    { casilla: "63", concepto: "Impuesto neto de renta", valor: liq.impuestoNeto },
    { casilla: "64", concepto: "Impuesto ganancias ocasionales", valor: go.impuestoGanancias },
    { casilla: "65", concepto: "Total impuesto a cargo", valor: liq.impuestoNeto + go.impuestoGanancias },
    { casilla: "67", concepto: "Anticipo renta año siguiente", valor: liq.anticipoSiguienteAno },
    { casilla: "68", concepto: "Anticipo renta año anterior", valor: liq.anticipoAnterior },
    { casilla: "69", concepto: "Saldo a favor año anterior", valor: liq.saldoFavorAnterior },
    { casilla: "70", concepto: "Total retenciones año gravable", valor: liq.totalRetenciones },
    { casilla: "91", concepto: "Total saldo a pagar", valor: liq.saldoPagar },
    { casilla: "92", concepto: "Total saldo a favor", valor: liq.saldoFavor },
  ];
}

// ── F210 PDF ─────────────────────────────────────────────

export function exportF210ToPdf(
  state: DeclaracionState,
  resultado: ResultadoDeclaracion
): void {
  const casillas = buildCasillasF210(state, resultado);
  const rows = casillas
    .map(
      (c) =>
        `<tr><td style="padding:4px 8px;border-bottom:1px solid #eee;font-weight:600;width:60px">${c.casilla}</td><td style="padding:4px 8px;border-bottom:1px solid #eee">${c.concepto}</td><td style="padding:4px 8px;border-bottom:1px solid #eee;text-align:right;font-family:monospace">$${fmt(c.valor)}</td></tr>`
    )
    .join("");

  const bodyHtml = `
    <div style="margin-bottom:16px">
      <table style="font-size:13px;width:100%;margin-bottom:8px">
        <tr><td><strong>Contribuyente:</strong> ${state.perfil.nombres} ${state.perfil.apellidos}</td></tr>
        <tr><td><strong>${state.perfil.tipoDocumento}:</strong> ${state.perfil.numeroDocumento}-${state.perfil.digitoVerificacion}</td></tr>
        <tr><td><strong>Año gravable:</strong> ${state.perfil.anoGravable}</td></tr>
        <tr><td><strong>Tasa efectiva:</strong> ${pct(resultado.tasaEfectivaGlobal)}</td></tr>
      </table>
    </div>
    <table style="font-size:12px;width:100%;border-collapse:collapse">
      <thead>
        <tr style="background:#f5f5f5;border-bottom:2px solid #ddd">
          <th style="padding:6px 8px;text-align:left">Casilla</th>
          <th style="padding:6px 8px;text-align:left">Concepto</th>
          <th style="padding:6px 8px;text-align:right">Valor (COP)</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;

  printLegalDocument({
    title: "Declaración de Renta — Formulario 210",
    subtitle: `Personas Naturales — Año Gravable ${state.perfil.anoGravable}`,
    bodyHtml,
    disclaimer:
      "Este documento es un borrador informativo para transcripción al portal MUISCA de la DIAN. No constituye declaración oficial ni asesoría tributaria profesional. Verifique todos los valores con su contador antes de presentar.",
  });
}

// ── F210 Excel ───────────────────────────────────────────

export function exportF210ToExcel(
  state: DeclaracionState,
  resultado: ResultadoDeclaracion
): void {
  const casillas = buildCasillasF210(state, resultado);
  const rows = casillas
    .map(
      (c) =>
        `<tr><td>${c.casilla}</td><td>${c.concepto}</td><td>${c.valor}</td></tr>`
    )
    .join("");

  const html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
    <head><meta charset="utf-8"/></head>
    <body>
    <table>
      <tr><td colspan="3"><strong>Declaración de Renta — Formulario 210 — Personas Naturales</strong></td></tr>
      <tr><td>Contribuyente</td><td colspan="2">${state.perfil.nombres} ${state.perfil.apellidos}</td></tr>
      <tr><td>${state.perfil.tipoDocumento}</td><td colspan="2">${state.perfil.numeroDocumento}-${state.perfil.digitoVerificacion}</td></tr>
      <tr><td>Año gravable</td><td colspan="2">${state.perfil.anoGravable}</td></tr>
      <tr><td>Tasa efectiva</td><td colspan="2">${pct(resultado.tasaEfectivaGlobal)}</td></tr>
      <tr><td></td></tr>
      <thead>
        <tr><th>Casilla</th><th>Concepto</th><th>Valor (COP)</th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    </body></html>
  `;

  downloadExcel(
    `F210-declaracion-renta-${state.perfil.anoGravable}-${new Date().toISOString().split("T")[0]}.xls`,
    html
  );
}

// ── F210 CSV ─────────────────────────────────────────────

export function exportF210ToCsv(
  state: DeclaracionState,
  resultado: ResultadoDeclaracion
): void {
  const casillas = buildCasillasF210(state, resultado);
  const csv = toCsv(
    casillas.map((c) => ({ casilla: c.casilla, concepto: c.concepto, valor: c.valor })),
    [
      { key: "casilla", header: "Casilla" },
      { key: "concepto", header: "Concepto" },
      { key: "valor", header: "Valor (COP)" },
    ]
  );
  downloadCsvFile(
    `F210-declaracion-renta-${state.perfil.anoGravable}-${new Date().toISOString().split("T")[0]}.csv`,
    csv
  );
}

// ═══════════════════════════════════════════════════════════
//  F110 — Personas Jurídicas
// ═══════════════════════════════════════════════════════════

interface CasillaF110 {
  casilla: string;
  concepto: string;
  valor: number;
}

function buildCasillasF110(
  state: DeclaracionJuridicaState,
  r: ResultadoDeclaracionJuridica
): CasillaF110[] {
  const pat = r.patrimonio;
  const dep = r.depuracion;
  const div = r.dividendos;
  const go = r.gananciasOcasionales;
  const desc = r.descuentos;
  const liq = r.liquidacion;

  return [
    // Datos informativos
    { casilla: "30", concepto: "Total costos y gastos de nómina", valor: state.datosInformativos.totalCostosNomina },
    { casilla: "31", concepto: "Aportes al sistema de seguridad social", valor: state.datosInformativos.aportesSegSocial },
    { casilla: "32", concepto: "Aportes SENA, ICBF y Cajas", valor: state.datosInformativos.aportesSenaIcbfCajas },

    // Patrimonio
    { casilla: "33", concepto: "Efectivo y equivalentes", valor: state.patrimonio.efectivoEquivalentes },
    { casilla: "34", concepto: "Inversiones financieras", valor: state.patrimonio.inversionesFinancieras },
    { casilla: "35", concepto: "Cuentas por cobrar", valor: state.patrimonio.cuentasPorCobrar },
    { casilla: "36", concepto: "Inventarios", valor: state.patrimonio.inventarios },
    { casilla: "37", concepto: "Activos intangibles", valor: state.patrimonio.activosIntangibles },
    { casilla: "38", concepto: "Activos biológicos", valor: state.patrimonio.activosBiologicos },
    { casilla: "39", concepto: "PPE, propiedad de inversión y ANCMV", valor: state.patrimonio.ppePlantaEquipo },
    { casilla: "40", concepto: "Otros activos", valor: state.patrimonio.otrosActivos },
    { casilla: "41", concepto: "Patrimonio bruto", valor: pat.patrimonioBruto },
    { casilla: "42", concepto: "Pasivos", valor: pat.pasivos },
    { casilla: "43", concepto: "Patrimonio líquido", valor: pat.patrimonioLiquido },

    // Ingresos
    { casilla: "44", concepto: "Ingresos operacionales", valor: state.ingresos.ingresosOperacionales },
    { casilla: "45", concepto: "Ingresos financieros", valor: state.ingresos.ingresosFinancieros },
    { casilla: "46", concepto: "Dividendos gravados Art. 49 Par. 2", valor: state.ingresos.dividendosSubcedula2 },
    { casilla: "47", concepto: "Otros dividendos y participaciones", valor: state.ingresos.dividendosOtros },
    { casilla: "48", concepto: "Dividendos tarifa Art. 240", valor: state.ingresos.dividendosTarifa27 },
    { casilla: "49", concepto: "Ingresos por ganancias ocasionales", valor: state.ingresos.ingresosGananciasOcasionales },
    { casilla: "50", concepto: "Recuperación de deducciones", valor: state.ingresos.recuperacionDeducciones },
    { casilla: "51", concepto: "Ingresos por participaciones", valor: state.ingresos.ingresosParticipaciones },
    { casilla: "52", concepto: "Otros ingresos", valor: state.ingresos.otrosIngresos },
    { casilla: "53", concepto: "Total ingresos brutos", valor: dep.ingresosBrutos },
    { casilla: "54", concepto: "Devoluciones, rebajas y descuentos", valor: dep.devolucionesDescuentos },
    { casilla: "55", concepto: "Ingresos no constitutivos de renta (INCRNGO)", valor: dep.incrngo },
    { casilla: "56", concepto: "Total ingresos netos", valor: dep.ingresosNetos },

    // Costos y gastos
    { casilla: "57", concepto: "Costos", valor: state.costosGastos.costos },
    { casilla: "58", concepto: "Gastos de administración", valor: state.costosGastos.gastosAdministracion },
    { casilla: "59", concepto: "Gastos de ventas", valor: state.costosGastos.gastosVentas },
    { casilla: "60", concepto: "Gastos financieros", valor: state.costosGastos.gastosFinancieros },
    { casilla: "61", concepto: "Otros gastos y deducciones", valor: state.costosGastos.otrosGastosDeducciones },
    { casilla: "62", concepto: "Total costos y gastos", valor: dep.totalCostosGastos },

    // Depuración
    { casilla: "65", concepto: "Renta líquida ordinaria", valor: dep.rentaLiquidaOrdinaria },
    { casilla: "66", concepto: "Pérdida líquida", valor: dep.perdidaLiquida },
    { casilla: "67", concepto: "Compensación de pérdidas", valor: dep.compensacionPerdidas },
    { casilla: "68", concepto: "Renta líquida", valor: dep.rentaLiquida },
    { casilla: "69", concepto: "Renta presuntiva", valor: dep.rentaPresuntiva },
    { casilla: "70", concepto: "Renta líquida gravable (base)", valor: dep.rentaLiquidaGravableBase },
    { casilla: "71", concepto: "Rentas exentas", valor: dep.rentasExentas },
    { casilla: "72", concepto: "Rentas gravables", valor: dep.rentasGravables },
    { casilla: "73", concepto: "Renta líquida gravable", valor: dep.rentaLiquidaGravable },

    // Dividendos
    { casilla: "74", concepto: "Dividendos tarifa 5%", valor: div.dividendosTarifa5 },
    { casilla: "75", concepto: "Dividendos tarifa 35%", valor: div.dividendosTarifa35 },
    { casilla: "76", concepto: "Dividendos tarifa 33%", valor: div.dividendosTarifa33 },
    { casilla: "77", concepto: "Dividendos tarifa 27%", valor: div.dividendosTarifa27 },

    // Ganancias ocasionales
    { casilla: "78", concepto: "Ingresos ganancias ocasionales", valor: go.ingresos },
    { casilla: "79", concepto: "Costos ganancias ocasionales", valor: go.costos },
    { casilla: "80", concepto: "Ganancias no gravadas y exentas", valor: go.exentas },
    { casilla: "81", concepto: "Ganancias ocasionales gravables", valor: go.gravables },

    // Liquidación
    { casilla: "82", concepto: "Impuesto sobre renta líquida gravable", valor: liq.impuestoRentaLiquidaGravable },
    { casilla: "83", concepto: "Impuesto dividendos 5%", valor: div.impuestoDividendos5 },
    { casilla: "84", concepto: "Impuesto dividendos 35%", valor: div.impuestoDividendos35 },
    { casilla: "85", concepto: "Impuesto dividendos 33%", valor: div.impuestoDividendos33 },
    { casilla: "86", concepto: "Impuesto dividendos 27%", valor: div.impuestoDividendos27 },
    { casilla: "87", concepto: "Total impuesto sobre rentas líquidas", valor: liq.totalImpuestoRentasLiquidas },
    { casilla: "88", concepto: "Total descuentos tributarios", valor: desc.totalDescuentos },
    { casilla: "89", concepto: "Impuesto neto de renta", valor: liq.impuestoNetoRenta },
    { casilla: "90", concepto: "Impuesto ganancias ocasionales", valor: go.impuesto },
    { casilla: "91", concepto: "Descuento GO exterior", valor: liq.descuentoGOExterior },
    { casilla: "92", concepto: "Total impuesto a cargo", valor: liq.totalImpuestoCargo },
    { casilla: "93", concepto: "Anticipo renta año anterior", valor: liq.anticipoAnterior },
    { casilla: "94", concepto: "Saldo a favor año anterior", valor: liq.saldoFavorAnterior },
    { casilla: "95", concepto: "Autorretenciones", valor: state.retenciones.autorretenciones },
    { casilla: "96", concepto: "Otras retenciones", valor: state.retenciones.otrasRetenciones },
    { casilla: "97", concepto: "Total retenciones año gravable", valor: liq.totalRetenciones },
    { casilla: "98", concepto: "Anticipo renta año siguiente", valor: liq.anticipoSiguienteAno },
    { casilla: "99", concepto: "Sobretasa", valor: liq.sobretasa },
    { casilla: "100", concepto: "Saldo a pagar", valor: liq.saldoPagar },
    { casilla: "101", concepto: "Sanciones", valor: liq.sanciones },
    { casilla: "102", concepto: "Total saldo a pagar", valor: liq.totalSaldoPagar },
    { casilla: "103", concepto: "Total saldo a favor", valor: liq.totalSaldoFavor },
  ];
}

// ── F110 PDF ─────────────────────────────────────────────

export function exportF110ToPdf(
  state: DeclaracionJuridicaState,
  resultado: ResultadoDeclaracionJuridica
): void {
  const casillas = buildCasillasF110(state, resultado);
  const rows = casillas
    .map(
      (c) =>
        `<tr><td style="padding:4px 8px;border-bottom:1px solid #eee;font-weight:600;width:60px">${c.casilla}</td><td style="padding:4px 8px;border-bottom:1px solid #eee">${c.concepto}</td><td style="padding:4px 8px;border-bottom:1px solid #eee;text-align:right;font-family:monospace">$${fmt(c.valor)}</td></tr>`
    )
    .join("");

  const tipoLabel = state.perfil.tipoEntidad.replace(/_/g, " ");

  const bodyHtml = `
    <div style="margin-bottom:16px">
      <table style="font-size:13px;width:100%;margin-bottom:8px">
        <tr><td><strong>Razón social:</strong> ${state.perfil.razonSocial}</td></tr>
        <tr><td><strong>NIT:</strong> ${state.perfil.nit}-${state.perfil.digitoVerificacion}</td></tr>
        <tr><td><strong>Tipo de entidad:</strong> ${tipoLabel}</td></tr>
        <tr><td><strong>Año gravable:</strong> ${state.perfil.anoGravable}</td></tr>
        <tr><td><strong>Tarifa aplicada:</strong> ${pct(resultado.tarifaAplicada)}</td></tr>
        <tr><td><strong>Tasa efectiva:</strong> ${pct(resultado.tasaEfectiva)}</td></tr>
      </table>
    </div>
    <table style="font-size:12px;width:100%;border-collapse:collapse">
      <thead>
        <tr style="background:#f5f5f5;border-bottom:2px solid #ddd">
          <th style="padding:6px 8px;text-align:left">Casilla</th>
          <th style="padding:6px 8px;text-align:left">Concepto</th>
          <th style="padding:6px 8px;text-align:right">Valor (COP)</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;

  printLegalDocument({
    title: "Declaración de Renta — Formulario 110",
    subtitle: `Personas Jurídicas — Año Gravable ${state.perfil.anoGravable}`,
    bodyHtml,
    disclaimer:
      "Este documento es un borrador informativo para transcripción al portal MUISCA de la DIAN. No constituye declaración oficial ni asesoría tributaria profesional. Verifique todos los valores con su contador antes de presentar.",
  });
}

// ── F110 Excel ───────────────────────────────────────────

export function exportF110ToExcel(
  state: DeclaracionJuridicaState,
  resultado: ResultadoDeclaracionJuridica
): void {
  const casillas = buildCasillasF110(state, resultado);
  const tipoLabel = state.perfil.tipoEntidad.replace(/_/g, " ");
  const rows = casillas
    .map(
      (c) =>
        `<tr><td>${c.casilla}</td><td>${c.concepto}</td><td>${c.valor}</td></tr>`
    )
    .join("");

  const html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
    <head><meta charset="utf-8"/></head>
    <body>
    <table>
      <tr><td colspan="3"><strong>Declaración de Renta — Formulario 110 — Personas Jurídicas</strong></td></tr>
      <tr><td>Razón social</td><td colspan="2">${state.perfil.razonSocial}</td></tr>
      <tr><td>NIT</td><td colspan="2">${state.perfil.nit}-${state.perfil.digitoVerificacion}</td></tr>
      <tr><td>Tipo de entidad</td><td colspan="2">${tipoLabel}</td></tr>
      <tr><td>Año gravable</td><td colspan="2">${state.perfil.anoGravable}</td></tr>
      <tr><td>Tarifa aplicada</td><td colspan="2">${pct(resultado.tarifaAplicada)}</td></tr>
      <tr><td>Tasa efectiva</td><td colspan="2">${pct(resultado.tasaEfectiva)}</td></tr>
      <tr><td></td></tr>
      <thead>
        <tr><th>Casilla</th><th>Concepto</th><th>Valor (COP)</th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    </body></html>
  `;

  downloadExcel(
    `F110-declaracion-renta-${state.perfil.anoGravable}-${new Date().toISOString().split("T")[0]}.xls`,
    html
  );
}

// ── F110 CSV ─────────────────────────────────────────────

export function exportF110ToCsv(
  state: DeclaracionJuridicaState,
  resultado: ResultadoDeclaracionJuridica
): void {
  const casillas = buildCasillasF110(state, resultado);
  const csv = toCsv(
    casillas.map((c) => ({ casilla: c.casilla, concepto: c.concepto, valor: c.valor })),
    [
      { key: "casilla", header: "Casilla" },
      { key: "concepto", header: "Concepto" },
      { key: "valor", header: "Valor (COP)" },
    ]
  );
  downloadCsvFile(
    `F110-declaracion-renta-${state.perfil.anoGravable}-${new Date().toISOString().split("T")[0]}.csv`,
    csv
  );
}
