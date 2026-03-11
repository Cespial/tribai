/* ───────────────────────────────────────────────────────────
   agent-tools.ts — Tool definitions for the financial planning
   conversational agent. Wraps the calculation engine and RAG
   pipeline as callable tools for the LLM.
   ─────────────────────────────────────────────────────────── */

import { tool } from "ai";
import { z } from "zod/v4";
import { calcularDeclaracion } from "./engine";
import {
  INITIAL_STATE,
  type DeclaracionState,
} from "./types";
import { runRAGPipeline } from "@/lib/rag/pipeline";

// ── Shared state per session ─────────────────────────────

/**
 * Session state holder — initialized from Exógena or defaults.
 * Mutated by actualizarPerfil tool, read by simularDeclaracion.
 */
export function createSessionState(initial?: Partial<DeclaracionState>): DeclaracionState {
  return { ...INITIAL_STATE, ...initial };
}

// ── Tool: simularDeclaracion ─────────────────────────────

const SimulacionInputSchema = z.object({
  salariosYPagosLaborales: z.number().optional().describe("Salarios y pagos laborales anuales"),
  honorarios: z.number().optional().describe("Honorarios y servicios personales anuales"),
  ingresosCapital: z.number().optional().describe("Intereses, rendimientos, arrendamientos anuales"),
  ingresosNoLaborales: z.number().optional().describe("Ingresos comerciales, industriales, agropecuarios anuales"),
  pensiones: z.number().optional().describe("Pensiones anuales"),
  aportesObligatoriosSalud: z.number().optional().describe("Total aportes obligatorios a salud (EPS) anuales"),
  aportesObligatoriosPension: z.number().optional().describe("Total aportes obligatorios a pensión anuales"),
  fondoSolidaridad: z.number().optional().describe("Aportes al fondo de solidaridad pensional anuales"),
  interesesVivienda: z.number().optional().describe("Intereses de crédito hipotecario de vivienda anuales"),
  medicinaPrepagada: z.number().optional().describe("Aportes a medicina prepagada anuales"),
  dependientes10Pct: z.number().optional().describe("1 si tiene dependientes económicos, 0 si no"),
  GMFDeducible: z.number().optional().describe("50% del GMF certificado por el banco"),
  donaciones: z.number().optional().describe("Total donaciones anuales"),
  aportesVoluntariosPension: z.number().optional().describe("Aportes voluntarios a pensión anuales"),
  aportesAFC: z.number().optional().describe("Aportes a AFC/FVP anuales"),
  retencionFuenteRenta: z.number().optional().describe("Total retenciones en la fuente por renta"),
  anticipoAnoAnterior: z.number().optional().describe("Anticipo pagado en el año anterior"),
  patrimonioTotal: z.number().optional().describe("Valor total del patrimonio bruto a 31 de diciembre"),
  deudasTotal: z.number().optional().describe("Total deudas a 31 de diciembre"),
  tipoContribuyente: z.enum(["empleado", "independiente", "pensionado", "rentista_capital", "mixto"]).optional(),
  anosDeclarando: z.number().optional().describe("Años que lleva declarando (1, 2, o 3+)"),
});

type SimulacionInput = z.infer<typeof SimulacionInputSchema>;

