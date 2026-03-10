// ── Calendario Tributario 2026 ──
// Source: DIAN Resolucion (typically published late December of prior year)
// Note: These are approximate dates based on typical DIAN patterns.
// Real dates should be verified against the official DIAN resolution for 2026.

/** Single source of truth for the fiscal year this calendar covers. */
export const CALENDARIO_FISCAL_YEAR = 2026;

export const CALENDARIO_LAST_UPDATE = "2026-02-15";

export interface DeadlineEntry {
  obligacion: string;
  descripcion: string;
  tipoContribuyente: "grandes" | "juridicas" | "naturales" | "todos";
  periodicidad: "anual" | "bimestral" | "cuatrimestral" | "mensual";
  vencimientos: Array<{
    periodo: string;
    ultimoDigito: string;
    fecha: string; // ISO date
  }>;
}

export const OBLIGACIONES: DeadlineEntry[] = [
  // ──────────────────────────────────────────
  // 1. Declaracion de Renta Personas Naturales
  // ──────────────────────────────────────────
  {
    obligacion: "Declaracion de Renta Personas Naturales",
    descripcion: "Declaracion anual del impuesto sobre la renta y complementarios",
    tipoContribuyente: "naturales",
    periodicidad: "anual",
    vencimientos: [
      { periodo: "AG 2025", ultimoDigito: "01-02", fecha: "2026-08-12" },
      { periodo: "AG 2025", ultimoDigito: "03-04", fecha: "2026-08-13" },
      { periodo: "AG 2025", ultimoDigito: "05-06", fecha: "2026-08-14" },
      { periodo: "AG 2025", ultimoDigito: "07-08", fecha: "2026-08-18" },
      { periodo: "AG 2025", ultimoDigito: "09-10", fecha: "2026-08-19" },
      { periodo: "AG 2025", ultimoDigito: "11-12", fecha: "2026-08-20" },
      { periodo: "AG 2025", ultimoDigito: "13-14", fecha: "2026-08-21" },
      { periodo: "AG 2025", ultimoDigito: "15-16", fecha: "2026-08-25" },
      { periodo: "AG 2025", ultimoDigito: "17-18", fecha: "2026-08-26" },
      { periodo: "AG 2025", ultimoDigito: "19-20", fecha: "2026-08-27" },
      { periodo: "AG 2025", ultimoDigito: "21-22", fecha: "2026-08-28" },
      { periodo: "AG 2025", ultimoDigito: "23-24", fecha: "2026-09-01" },
      { periodo: "AG 2025", ultimoDigito: "25-26", fecha: "2026-09-02" },
      { periodo: "AG 2025", ultimoDigito: "27-28", fecha: "2026-09-03" },
      { periodo: "AG 2025", ultimoDigito: "29-30", fecha: "2026-09-04" },
      { periodo: "AG 2025", ultimoDigito: "31-32", fecha: "2026-09-08" },
      { periodo: "AG 2025", ultimoDigito: "33-34", fecha: "2026-09-09" },
      { periodo: "AG 2025", ultimoDigito: "35-36", fecha: "2026-09-10" },
      { periodo: "AG 2025", ultimoDigito: "37-38", fecha: "2026-09-11" },
      { periodo: "AG 2025", ultimoDigito: "39-40", fecha: "2026-09-15" },
      { periodo: "AG 2025", ultimoDigito: "41-42", fecha: "2026-09-16" },
      { periodo: "AG 2025", ultimoDigito: "43-44", fecha: "2026-09-17" },
      { periodo: "AG 2025", ultimoDigito: "45-46", fecha: "2026-09-18" },
      { periodo: "AG 2025", ultimoDigito: "47-48", fecha: "2026-09-22" },
      { periodo: "AG 2025", ultimoDigito: "49-50", fecha: "2026-09-23" },
      { periodo: "AG 2025", ultimoDigito: "51-52", fecha: "2026-09-24" },
      { periodo: "AG 2025", ultimoDigito: "53-54", fecha: "2026-09-25" },
      { periodo: "AG 2025", ultimoDigito: "55-56", fecha: "2026-09-29" },
      { periodo: "AG 2025", ultimoDigito: "57-58", fecha: "2026-09-30" },
      { periodo: "AG 2025", ultimoDigito: "59-60", fecha: "2026-10-01" },
      { periodo: "AG 2025", ultimoDigito: "61-62", fecha: "2026-10-02" },
      { periodo: "AG 2025", ultimoDigito: "63-64", fecha: "2026-10-06" },
      { periodo: "AG 2025", ultimoDigito: "65-66", fecha: "2026-10-07" },
      { periodo: "AG 2025", ultimoDigito: "67-68", fecha: "2026-10-08" },
      { periodo: "AG 2025", ultimoDigito: "69-70", fecha: "2026-10-09" },
      { periodo: "AG 2025", ultimoDigito: "71-72", fecha: "2026-10-14" },
      { periodo: "AG 2025", ultimoDigito: "73-74", fecha: "2026-10-15" },
      { periodo: "AG 2025", ultimoDigito: "75-76", fecha: "2026-10-16" },
      { periodo: "AG 2025", ultimoDigito: "77-78", fecha: "2026-10-20" },
      { periodo: "AG 2025", ultimoDigito: "79-80", fecha: "2026-10-21" },
      { periodo: "AG 2025", ultimoDigito: "81-82", fecha: "2026-10-22" },
      { periodo: "AG 2025", ultimoDigito: "83-84", fecha: "2026-10-23" },
      { periodo: "AG 2025", ultimoDigito: "85-86", fecha: "2026-10-27" },
      { periodo: "AG 2025", ultimoDigito: "87-88", fecha: "2026-10-28" },
      { periodo: "AG 2025", ultimoDigito: "89-90", fecha: "2026-10-29" },
      { periodo: "AG 2025", ultimoDigito: "91-92", fecha: "2026-10-30" },
      { periodo: "AG 2025", ultimoDigito: "93-94", fecha: "2026-11-03" },
      { periodo: "AG 2025", ultimoDigito: "95-96", fecha: "2026-11-04" },
      { periodo: "AG 2025", ultimoDigito: "97-98", fecha: "2026-11-05" },
      { periodo: "AG 2025", ultimoDigito: "99-00", fecha: "2026-11-06" },
    ],
  },

  // ──────────────────────────────────────────
  // 2. Declaracion de Renta Personas Juridicas
  // ──────────────────────────────────────────
  {
    obligacion: "Declaracion de Renta Personas Juridicas",
    descripcion: "Declaracion anual del impuesto sobre la renta sociedades",
    tipoContribuyente: "juridicas",
    periodicidad: "anual",
    vencimientos: [
      { periodo: "AG 2025", ultimoDigito: "1", fecha: "2026-04-14" },
      { periodo: "AG 2025", ultimoDigito: "2", fecha: "2026-04-15" },
      { periodo: "AG 2025", ultimoDigito: "3", fecha: "2026-04-16" },
      { periodo: "AG 2025", ultimoDigito: "4", fecha: "2026-04-17" },
      { periodo: "AG 2025", ultimoDigito: "5", fecha: "2026-04-20" },
      { periodo: "AG 2025", ultimoDigito: "6", fecha: "2026-04-21" },
      { periodo: "AG 2025", ultimoDigito: "7", fecha: "2026-04-22" },
      { periodo: "AG 2025", ultimoDigito: "8", fecha: "2026-04-23" },
      { periodo: "AG 2025", ultimoDigito: "9", fecha: "2026-04-24" },
      { periodo: "AG 2025", ultimoDigito: "0", fecha: "2026-04-27" },
    ],
  },

  // ──────────────────────────────────────────
  // 3. Retencion en la Fuente (mensual) — Ene a Dic 2026
  // ──────────────────────────────────────────
  {
    obligacion: "Retencion en la Fuente (mensual)",
    descripcion: "Declaracion y pago mensual de retenciones practicadas",
    tipoContribuyente: "todos",
    periodicidad: "mensual",
    vencimientos: [
      // Enero 2026 (vence Feb 2026)
      { periodo: "Enero 2026", ultimoDigito: "1", fecha: "2026-02-11" },
      { periodo: "Enero 2026", ultimoDigito: "2", fecha: "2026-02-11" },
      { periodo: "Enero 2026", ultimoDigito: "3", fecha: "2026-02-12" },
      { periodo: "Enero 2026", ultimoDigito: "4", fecha: "2026-02-12" },
      { periodo: "Enero 2026", ultimoDigito: "5", fecha: "2026-02-13" },
      { periodo: "Enero 2026", ultimoDigito: "6", fecha: "2026-02-13" },
      { periodo: "Enero 2026", ultimoDigito: "7", fecha: "2026-02-16" },
      { periodo: "Enero 2026", ultimoDigito: "8", fecha: "2026-02-16" },
      { periodo: "Enero 2026", ultimoDigito: "9", fecha: "2026-02-17" },
      { periodo: "Enero 2026", ultimoDigito: "0", fecha: "2026-02-17" },
      // Febrero 2026 (vence Mar 2026)
      { periodo: "Febrero 2026", ultimoDigito: "1", fecha: "2026-03-11" },
      { periodo: "Febrero 2026", ultimoDigito: "2", fecha: "2026-03-11" },
      { periodo: "Febrero 2026", ultimoDigito: "3", fecha: "2026-03-12" },
      { periodo: "Febrero 2026", ultimoDigito: "4", fecha: "2026-03-12" },
      { periodo: "Febrero 2026", ultimoDigito: "5", fecha: "2026-03-13" },
      { periodo: "Febrero 2026", ultimoDigito: "6", fecha: "2026-03-13" },
      { periodo: "Febrero 2026", ultimoDigito: "7", fecha: "2026-03-16" },
      { periodo: "Febrero 2026", ultimoDigito: "8", fecha: "2026-03-16" },
      { periodo: "Febrero 2026", ultimoDigito: "9", fecha: "2026-03-17" },
      { periodo: "Febrero 2026", ultimoDigito: "0", fecha: "2026-03-17" },
      // Marzo 2026 (vence Abr 2026)
      { periodo: "Marzo 2026", ultimoDigito: "1", fecha: "2026-04-08" },
      { periodo: "Marzo 2026", ultimoDigito: "2", fecha: "2026-04-08" },
      { periodo: "Marzo 2026", ultimoDigito: "3", fecha: "2026-04-09" },
      { periodo: "Marzo 2026", ultimoDigito: "4", fecha: "2026-04-09" },
      { periodo: "Marzo 2026", ultimoDigito: "5", fecha: "2026-04-10" },
      { periodo: "Marzo 2026", ultimoDigito: "6", fecha: "2026-04-10" },
      { periodo: "Marzo 2026", ultimoDigito: "7", fecha: "2026-04-13" },
      { periodo: "Marzo 2026", ultimoDigito: "8", fecha: "2026-04-13" },
      { periodo: "Marzo 2026", ultimoDigito: "9", fecha: "2026-04-14" },
      { periodo: "Marzo 2026", ultimoDigito: "0", fecha: "2026-04-14" },
      // Abril 2026 (vence May 2026)
      { periodo: "Abril 2026", ultimoDigito: "1", fecha: "2026-05-12" },
      { periodo: "Abril 2026", ultimoDigito: "2", fecha: "2026-05-12" },
      { periodo: "Abril 2026", ultimoDigito: "3", fecha: "2026-05-13" },
      { periodo: "Abril 2026", ultimoDigito: "4", fecha: "2026-05-13" },
      { periodo: "Abril 2026", ultimoDigito: "5", fecha: "2026-05-14" },
      { periodo: "Abril 2026", ultimoDigito: "6", fecha: "2026-05-14" },
      { periodo: "Abril 2026", ultimoDigito: "7", fecha: "2026-05-15" },
      { periodo: "Abril 2026", ultimoDigito: "8", fecha: "2026-05-15" },
      { periodo: "Abril 2026", ultimoDigito: "9", fecha: "2026-05-18" },
      { periodo: "Abril 2026", ultimoDigito: "0", fecha: "2026-05-18" },
      // Mayo 2026 (vence Jun 2026)
      { periodo: "Mayo 2026", ultimoDigito: "1", fecha: "2026-06-10" },
      { periodo: "Mayo 2026", ultimoDigito: "2", fecha: "2026-06-10" },
      { periodo: "Mayo 2026", ultimoDigito: "3", fecha: "2026-06-11" },
      { periodo: "Mayo 2026", ultimoDigito: "4", fecha: "2026-06-11" },
      { periodo: "Mayo 2026", ultimoDigito: "5", fecha: "2026-06-12" },
      { periodo: "Mayo 2026", ultimoDigito: "6", fecha: "2026-06-12" },
      { periodo: "Mayo 2026", ultimoDigito: "7", fecha: "2026-06-15" },
      { periodo: "Mayo 2026", ultimoDigito: "8", fecha: "2026-06-15" },
      { periodo: "Mayo 2026", ultimoDigito: "9", fecha: "2026-06-16" },
      { periodo: "Mayo 2026", ultimoDigito: "0", fecha: "2026-06-16" },
      // Junio 2026 (vence Jul 2026)
      { periodo: "Junio 2026", ultimoDigito: "1", fecha: "2026-07-09" },
      { periodo: "Junio 2026", ultimoDigito: "2", fecha: "2026-07-09" },
      { periodo: "Junio 2026", ultimoDigito: "3", fecha: "2026-07-10" },
      { periodo: "Junio 2026", ultimoDigito: "4", fecha: "2026-07-10" },
      { periodo: "Junio 2026", ultimoDigito: "5", fecha: "2026-07-13" },
      { periodo: "Junio 2026", ultimoDigito: "6", fecha: "2026-07-13" },
      { periodo: "Junio 2026", ultimoDigito: "7", fecha: "2026-07-14" },
      { periodo: "Junio 2026", ultimoDigito: "8", fecha: "2026-07-14" },
      { periodo: "Junio 2026", ultimoDigito: "9", fecha: "2026-07-15" },
      { periodo: "Junio 2026", ultimoDigito: "0", fecha: "2026-07-15" },
      // Julio 2026 (vence Ago 2026)
      { periodo: "Julio 2026", ultimoDigito: "1", fecha: "2026-08-11" },
      { periodo: "Julio 2026", ultimoDigito: "2", fecha: "2026-08-11" },
      { periodo: "Julio 2026", ultimoDigito: "3", fecha: "2026-08-12" },
      { periodo: "Julio 2026", ultimoDigito: "4", fecha: "2026-08-12" },
      { periodo: "Julio 2026", ultimoDigito: "5", fecha: "2026-08-13" },
      { periodo: "Julio 2026", ultimoDigito: "6", fecha: "2026-08-13" },
      { periodo: "Julio 2026", ultimoDigito: "7", fecha: "2026-08-14" },
      { periodo: "Julio 2026", ultimoDigito: "8", fecha: "2026-08-14" },
      { periodo: "Julio 2026", ultimoDigito: "9", fecha: "2026-08-17" },
      { periodo: "Julio 2026", ultimoDigito: "0", fecha: "2026-08-17" },
      // Agosto 2026 (vence Sep 2026)
      { periodo: "Agosto 2026", ultimoDigito: "1", fecha: "2026-09-09" },
      { periodo: "Agosto 2026", ultimoDigito: "2", fecha: "2026-09-09" },
      { periodo: "Agosto 2026", ultimoDigito: "3", fecha: "2026-09-10" },
      { periodo: "Agosto 2026", ultimoDigito: "4", fecha: "2026-09-10" },
      { periodo: "Agosto 2026", ultimoDigito: "5", fecha: "2026-09-11" },
      { periodo: "Agosto 2026", ultimoDigito: "6", fecha: "2026-09-11" },
      { periodo: "Agosto 2026", ultimoDigito: "7", fecha: "2026-09-14" },
      { periodo: "Agosto 2026", ultimoDigito: "8", fecha: "2026-09-14" },
      { periodo: "Agosto 2026", ultimoDigito: "9", fecha: "2026-09-15" },
      { periodo: "Agosto 2026", ultimoDigito: "0", fecha: "2026-09-15" },
      // Septiembre 2026 (vence Oct 2026)
      { periodo: "Septiembre 2026", ultimoDigito: "1", fecha: "2026-10-09" },
      { periodo: "Septiembre 2026", ultimoDigito: "2", fecha: "2026-10-09" },
      { periodo: "Septiembre 2026", ultimoDigito: "3", fecha: "2026-10-13" },
      { periodo: "Septiembre 2026", ultimoDigito: "4", fecha: "2026-10-13" },
      { periodo: "Septiembre 2026", ultimoDigito: "5", fecha: "2026-10-14" },
      { periodo: "Septiembre 2026", ultimoDigito: "6", fecha: "2026-10-14" },
      { periodo: "Septiembre 2026", ultimoDigito: "7", fecha: "2026-10-15" },
      { periodo: "Septiembre 2026", ultimoDigito: "8", fecha: "2026-10-15" },
      { periodo: "Septiembre 2026", ultimoDigito: "9", fecha: "2026-10-16" },
      { periodo: "Septiembre 2026", ultimoDigito: "0", fecha: "2026-10-16" },
      // Octubre 2026 (vence Nov 2026)
      { periodo: "Octubre 2026", ultimoDigito: "1", fecha: "2026-11-10" },
      { periodo: "Octubre 2026", ultimoDigito: "2", fecha: "2026-11-10" },
      { periodo: "Octubre 2026", ultimoDigito: "3", fecha: "2026-11-11" },
      { periodo: "Octubre 2026", ultimoDigito: "4", fecha: "2026-11-11" },
      { periodo: "Octubre 2026", ultimoDigito: "5", fecha: "2026-11-12" },
      { periodo: "Octubre 2026", ultimoDigito: "6", fecha: "2026-11-12" },
      { periodo: "Octubre 2026", ultimoDigito: "7", fecha: "2026-11-13" },
      { periodo: "Octubre 2026", ultimoDigito: "8", fecha: "2026-11-13" },
      { periodo: "Octubre 2026", ultimoDigito: "9", fecha: "2026-11-16" },
      { periodo: "Octubre 2026", ultimoDigito: "0", fecha: "2026-11-16" },
      // Noviembre 2026 (vence Dic 2026)
      { periodo: "Noviembre 2026", ultimoDigito: "1", fecha: "2026-12-09" },
      { periodo: "Noviembre 2026", ultimoDigito: "2", fecha: "2026-12-09" },
      { periodo: "Noviembre 2026", ultimoDigito: "3", fecha: "2026-12-10" },
      { periodo: "Noviembre 2026", ultimoDigito: "4", fecha: "2026-12-10" },
      { periodo: "Noviembre 2026", ultimoDigito: "5", fecha: "2026-12-11" },
      { periodo: "Noviembre 2026", ultimoDigito: "6", fecha: "2026-12-11" },
      { periodo: "Noviembre 2026", ultimoDigito: "7", fecha: "2026-12-14" },
      { periodo: "Noviembre 2026", ultimoDigito: "8", fecha: "2026-12-14" },
      { periodo: "Noviembre 2026", ultimoDigito: "9", fecha: "2026-12-15" },
      { periodo: "Noviembre 2026", ultimoDigito: "0", fecha: "2026-12-15" },
      // Diciembre 2026 (vence Ene 2027)
      { periodo: "Diciembre 2026", ultimoDigito: "1", fecha: "2027-01-12" },
      { periodo: "Diciembre 2026", ultimoDigito: "2", fecha: "2027-01-12" },
      { periodo: "Diciembre 2026", ultimoDigito: "3", fecha: "2027-01-13" },
      { periodo: "Diciembre 2026", ultimoDigito: "4", fecha: "2027-01-13" },
      { periodo: "Diciembre 2026", ultimoDigito: "5", fecha: "2027-01-14" },
      { periodo: "Diciembre 2026", ultimoDigito: "6", fecha: "2027-01-14" },
      { periodo: "Diciembre 2026", ultimoDigito: "7", fecha: "2027-01-15" },
      { periodo: "Diciembre 2026", ultimoDigito: "8", fecha: "2027-01-15" },
      { periodo: "Diciembre 2026", ultimoDigito: "9", fecha: "2027-01-19" },
      { periodo: "Diciembre 2026", ultimoDigito: "0", fecha: "2027-01-19" },
    ],
  },

  // ──────────────────────────────────────────
  // 4. IVA Bimestral — 6 bimestres
  // ──────────────────────────────────────────
  {
    obligacion: "IVA Bimestral",
    descripcion: "Declaracion bimestral del impuesto sobre las ventas",
    tipoContribuyente: "todos",
    periodicidad: "bimestral",
    vencimientos: [
      // Bimestre 1: Ene-Feb 2026 (vence Mar 2026)
      { periodo: "Ene-Feb 2026", ultimoDigito: "1", fecha: "2026-03-11" },
      { periodo: "Ene-Feb 2026", ultimoDigito: "2", fecha: "2026-03-11" },
      { periodo: "Ene-Feb 2026", ultimoDigito: "3", fecha: "2026-03-12" },
      { periodo: "Ene-Feb 2026", ultimoDigito: "4", fecha: "2026-03-12" },
      { periodo: "Ene-Feb 2026", ultimoDigito: "5", fecha: "2026-03-13" },
      { periodo: "Ene-Feb 2026", ultimoDigito: "6", fecha: "2026-03-13" },
      { periodo: "Ene-Feb 2026", ultimoDigito: "7", fecha: "2026-03-16" },
      { periodo: "Ene-Feb 2026", ultimoDigito: "8", fecha: "2026-03-16" },
      { periodo: "Ene-Feb 2026", ultimoDigito: "9", fecha: "2026-03-17" },
      { periodo: "Ene-Feb 2026", ultimoDigito: "0", fecha: "2026-03-17" },
      // Bimestre 2: Mar-Abr 2026 (vence May 2026)
      { periodo: "Mar-Abr 2026", ultimoDigito: "1", fecha: "2026-05-12" },
      { periodo: "Mar-Abr 2026", ultimoDigito: "2", fecha: "2026-05-12" },
      { periodo: "Mar-Abr 2026", ultimoDigito: "3", fecha: "2026-05-13" },
      { periodo: "Mar-Abr 2026", ultimoDigito: "4", fecha: "2026-05-13" },
      { periodo: "Mar-Abr 2026", ultimoDigito: "5", fecha: "2026-05-14" },
      { periodo: "Mar-Abr 2026", ultimoDigito: "6", fecha: "2026-05-14" },
      { periodo: "Mar-Abr 2026", ultimoDigito: "7", fecha: "2026-05-15" },
      { periodo: "Mar-Abr 2026", ultimoDigito: "8", fecha: "2026-05-15" },
      { periodo: "Mar-Abr 2026", ultimoDigito: "9", fecha: "2026-05-18" },
      { periodo: "Mar-Abr 2026", ultimoDigito: "0", fecha: "2026-05-18" },
      // Bimestre 3: May-Jun 2026 (vence Jul 2026)
      { periodo: "May-Jun 2026", ultimoDigito: "1", fecha: "2026-07-09" },
      { periodo: "May-Jun 2026", ultimoDigito: "2", fecha: "2026-07-09" },
      { periodo: "May-Jun 2026", ultimoDigito: "3", fecha: "2026-07-10" },
      { periodo: "May-Jun 2026", ultimoDigito: "4", fecha: "2026-07-10" },
      { periodo: "May-Jun 2026", ultimoDigito: "5", fecha: "2026-07-13" },
      { periodo: "May-Jun 2026", ultimoDigito: "6", fecha: "2026-07-13" },
      { periodo: "May-Jun 2026", ultimoDigito: "7", fecha: "2026-07-14" },
      { periodo: "May-Jun 2026", ultimoDigito: "8", fecha: "2026-07-14" },
      { periodo: "May-Jun 2026", ultimoDigito: "9", fecha: "2026-07-15" },
      { periodo: "May-Jun 2026", ultimoDigito: "0", fecha: "2026-07-15" },
      // Bimestre 4: Jul-Ago 2026 (vence Sep 2026)
      { periodo: "Jul-Ago 2026", ultimoDigito: "1", fecha: "2026-09-09" },
      { periodo: "Jul-Ago 2026", ultimoDigito: "2", fecha: "2026-09-09" },
      { periodo: "Jul-Ago 2026", ultimoDigito: "3", fecha: "2026-09-10" },
      { periodo: "Jul-Ago 2026", ultimoDigito: "4", fecha: "2026-09-10" },
      { periodo: "Jul-Ago 2026", ultimoDigito: "5", fecha: "2026-09-11" },
      { periodo: "Jul-Ago 2026", ultimoDigito: "6", fecha: "2026-09-11" },
      { periodo: "Jul-Ago 2026", ultimoDigito: "7", fecha: "2026-09-14" },
      { periodo: "Jul-Ago 2026", ultimoDigito: "8", fecha: "2026-09-14" },
      { periodo: "Jul-Ago 2026", ultimoDigito: "9", fecha: "2026-09-15" },
      { periodo: "Jul-Ago 2026", ultimoDigito: "0", fecha: "2026-09-15" },
      // Bimestre 5: Sep-Oct 2026 (vence Nov 2026)
      { periodo: "Sep-Oct 2026", ultimoDigito: "1", fecha: "2026-11-10" },
      { periodo: "Sep-Oct 2026", ultimoDigito: "2", fecha: "2026-11-10" },
      { periodo: "Sep-Oct 2026", ultimoDigito: "3", fecha: "2026-11-11" },
      { periodo: "Sep-Oct 2026", ultimoDigito: "4", fecha: "2026-11-11" },
      { periodo: "Sep-Oct 2026", ultimoDigito: "5", fecha: "2026-11-12" },
      { periodo: "Sep-Oct 2026", ultimoDigito: "6", fecha: "2026-11-12" },
      { periodo: "Sep-Oct 2026", ultimoDigito: "7", fecha: "2026-11-13" },
      { periodo: "Sep-Oct 2026", ultimoDigito: "8", fecha: "2026-11-13" },
      { periodo: "Sep-Oct 2026", ultimoDigito: "9", fecha: "2026-11-16" },
      { periodo: "Sep-Oct 2026", ultimoDigito: "0", fecha: "2026-11-16" },
      // Bimestre 6: Nov-Dic 2026 (vence Ene 2027)
      { periodo: "Nov-Dic 2026", ultimoDigito: "1", fecha: "2027-01-12" },
      { periodo: "Nov-Dic 2026", ultimoDigito: "2", fecha: "2027-01-12" },
      { periodo: "Nov-Dic 2026", ultimoDigito: "3", fecha: "2027-01-13" },
      { periodo: "Nov-Dic 2026", ultimoDigito: "4", fecha: "2027-01-13" },
      { periodo: "Nov-Dic 2026", ultimoDigito: "5", fecha: "2027-01-14" },
      { periodo: "Nov-Dic 2026", ultimoDigito: "6", fecha: "2027-01-14" },
      { periodo: "Nov-Dic 2026", ultimoDigito: "7", fecha: "2027-01-15" },
      { periodo: "Nov-Dic 2026", ultimoDigito: "8", fecha: "2027-01-15" },
      { periodo: "Nov-Dic 2026", ultimoDigito: "9", fecha: "2027-01-19" },
      { periodo: "Nov-Dic 2026", ultimoDigito: "0", fecha: "2027-01-19" },
    ],
  },

  // ──────────────────────────────────────────
  // 5. IVA Cuatrimestral — 3 cuatrimestres
  // ──────────────────────────────────────────
  {
    obligacion: "IVA Cuatrimestral",
    descripcion: "Declaracion cuatrimestral del impuesto sobre las ventas para contribuyentes con menores ingresos",
    tipoContribuyente: "todos",
    periodicidad: "cuatrimestral",
    vencimientos: [
      // Cuatrimestre 1: Ene-Abr 2026 (vence May 2026)
      { periodo: "Ene-Abr 2026", ultimoDigito: "1", fecha: "2026-05-12" },
      { periodo: "Ene-Abr 2026", ultimoDigito: "2", fecha: "2026-05-12" },
      { periodo: "Ene-Abr 2026", ultimoDigito: "3", fecha: "2026-05-13" },
      { periodo: "Ene-Abr 2026", ultimoDigito: "4", fecha: "2026-05-13" },
      { periodo: "Ene-Abr 2026", ultimoDigito: "5", fecha: "2026-05-14" },
      { periodo: "Ene-Abr 2026", ultimoDigito: "6", fecha: "2026-05-14" },
      { periodo: "Ene-Abr 2026", ultimoDigito: "7", fecha: "2026-05-15" },
      { periodo: "Ene-Abr 2026", ultimoDigito: "8", fecha: "2026-05-15" },
      { periodo: "Ene-Abr 2026", ultimoDigito: "9", fecha: "2026-05-18" },
      { periodo: "Ene-Abr 2026", ultimoDigito: "0", fecha: "2026-05-18" },
      // Cuatrimestre 2: May-Ago 2026 (vence Sep 2026)
      { periodo: "May-Ago 2026", ultimoDigito: "1", fecha: "2026-09-09" },
      { periodo: "May-Ago 2026", ultimoDigito: "2", fecha: "2026-09-09" },
      { periodo: "May-Ago 2026", ultimoDigito: "3", fecha: "2026-09-10" },
      { periodo: "May-Ago 2026", ultimoDigito: "4", fecha: "2026-09-10" },
      { periodo: "May-Ago 2026", ultimoDigito: "5", fecha: "2026-09-11" },
      { periodo: "May-Ago 2026", ultimoDigito: "6", fecha: "2026-09-11" },
      { periodo: "May-Ago 2026", ultimoDigito: "7", fecha: "2026-09-14" },
      { periodo: "May-Ago 2026", ultimoDigito: "8", fecha: "2026-09-14" },
      { periodo: "May-Ago 2026", ultimoDigito: "9", fecha: "2026-09-15" },
      { periodo: "May-Ago 2026", ultimoDigito: "0", fecha: "2026-09-15" },
      // Cuatrimestre 3: Sep-Dic 2026 (vence Ene 2027)
      { periodo: "Sep-Dic 2026", ultimoDigito: "1", fecha: "2027-01-12" },
      { periodo: "Sep-Dic 2026", ultimoDigito: "2", fecha: "2027-01-12" },
      { periodo: "Sep-Dic 2026", ultimoDigito: "3", fecha: "2027-01-13" },
      { periodo: "Sep-Dic 2026", ultimoDigito: "4", fecha: "2027-01-13" },
      { periodo: "Sep-Dic 2026", ultimoDigito: "5", fecha: "2027-01-14" },
      { periodo: "Sep-Dic 2026", ultimoDigito: "6", fecha: "2027-01-14" },
      { periodo: "Sep-Dic 2026", ultimoDigito: "7", fecha: "2027-01-15" },
      { periodo: "Sep-Dic 2026", ultimoDigito: "8", fecha: "2027-01-15" },
      { periodo: "Sep-Dic 2026", ultimoDigito: "9", fecha: "2027-01-19" },
      { periodo: "Sep-Dic 2026", ultimoDigito: "0", fecha: "2027-01-19" },
    ],
  },

  // ──────────────────────────────────────────
  // 6. SIMPLE Anticipo bimestral — 6 bimestres
  // ──────────────────────────────────────────
  {
    obligacion: "SIMPLE Anticipo Bimestral",
    descripcion: "Anticipo bimestral del Regimen Simple de Tributacion (RST)",
    tipoContribuyente: "todos",
    periodicidad: "bimestral",
    vencimientos: [
      // Bimestre 1: Ene-Feb 2026 (vence Mar 2026)
      { periodo: "Ene-Feb 2026", ultimoDigito: "1", fecha: "2026-03-18" },
      { periodo: "Ene-Feb 2026", ultimoDigito: "2", fecha: "2026-03-18" },
      { periodo: "Ene-Feb 2026", ultimoDigito: "3", fecha: "2026-03-19" },
      { periodo: "Ene-Feb 2026", ultimoDigito: "4", fecha: "2026-03-19" },
      { periodo: "Ene-Feb 2026", ultimoDigito: "5", fecha: "2026-03-20" },
      { periodo: "Ene-Feb 2026", ultimoDigito: "6", fecha: "2026-03-20" },
      { periodo: "Ene-Feb 2026", ultimoDigito: "7", fecha: "2026-03-23" },
      { periodo: "Ene-Feb 2026", ultimoDigito: "8", fecha: "2026-03-23" },
      { periodo: "Ene-Feb 2026", ultimoDigito: "9", fecha: "2026-03-24" },
      { periodo: "Ene-Feb 2026", ultimoDigito: "0", fecha: "2026-03-24" },
      // Bimestre 2: Mar-Abr 2026 (vence May 2026)
      { periodo: "Mar-Abr 2026", ultimoDigito: "1", fecha: "2026-05-19" },
      { periodo: "Mar-Abr 2026", ultimoDigito: "2", fecha: "2026-05-19" },
      { periodo: "Mar-Abr 2026", ultimoDigito: "3", fecha: "2026-05-20" },
      { periodo: "Mar-Abr 2026", ultimoDigito: "4", fecha: "2026-05-20" },
      { periodo: "Mar-Abr 2026", ultimoDigito: "5", fecha: "2026-05-21" },
      { periodo: "Mar-Abr 2026", ultimoDigito: "6", fecha: "2026-05-21" },
      { periodo: "Mar-Abr 2026", ultimoDigito: "7", fecha: "2026-05-22" },
      { periodo: "Mar-Abr 2026", ultimoDigito: "8", fecha: "2026-05-22" },
      { periodo: "Mar-Abr 2026", ultimoDigito: "9", fecha: "2026-05-25" },
      { periodo: "Mar-Abr 2026", ultimoDigito: "0", fecha: "2026-05-25" },
      // Bimestre 3: May-Jun 2026 (vence Jul 2026)
      { periodo: "May-Jun 2026", ultimoDigito: "1", fecha: "2026-07-16" },
      { periodo: "May-Jun 2026", ultimoDigito: "2", fecha: "2026-07-16" },
      { periodo: "May-Jun 2026", ultimoDigito: "3", fecha: "2026-07-17" },
      { periodo: "May-Jun 2026", ultimoDigito: "4", fecha: "2026-07-17" },
      { periodo: "May-Jun 2026", ultimoDigito: "5", fecha: "2026-07-20" },
      { periodo: "May-Jun 2026", ultimoDigito: "6", fecha: "2026-07-20" },
      { periodo: "May-Jun 2026", ultimoDigito: "7", fecha: "2026-07-21" },
      { periodo: "May-Jun 2026", ultimoDigito: "8", fecha: "2026-07-21" },
      { periodo: "May-Jun 2026", ultimoDigito: "9", fecha: "2026-07-22" },
      { periodo: "May-Jun 2026", ultimoDigito: "0", fecha: "2026-07-22" },
      // Bimestre 4: Jul-Ago 2026 (vence Sep 2026)
      { periodo: "Jul-Ago 2026", ultimoDigito: "1", fecha: "2026-09-16" },
      { periodo: "Jul-Ago 2026", ultimoDigito: "2", fecha: "2026-09-16" },
      { periodo: "Jul-Ago 2026", ultimoDigito: "3", fecha: "2026-09-17" },
      { periodo: "Jul-Ago 2026", ultimoDigito: "4", fecha: "2026-09-17" },
      { periodo: "Jul-Ago 2026", ultimoDigito: "5", fecha: "2026-09-18" },
      { periodo: "Jul-Ago 2026", ultimoDigito: "6", fecha: "2026-09-18" },
      { periodo: "Jul-Ago 2026", ultimoDigito: "7", fecha: "2026-09-21" },
      { periodo: "Jul-Ago 2026", ultimoDigito: "8", fecha: "2026-09-21" },
      { periodo: "Jul-Ago 2026", ultimoDigito: "9", fecha: "2026-09-22" },
      { periodo: "Jul-Ago 2026", ultimoDigito: "0", fecha: "2026-09-22" },
      // Bimestre 5: Sep-Oct 2026 (vence Nov 2026)
      { periodo: "Sep-Oct 2026", ultimoDigito: "1", fecha: "2026-11-17" },
      { periodo: "Sep-Oct 2026", ultimoDigito: "2", fecha: "2026-11-17" },
      { periodo: "Sep-Oct 2026", ultimoDigito: "3", fecha: "2026-11-18" },
      { periodo: "Sep-Oct 2026", ultimoDigito: "4", fecha: "2026-11-18" },
      { periodo: "Sep-Oct 2026", ultimoDigito: "5", fecha: "2026-11-19" },
      { periodo: "Sep-Oct 2026", ultimoDigito: "6", fecha: "2026-11-19" },
      { periodo: "Sep-Oct 2026", ultimoDigito: "7", fecha: "2026-11-20" },
      { periodo: "Sep-Oct 2026", ultimoDigito: "8", fecha: "2026-11-20" },
      { periodo: "Sep-Oct 2026", ultimoDigito: "9", fecha: "2026-11-23" },
      { periodo: "Sep-Oct 2026", ultimoDigito: "0", fecha: "2026-11-23" },
      // Bimestre 6: Nov-Dic 2026 (vence Ene 2027)
      { periodo: "Nov-Dic 2026", ultimoDigito: "1", fecha: "2027-01-20" },
      { periodo: "Nov-Dic 2026", ultimoDigito: "2", fecha: "2027-01-20" },
      { periodo: "Nov-Dic 2026", ultimoDigito: "3", fecha: "2027-01-21" },
      { periodo: "Nov-Dic 2026", ultimoDigito: "4", fecha: "2027-01-21" },
      { periodo: "Nov-Dic 2026", ultimoDigito: "5", fecha: "2027-01-22" },
      { periodo: "Nov-Dic 2026", ultimoDigito: "6", fecha: "2027-01-22" },
      { periodo: "Nov-Dic 2026", ultimoDigito: "7", fecha: "2027-01-23" },
      { periodo: "Nov-Dic 2026", ultimoDigito: "8", fecha: "2027-01-23" },
      { periodo: "Nov-Dic 2026", ultimoDigito: "9", fecha: "2027-01-26" },
      { periodo: "Nov-Dic 2026", ultimoDigito: "0", fecha: "2027-01-26" },
    ],
  },

  // ──────────────────────────────────────────
  // 7. SIMPLE Declaracion Anual
  // ──────────────────────────────────────────
  {
    obligacion: "SIMPLE Declaracion Anual",
    descripcion: "Declaracion anual consolidada del Regimen Simple de Tributacion (RST)",
    tipoContribuyente: "todos",
    periodicidad: "anual",
    vencimientos: [
      { periodo: "AG 2025", ultimoDigito: "1", fecha: "2026-10-13" },
      { periodo: "AG 2025", ultimoDigito: "2", fecha: "2026-10-13" },
      { periodo: "AG 2025", ultimoDigito: "3", fecha: "2026-10-14" },
      { periodo: "AG 2025", ultimoDigito: "4", fecha: "2026-10-14" },
      { periodo: "AG 2025", ultimoDigito: "5", fecha: "2026-10-15" },
      { periodo: "AG 2025", ultimoDigito: "6", fecha: "2026-10-15" },
      { periodo: "AG 2025", ultimoDigito: "7", fecha: "2026-10-16" },
      { periodo: "AG 2025", ultimoDigito: "8", fecha: "2026-10-16" },
      { periodo: "AG 2025", ultimoDigito: "9", fecha: "2026-10-19" },
      { periodo: "AG 2025", ultimoDigito: "0", fecha: "2026-10-19" },
    ],
  },

  // ──────────────────────────────────────────
  // 8. ICA Bogota Bimestral — 6 bimestres
  // ──────────────────────────────────────────
  {
    obligacion: "ICA Bogota Bimestral",
    descripcion: "Impuesto de Industria y Comercio, Avisos y Tableros - Bogota D.C.",
    tipoContribuyente: "todos",
    periodicidad: "bimestral",
    vencimientos: [
      // Bimestre 1: Ene-Feb 2026 (vence Mar 2026)
      { periodo: "Ene-Feb 2026", ultimoDigito: "1", fecha: "2026-03-18" },
      { periodo: "Ene-Feb 2026", ultimoDigito: "2", fecha: "2026-03-19" },
      { periodo: "Ene-Feb 2026", ultimoDigito: "3", fecha: "2026-03-20" },
      { periodo: "Ene-Feb 2026", ultimoDigito: "4", fecha: "2026-03-23" },
      { periodo: "Ene-Feb 2026", ultimoDigito: "5", fecha: "2026-03-24" },
      { periodo: "Ene-Feb 2026", ultimoDigito: "6", fecha: "2026-03-25" },
      { periodo: "Ene-Feb 2026", ultimoDigito: "7", fecha: "2026-03-26" },
      { periodo: "Ene-Feb 2026", ultimoDigito: "8", fecha: "2026-03-27" },
      { periodo: "Ene-Feb 2026", ultimoDigito: "9", fecha: "2026-03-30" },
      { periodo: "Ene-Feb 2026", ultimoDigito: "0", fecha: "2026-03-31" },
      // Bimestre 2: Mar-Abr 2026 (vence May 2026)
      { periodo: "Mar-Abr 2026", ultimoDigito: "1", fecha: "2026-05-19" },
      { periodo: "Mar-Abr 2026", ultimoDigito: "2", fecha: "2026-05-20" },
      { periodo: "Mar-Abr 2026", ultimoDigito: "3", fecha: "2026-05-21" },
      { periodo: "Mar-Abr 2026", ultimoDigito: "4", fecha: "2026-05-22" },
      { periodo: "Mar-Abr 2026", ultimoDigito: "5", fecha: "2026-05-25" },
      { periodo: "Mar-Abr 2026", ultimoDigito: "6", fecha: "2026-05-26" },
      { periodo: "Mar-Abr 2026", ultimoDigito: "7", fecha: "2026-05-27" },
      { periodo: "Mar-Abr 2026", ultimoDigito: "8", fecha: "2026-05-28" },
      { periodo: "Mar-Abr 2026", ultimoDigito: "9", fecha: "2026-05-29" },
      { periodo: "Mar-Abr 2026", ultimoDigito: "0", fecha: "2026-06-01" },
      // Bimestre 3: May-Jun 2026 (vence Jul 2026)
      { periodo: "May-Jun 2026", ultimoDigito: "1", fecha: "2026-07-16" },
      { periodo: "May-Jun 2026", ultimoDigito: "2", fecha: "2026-07-17" },
      { periodo: "May-Jun 2026", ultimoDigito: "3", fecha: "2026-07-20" },
      { periodo: "May-Jun 2026", ultimoDigito: "4", fecha: "2026-07-21" },
      { periodo: "May-Jun 2026", ultimoDigito: "5", fecha: "2026-07-22" },
      { periodo: "May-Jun 2026", ultimoDigito: "6", fecha: "2026-07-23" },
      { periodo: "May-Jun 2026", ultimoDigito: "7", fecha: "2026-07-24" },
      { periodo: "May-Jun 2026", ultimoDigito: "8", fecha: "2026-07-27" },
      { periodo: "May-Jun 2026", ultimoDigito: "9", fecha: "2026-07-28" },
      { periodo: "May-Jun 2026", ultimoDigito: "0", fecha: "2026-07-29" },
      // Bimestre 4: Jul-Ago 2026 (vence Sep 2026)
      { periodo: "Jul-Ago 2026", ultimoDigito: "1", fecha: "2026-09-16" },
      { periodo: "Jul-Ago 2026", ultimoDigito: "2", fecha: "2026-09-17" },
      { periodo: "Jul-Ago 2026", ultimoDigito: "3", fecha: "2026-09-18" },
      { periodo: "Jul-Ago 2026", ultimoDigito: "4", fecha: "2026-09-21" },
      { periodo: "Jul-Ago 2026", ultimoDigito: "5", fecha: "2026-09-22" },
      { periodo: "Jul-Ago 2026", ultimoDigito: "6", fecha: "2026-09-23" },
      { periodo: "Jul-Ago 2026", ultimoDigito: "7", fecha: "2026-09-24" },
      { periodo: "Jul-Ago 2026", ultimoDigito: "8", fecha: "2026-09-25" },
      { periodo: "Jul-Ago 2026", ultimoDigito: "9", fecha: "2026-09-28" },
      { periodo: "Jul-Ago 2026", ultimoDigito: "0", fecha: "2026-09-29" },
      // Bimestre 5: Sep-Oct 2026 (vence Nov 2026)
      { periodo: "Sep-Oct 2026", ultimoDigito: "1", fecha: "2026-11-17" },
      { periodo: "Sep-Oct 2026", ultimoDigito: "2", fecha: "2026-11-18" },
      { periodo: "Sep-Oct 2026", ultimoDigito: "3", fecha: "2026-11-19" },
      { periodo: "Sep-Oct 2026", ultimoDigito: "4", fecha: "2026-11-20" },
      { periodo: "Sep-Oct 2026", ultimoDigito: "5", fecha: "2026-11-23" },
      { periodo: "Sep-Oct 2026", ultimoDigito: "6", fecha: "2026-11-24" },
      { periodo: "Sep-Oct 2026", ultimoDigito: "7", fecha: "2026-11-25" },
      { periodo: "Sep-Oct 2026", ultimoDigito: "8", fecha: "2026-11-26" },
      { periodo: "Sep-Oct 2026", ultimoDigito: "9", fecha: "2026-11-27" },
      { periodo: "Sep-Oct 2026", ultimoDigito: "0", fecha: "2026-11-30" },
      // Bimestre 6: Nov-Dic 2026 (vence Ene 2027)
      { periodo: "Nov-Dic 2026", ultimoDigito: "1", fecha: "2027-01-20" },
      { periodo: "Nov-Dic 2026", ultimoDigito: "2", fecha: "2027-01-21" },
      { periodo: "Nov-Dic 2026", ultimoDigito: "3", fecha: "2027-01-22" },
      { periodo: "Nov-Dic 2026", ultimoDigito: "4", fecha: "2027-01-23" },
      { periodo: "Nov-Dic 2026", ultimoDigito: "5", fecha: "2027-01-26" },
      { periodo: "Nov-Dic 2026", ultimoDigito: "6", fecha: "2027-01-27" },
      { periodo: "Nov-Dic 2026", ultimoDigito: "7", fecha: "2027-01-28" },
      { periodo: "Nov-Dic 2026", ultimoDigito: "8", fecha: "2027-01-29" },
      { periodo: "Nov-Dic 2026", ultimoDigito: "9", fecha: "2027-01-30" },
      { periodo: "Nov-Dic 2026", ultimoDigito: "0", fecha: "2027-02-02" },
    ],
  },

  // ──────────────────────────────────────────
  // 9. Impuesto al Patrimonio
  // ──────────────────────────────────────────
  {
    obligacion: "Impuesto al Patrimonio",
    descripcion: "Declaracion y pago del impuesto al patrimonio para patrimonios superiores a 72.000 UVT",
    tipoContribuyente: "todos",
    periodicidad: "anual",
    vencimientos: [
      { periodo: "AG 2025", ultimoDigito: "1", fecha: "2026-05-12" },
      { periodo: "AG 2025", ultimoDigito: "2", fecha: "2026-05-12" },
      { periodo: "AG 2025", ultimoDigito: "3", fecha: "2026-05-13" },
      { periodo: "AG 2025", ultimoDigito: "4", fecha: "2026-05-13" },
      { periodo: "AG 2025", ultimoDigito: "5", fecha: "2026-05-14" },
      { periodo: "AG 2025", ultimoDigito: "6", fecha: "2026-05-14" },
      { periodo: "AG 2025", ultimoDigito: "7", fecha: "2026-05-15" },
      { periodo: "AG 2025", ultimoDigito: "8", fecha: "2026-05-15" },
      { periodo: "AG 2025", ultimoDigito: "9", fecha: "2026-05-18" },
      { periodo: "AG 2025", ultimoDigito: "0", fecha: "2026-05-18" },
    ],
  },

  // ──────────────────────────────────────────
  // 10. Activos en el Exterior
  // ──────────────────────────────────────────
  {
    obligacion: "Activos en el Exterior",
    descripcion: "Declaracion informativa de activos en el exterior (formulario 160)",
    tipoContribuyente: "todos",
    periodicidad: "anual",
    vencimientos: [
      { periodo: "AG 2025", ultimoDigito: "1", fecha: "2026-05-12" },
      { periodo: "AG 2025", ultimoDigito: "2", fecha: "2026-05-12" },
      { periodo: "AG 2025", ultimoDigito: "3", fecha: "2026-05-13" },
      { periodo: "AG 2025", ultimoDigito: "4", fecha: "2026-05-13" },
      { periodo: "AG 2025", ultimoDigito: "5", fecha: "2026-05-14" },
      { periodo: "AG 2025", ultimoDigito: "6", fecha: "2026-05-14" },
      { periodo: "AG 2025", ultimoDigito: "7", fecha: "2026-05-15" },
      { periodo: "AG 2025", ultimoDigito: "8", fecha: "2026-05-15" },
      { periodo: "AG 2025", ultimoDigito: "9", fecha: "2026-05-18" },
      { periodo: "AG 2025", ultimoDigito: "0", fecha: "2026-05-18" },
    ],
  },

  // ──────────────────────────────────────────
  // 11. Grandes Contribuyentes Renta (Primera cuota Feb, Segunda cuota Abr)
  // ──────────────────────────────────────────
  {
    obligacion: "Grandes Contribuyentes Renta - Primera Cuota",
    descripcion: "Primera cuota del impuesto sobre la renta para grandes contribuyentes",
    tipoContribuyente: "grandes",
    periodicidad: "anual",
    vencimientos: [
      { periodo: "AG 2025 - Cuota 1", ultimoDigito: "1", fecha: "2026-02-11" },
      { periodo: "AG 2025 - Cuota 1", ultimoDigito: "2", fecha: "2026-02-11" },
      { periodo: "AG 2025 - Cuota 1", ultimoDigito: "3", fecha: "2026-02-12" },
      { periodo: "AG 2025 - Cuota 1", ultimoDigito: "4", fecha: "2026-02-12" },
      { periodo: "AG 2025 - Cuota 1", ultimoDigito: "5", fecha: "2026-02-13" },
      { periodo: "AG 2025 - Cuota 1", ultimoDigito: "6", fecha: "2026-02-13" },
      { periodo: "AG 2025 - Cuota 1", ultimoDigito: "7", fecha: "2026-02-16" },
      { periodo: "AG 2025 - Cuota 1", ultimoDigito: "8", fecha: "2026-02-16" },
      { periodo: "AG 2025 - Cuota 1", ultimoDigito: "9", fecha: "2026-02-17" },
      { periodo: "AG 2025 - Cuota 1", ultimoDigito: "0", fecha: "2026-02-17" },
    ],
  },
  {
    obligacion: "Grandes Contribuyentes Renta - Segunda Cuota",
    descripcion: "Segunda cuota del impuesto sobre la renta para grandes contribuyentes",
    tipoContribuyente: "grandes",
    periodicidad: "anual",
    vencimientos: [
      { periodo: "AG 2025 - Cuota 2", ultimoDigito: "1", fecha: "2026-04-14" },
      { periodo: "AG 2025 - Cuota 2", ultimoDigito: "2", fecha: "2026-04-14" },
      { periodo: "AG 2025 - Cuota 2", ultimoDigito: "3", fecha: "2026-04-15" },
      { periodo: "AG 2025 - Cuota 2", ultimoDigito: "4", fecha: "2026-04-15" },
      { periodo: "AG 2025 - Cuota 2", ultimoDigito: "5", fecha: "2026-04-16" },
      { periodo: "AG 2025 - Cuota 2", ultimoDigito: "6", fecha: "2026-04-16" },
      { periodo: "AG 2025 - Cuota 2", ultimoDigito: "7", fecha: "2026-04-17" },
      { periodo: "AG 2025 - Cuota 2", ultimoDigito: "8", fecha: "2026-04-17" },
      { periodo: "AG 2025 - Cuota 2", ultimoDigito: "9", fecha: "2026-04-20" },
      { periodo: "AG 2025 - Cuota 2", ultimoDigito: "0", fecha: "2026-04-20" },
    ],
  },

  // ──────────────────────────────────────────
  // 12. GMF Informativa (Gravamen a los Movimientos Financieros)
  // ──────────────────────────────────────────
  {
    obligacion: "GMF Declaracion Informativa",
    descripcion: "Declaracion anual informativa del Gravamen a los Movimientos Financieros (4x1000)",
    tipoContribuyente: "todos",
    periodicidad: "anual",
    vencimientos: [
      { periodo: "AG 2025", ultimoDigito: "1", fecha: "2026-03-18" },
      { periodo: "AG 2025", ultimoDigito: "2", fecha: "2026-03-18" },
      { periodo: "AG 2025", ultimoDigito: "3", fecha: "2026-03-19" },
      { periodo: "AG 2025", ultimoDigito: "4", fecha: "2026-03-19" },
      { periodo: "AG 2025", ultimoDigito: "5", fecha: "2026-03-20" },
      { periodo: "AG 2025", ultimoDigito: "6", fecha: "2026-03-20" },
      { periodo: "AG 2025", ultimoDigito: "7", fecha: "2026-03-23" },
      { periodo: "AG 2025", ultimoDigito: "8", fecha: "2026-03-23" },
      { periodo: "AG 2025", ultimoDigito: "9", fecha: "2026-03-24" },
      { periodo: "AG 2025", ultimoDigito: "0", fecha: "2026-03-24" },
    ],
  },
];

// Note: Add a disclaimer that dates should be verified against official DIAN resolution
export const CALENDARIO_DISCLAIMER = "Fechas basadas en patrones historicos de la DIAN. Verifique contra la Resolucion oficial de la DIAN para 2026. Ultima actualizacion: Febrero 2026.";
