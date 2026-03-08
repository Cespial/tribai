import { ChatPageContext } from "@/types/chat-history";

export interface CalculatorSuggestion {
  name: string;
  href: string;
  description: string;
}

const CALCULATOR_KEYWORDS: Array<{ keywords: string[]; calculator: CalculatorSuggestion }> = [
  {
    keywords: ["renta", "impuesto renta", "art 241", "declaración renta", "persona natural", "tarifa progresiva"],
    calculator: { name: "Renta Personas Naturales", href: "/calculadoras/renta", description: "Cálculo de impuesto de renta con tabla Art. 241" },
  },
  {
    keywords: ["retencion", "retención", "fuente", "art 383", "art 392", "tabla retención"],
    calculator: { name: "Retención en la Fuente", href: "/calculadoras/retencion", description: "Retención según concepto y monto" },
  },
  {
    keywords: ["simple", "régimen simple", "regimen simple", "art 903", "art 908", "anticipo simple"],
    calculator: { name: "Régimen SIMPLE", href: "/calculadoras/simple", description: "Cálculo de impuesto SIMPLE unificado" },
  },
  {
    keywords: ["gmf", "4x1000", "4 por mil", "gravamen", "movimientos financieros", "art 871"],
    calculator: { name: "GMF (4x1000)", href: "/calculadoras/gmf", description: "Gravamen a los Movimientos Financieros" },
  },
  {
    keywords: ["iva", "impuesto ventas", "art 468", "19%", "excluido", "exento"],
    calculator: { name: "IVA", href: "/calculadoras/iva", description: "Cálculo y extracción de IVA" },
  },
  {
    keywords: ["patrimonio", "impuesto patrimonio", "art 292", "riqueza"],
    calculator: { name: "Impuesto al Patrimonio", href: "/calculadoras/patrimonio", description: "Cálculo impuesto al patrimonio" },
  },
  {
    keywords: ["dividendo", "dividendos", "art 242", "utilidades", "distribución"],
    calculator: { name: "Dividendos PN", href: "/calculadoras/dividendos", description: "Impuesto sobre dividendos personas naturales" },
  },
  {
    keywords: ["dividendos jurídica", "dividendos juridica", "art 242-1", "7.5%", "sociedad extranjera"],
    calculator: { name: "Dividendos PJ", href: "/calculadoras/dividendos-juridicas", description: "Dividendos personas jurídicas" },
  },
  {
    keywords: ["lotería", "loteria", "rifa", "apuesta", "premio", "art 304", "ganancia ocasional lotería"],
    calculator: { name: "Ganancias Loterías", href: "/calculadoras/ganancias-loterias", description: "Impuesto 20% sobre premios" },
  },
  {
    keywords: ["sanción", "sancion", "extemporánea", "extemporanea", "mora", "art 641", "art 642"],
    calculator: { name: "Sanciones", href: "/calculadoras/sanciones", description: "Cálculo de sanciones tributarias" },
  },
  {
    keywords: ["nómina", "nomina", "prestaciones", "seguridad social", "parafiscales", "cesantías"],
    calculator: { name: "Nómina Completa", href: "/calculadoras/nomina-completa", description: "Desglose completo de nómina" },
  },
  {
    keywords: ["comparar", "comparador", "ordinario vs simple", "cuál régimen", "cual regimen"],
    calculator: { name: "Comparador Regímenes", href: "/calculadoras/comparador-regimenes", description: "Ordinario vs SIMPLE lado a lado" },
  },
  {
    keywords: ["zona franca", "zonas francas", "art 240-1", "tarifa preferencial"],
    calculator: { name: "Zonas Francas", href: "/calculadoras/zonas-francas", description: "Tarifa preferencial 20%" },
  },
  {
    keywords: ["descuento", "descuentos tributarios", "art 254", "art 257", "donación", "iva activos"],
    calculator: { name: "Descuentos Tributarios", href: "/calculadoras/descuentos-tributarios", description: "IVA activos, donaciones, impuesto exterior" },
  },
  {
    keywords: ["comparación patrimonial", "comparacion patrimonial", "incremento patrimonial", "art 236", "renta no justificada"],
    calculator: { name: "Comparación Patrimonial", href: "/calculadoras/comparacion-patrimonial", description: "Detecta renta no justificada" },
  },
  {
    keywords: ["uvt", "unidad valor tributario", "convertir uvt", "art 868"],
    calculator: { name: "Conversor UVT", href: "/calculadoras/uvt", description: "Conversión UVT a COP" },
  },
  {
    keywords: ["licencia", "maternidad", "paternidad", "parental", "embarazo"],
    calculator: { name: "Licencia Maternidad", href: "/calculadoras/licencia-maternidad", description: "Duración y valor de licencias" },
  },
  {
    keywords: ["debo declarar", "obligado declarar", "declarar renta"],
    calculator: { name: "Debo Declarar?", href: "/calculadoras/debo-declarar", description: "Verifica si está obligado a declarar" },
  },
];

function stripAccents(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function suggestCalculators(
  query: string,
  maxResults = 3,
  pageContext?: ChatPageContext
): CalculatorSuggestion[] {
  const q = stripAccents(query.toLowerCase());
  const scored: Array<{ calculator: CalculatorSuggestion; score: number }> = [];

  for (const entry of CALCULATOR_KEYWORDS) {
    let score = 0;
    for (const keyword of entry.keywords) {
      if (q.includes(stripAccents(keyword))) {
        score += keyword.length; // Longer keyword matches are more specific
      }
    }
    if (
      pageContext?.module === "calculadora" &&
      pageContext.calculatorSlug &&
      entry.calculator.href.includes(pageContext.calculatorSlug)
    ) {
      score += 100;
    }
    if (pageContext?.module === "tablas-retencion" && entry.calculator.href.includes("retencion")) {
      score += 80;
    }
    if (score > 0) {
      scored.push({ calculator: entry.calculator, score });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, maxResults).map((s) => s.calculator);
}