export function createSimularDeclaracionTool(getState: () => DeclaracionState, setState: (s: DeclaracionState) => void) {
  return tool({
    description: `Ejecuta el motor de cálculo de declaración de renta con los datos proporcionados.
Devuelve: impuesto a pagar/saldo a favor, tasa efectiva, desglose por cédula, y oportunidades de optimización.
Llama esta herramienta siempre que tengas datos suficientes para simular — NUNCA con datos inventados.`,
    inputSchema: SimulacionInputSchema,
    execute: async (input: SimulacionInput) => {
      const state = getState();

      if (input.tipoContribuyente) state.perfil.tipoContribuyente = input.tipoContribuyente;
      if (input.anosDeclarando !== undefined) state.perfil.anosDeclarando = input.anosDeclarando;

      if (input.salariosYPagosLaborales !== undefined) state.rentasTrabajo.salariosYPagosLaborales = input.salariosYPagosLaborales;
      if (input.honorarios !== undefined) state.rentasHonorarios.honorarios = input.honorarios;
      if (input.ingresosCapital !== undefined) state.rentasCapital.interesesRendimientos = input.ingresosCapital;
      if (input.ingresosNoLaborales !== undefined) state.rentasNoLaborales.ingresosComerciales = input.ingresosNoLaborales;
      if (input.pensiones !== undefined) state.cedulaPensiones.pensionesNacionales = input.pensiones;

      if (input.aportesObligatoriosSalud !== undefined) state.rentasTrabajo.aportesObligatoriosSalud = input.aportesObligatoriosSalud;
      if (input.aportesObligatoriosPension !== undefined) state.rentasTrabajo.aportesObligatoriosPension = input.aportesObligatoriosPension;
      if (input.fondoSolidaridad !== undefined) state.rentasTrabajo.fondoSolidaridad = input.fondoSolidaridad;

      if (input.interesesVivienda !== undefined) state.deducciones.interesesVivienda = input.interesesVivienda;
      if (input.medicinaPrepagada !== undefined) state.deducciones.medicinaPrepagada = input.medicinaPrepagada;
      if (input.dependientes10Pct !== undefined) state.deducciones.dependientes10Pct = input.dependientes10Pct;
      if (input.GMFDeducible !== undefined) state.deducciones.GMFDeducible = input.GMFDeducible;
      if (input.donaciones !== undefined) state.deducciones.donaciones = input.donaciones;

      if (input.aportesVoluntariosPension !== undefined) state.exenciones.aportesVoluntariosPension = input.aportesVoluntariosPension;
      if (input.aportesAFC !== undefined) state.exenciones.aportesAFC = input.aportesAFC;

      if (input.retencionFuenteRenta !== undefined) state.retencionesAnticipos.retencionFuenteRenta = input.retencionFuenteRenta;
      if (input.anticipoAnoAnterior !== undefined) state.retencionesAnticipos.anticipoAnoAnterior = input.anticipoAnoAnterior;

      if (input.patrimonioTotal !== undefined) {
        state.patrimonio.bienes = [{
          id: "total",
          tipo: "otro_bien",
          descripcion: "Patrimonio total reportado",
          valorFiscal: input.patrimonioTotal,
          valorFiscalAnterior: 0,
          pais: "colombia",
        }];
      }
      if (input.deudasTotal !== undefined) {
        state.patrimonio.deudas = [{
          id: "total",
          tipo: "otra_deuda",
          descripcion: "Deudas totales reportadas",
          saldoDiciembre31: input.deudasTotal,
          saldoAnterior: 0,
        }];
      }

      setState(state);

      const resultado = calcularDeclaracion(state);
      const liq = resultado.liquidacion;
      const cg = resultado.cedulaGeneral;

      return {
        resumen: {
          impuestoTotal: liq.totalImpuestoCargo,
          impuestoNeto: liq.impuestoNetoRenta,
          retenciones: liq.menosRetenciones,
          anticipoAnterior: liq.menosAnticipoAnterior,
          anticipoSiguiente: liq.anticipoRecomendado,
          saldoPagar: liq.saldoPagar,
          saldoFavor: liq.saldoFavor,
          tasaEfectiva: resultado.tasaEfectivaGlobal,
          tasaEfectivaPct: `${(resultado.tasaEfectivaGlobal * 100).toFixed(2)}%`,
        },
        cedulaGeneral: {
          trabajo: { ingresos: cg.trabajo.ingresosBrutos, gravable: cg.trabajo.rentaLiquidaGravable },
          honorarios: { ingresos: cg.honorarios.ingresosBrutos, gravable: cg.honorarios.rentaLiquidaGravable },
          capital: { ingresos: cg.capital.ingresosBrutos, gravable: cg.capital.rentaLiquidaGravable },
          noLaborales: { ingresos: cg.noLaborales.ingresosBrutos, gravable: cg.noLaborales.rentaLiquidaGravable },
          rentaLiquidaGravableTotal: cg.rentaLiquidaGravable,
          rentaLiquidaGravableUVT: cg.rentaLiquidaGravableUVT,
          limite40_1340: cg.limite40_1340,
          limiteExcedido: cg.limiteExcedido,
        },
        pensiones: {
          gravable: resultado.cedulaPensiones.rentaLiquidaGravablePensiones,
        },
        dividendos: {
          impuestoTotal: resultado.cedulaDividendos.impuestoTotalDividendos,
        },
        gananciasOcasionales: {
          impuestoTotal: resultado.gananciasOcasionales.impuestoTotalGO,
        },
        patrimonio: {
          bruto: resultado.patrimonio.patrimonioBruto,
          liquido: resultado.patrimonio.patrimonioLiquido,
        },
        sugerencias: resultado.sugerencias.map(s => ({
          titulo: s.titulo,
          descripcion: s.descripcion,
          ahorroPotencial: s.ahorroPotencial,
          articulo: s.articuloET,
        })),
        breakdown241: resultado.breakdown.map(b => ({
          rangoUVT: `${b.from}-${b.to === Infinity ? "∞" : b.to}`,
          tarifa: `${(b.rate * 100).toFixed(0)}%`,
          baseUVT: b.baseUVT.toFixed(1),
          impuesto: b.impuestoCOP,
        })),
      };
    },
  });
}

// ── Tool: consultarET ────────────────────────────────────

const ConsultaETInputSchema = z.object({
  pregunta: z.string().describe(
    "Pregunta sobre el Estatuto Tributario colombiano. Puede ser sobre artículos específicos, deducciones, exenciones, tarifas, procedimientos, etc."
  ),
});

type ConsultaETInput = z.infer<typeof ConsultaETInputSchema>;

export function createConsultarETTool() {
  return tool({
    description: `Consulta el Estatuto Tributario colombiano a través del sistema RAG.
Usa esta herramienta para fundamentar recomendaciones legales, verificar topes y tarifas,
o responder preguntas específicas sobre normativa tributaria.
El RAG busca en: ET (1,294 artículos), Doctrina DIAN, Jurisprudencia, Decretos y Resoluciones.`,
    inputSchema: ConsultaETInputSchema,
    execute: async (input: ConsultaETInput) => {
      try {
        const result = await runRAGPipeline(input.pregunta);
        return {
          respuestaContexto: result.contextBlock,
          fuentes: result.sources.map(s => ({
            articulo: s.idArticulo,
            titulo: s.titulo,
            relevancia: s.relevanceScore,
          })),
          confianza: result.debugInfo?.confidenceLevel ?? "unknown",
        };
      } catch (error) {
        return {
          error: `No se pudo consultar el ET: ${error instanceof Error ? error.message : "error desconocido"}`,
          fuentes: [],
          confianza: "low" as const,
        };
      }
    },
  });
}

// ── Tool: actualizarPerfil ───────────────────────────────

const ActualizarPerfilInputSchema = z.object({
  campo: z.enum([
    "tipoContribuyente",
    "actividadEconomica",
    "anosDeclarando",
    "anoGravable",
    "nombres",
    "apellidos",
    "tipoDocumento",
    "numeroDocumento",
  ]).describe("Campo del perfil a actualizar"),
  valor: z.string().describe("Nuevo valor para el campo (se convierte al tipo correcto internamente)"),
});

type ActualizarPerfilInput = z.infer<typeof ActualizarPerfilInputSchema>;

export function createActualizarPerfilTool(getState: () => DeclaracionState, setState: (s: DeclaracionState) => void) {
  return tool({
    description: `Actualiza un campo del perfil fiscal del usuario en la sesión actual.
Usa esta herramienta cuando el usuario proporcione información personal o fiscal.`,
    inputSchema: ActualizarPerfilInputSchema,
    execute: async (input: ActualizarPerfilInput) => {
      const state = getState();
      const { campo, valor } = input;

      switch (campo) {
        case "tipoContribuyente":
          state.perfil.tipoContribuyente = valor as DeclaracionState["perfil"]["tipoContribuyente"];
          break;
        case "actividadEconomica":
          state.perfil.actividadEconomica = valor as DeclaracionState["perfil"]["actividadEconomica"];
          break;
        case "anosDeclarando":
          state.perfil.anosDeclarando = parseInt(valor, 10) || 3;
          break;
        case "anoGravable":
          state.perfil.anoGravable = parseInt(valor, 10) || 2025;
          break;
        case "nombres":
          state.perfil.nombres = valor;
          break;
        case "apellidos":
          state.perfil.apellidos = valor;
          break;
        case "tipoDocumento":
          state.perfil.tipoDocumento = valor as DeclaracionState["perfil"]["tipoDocumento"];
          break;
        case "numeroDocumento":
          state.perfil.numeroDocumento = valor;
          break;
      }

      setState(state);
      return { actualizado: true, campo, valor, perfil: state.perfil };
    },
  });
}
