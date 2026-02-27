import Foundation

// MARK: - Calculator Category

enum CalculatorCategory: String, CaseIterable, Identifiable {
    case todas
    case renta
    case iva
    case laboral
    case patrimonio
    case sanciones
    case otros

    var id: String { rawValue }

    var displayName: String {
        switch self {
        case .todas: return "Todas"
        case .renta: return "Renta"
        case .iva: return "IVA"
        case .laboral: return "Laboral"
        case .patrimonio: return "Patrimonio"
        case .sanciones: return "Sanciones"
        case .otros: return "Otros"
        }
    }
}

// MARK: - Calculator Catalog Item

struct CalculatorCatalogItem: Identifiable, Equatable {
    let id: String
    let title: String
    let description: String
    let sfSymbol: String
    let category: CalculatorCategory
    let tags: [String]
    let articles: [String]
    let isTop5: Bool

    static func == (lhs: CalculatorCatalogItem, rhs: CalculatorCatalogItem) -> Bool {
        lhs.id == rhs.id
    }
}

// MARK: - Calculator Catalog (35 calculators)

enum CalculatorCatalog {

    static let all: [CalculatorCatalogItem] = [
        CalculatorCatalogItem(
            id: "debo-declarar", title: "Debo Declarar Renta",
            description: "Verifica obligacion de declarar comparando topes en UVT.",
            sfSymbol: "checkmark.circle", category: .renta,
            tags: ["debo declarar", "obligado", "topes", "renta"],
            articles: ["592", "593"], isTop5: true
        ),
        CalculatorCatalogItem(
            id: "renta", title: "Renta Personas Naturales",
            description: "Impuesto de renta con desglose marginal segun Art. 241 ET.",
            sfSymbol: "building.columns", category: .renta,
            tags: ["renta", "impuesto", "persona natural", "declaracion"],
            articles: ["241", "206", "336"], isTop5: true
        ),
        CalculatorCatalogItem(
            id: "retencion", title: "Retencion en la Fuente",
            description: "Calcula retencion por concepto, monto y tabla progresiva de salarios.",
            sfSymbol: "doc.text", category: .renta,
            tags: ["retencion", "retefuente", "rete", "honorarios", "servicios", "salarios"],
            articles: ["392", "401", "383"], isTop5: true
        ),
        CalculatorCatalogItem(
            id: "iva", title: "Referencia IVA",
            description: "Calcula y extrae IVA 19% y 5%. Referencia rapida exento vs excluido.",
            sfSymbol: "cart", category: .iva,
            tags: ["iva", "impuesto ventas", "extraer iva"],
            articles: ["468", "477", "424"], isTop5: false
        ),
        CalculatorCatalogItem(
            id: "comparador", title: "Comparador de Contratacion",
            description: "Compara laboral, salario integral y servicios para empresa y trabajador.",
            sfSymbol: "person.2", category: .laboral,
            tags: ["contratacion", "laboral", "integral", "independiente", "servicios"],
            articles: ["383", "241", "905"], isTop5: true
        ),
        CalculatorCatalogItem(
            id: "nomina-completa", title: "Nomina Completa",
            description: "Desglose de prestaciones, seguridad social y parafiscales.",
            sfSymbol: "list.clipboard", category: .laboral,
            tags: ["nomina", "prestaciones", "parafiscales", "costos"],
            articles: ["204"], isTop5: true
        ),
        CalculatorCatalogItem(
            id: "simple", title: "Regimen SIMPLE (RST)",
            description: "Impuesto unificado SIMPLE por grupo de actividad.",
            sfSymbol: "square.3.layers.3d", category: .renta,
            tags: ["simple", "rst", "regimen"],
            articles: ["903", "908"], isTop5: false
        ),
        CalculatorCatalogItem(
            id: "sanciones", title: "Sancion por Extemporaneidad",
            description: "Calcula sancion por presentacion extemporanea con reducciones Art. 640.",
            sfSymbol: "exclamationmark.triangle", category: .sanciones,
            tags: ["sancion", "extemporaneidad", "declaracion tardia"],
            articles: ["641", "642", "640"], isTop5: false
        ),
        CalculatorCatalogItem(
            id: "gmf", title: "GMF (4x1000)",
            description: "Gravamen a movimientos financieros con calculo de exencion 350 UVT.",
            sfSymbol: "banknote", category: .otros,
            tags: ["gmf", "4x1000", "banco"],
            articles: ["871", "879"], isTop5: false
        ),
        CalculatorCatalogItem(
            id: "uvt", title: "Conversor UVT - COP",
            description: "Convierte entre UVT y pesos colombianos. Historico 2006-2026.",
            sfSymbol: "arrow.left.arrow.right", category: .otros,
            tags: ["uvt", "conversion", "pesos", "tabla"],
            articles: ["868"], isTop5: false
        ),
        CalculatorCatalogItem(
            id: "patrimonio", title: "Impuesto al Patrimonio",
            description: "Impuesto progresivo sobre patrimonio liquido 2026.",
            sfSymbol: "building.2", category: .patrimonio,
            tags: ["patrimonio", "impuesto patrimonio", "riqueza"],
            articles: ["292-2", "296-3"], isTop5: false
        ),
        CalculatorCatalogItem(
            id: "seguridad-social", title: "Aportes a Seguridad Social",
            description: "Calcula aportes a salud, pension, ARL y parafiscales.",
            sfSymbol: "shield", category: .laboral,
            tags: ["seguridad social", "salud", "pension", "arl"],
            articles: ["204"], isTop5: false
        ),
        CalculatorCatalogItem(
            id: "retencion-salarios", title: "Retencion Salarios Proc. 1",
            description: "Retencion mensual con depuracion completa Art. 388.",
            sfSymbol: "function", category: .laboral,
            tags: ["retencion salarios", "proc 1", "depuracion"],
            articles: ["383", "388"], isTop5: false
        ),
        CalculatorCatalogItem(
            id: "liquidacion-laboral", title: "Liquidacion de Contrato Laboral",
            description: "Cesantias, intereses, prima, vacaciones e indemnizacion.",
            sfSymbol: "doc.text.magnifyingglass", category: .laboral,
            tags: ["liquidacion", "contrato", "indemnizacion"],
            articles: [], isTop5: false
        ),
        CalculatorCatalogItem(
            id: "horas-extras", title: "Horas Extras y Recargos",
            description: "Calcula extras diurnas, nocturnas y dominicales.",
            sfSymbol: "clock", category: .laboral,
            tags: ["horas extras", "recargos", "dominical"],
            articles: [], isTop5: false
        ),
        CalculatorCatalogItem(
            id: "renta-juridicas", title: "Renta Personas Juridicas",
            description: "Impuesto corporativo con tarifas sectoriales y sobretasa financiero.",
            sfSymbol: "building", category: .renta,
            tags: ["renta juridicas", "impuesto corporativo"],
            articles: ["240", "240-1"], isTop5: false
        ),
        CalculatorCatalogItem(
            id: "sanciones-ampliadas", title: "Sanciones Tributarias",
            description: "No declarar, correccion e inexactitud con reduccion Art. 640.",
            sfSymbol: "gavel", category: .sanciones,
            tags: ["sanciones", "no declarar", "inexactitud"],
            articles: ["643", "644", "647"], isTop5: false
        ),
        CalculatorCatalogItem(
            id: "ganancias-ocasionales", title: "Ganancias Ocasionales - Inmuebles",
            description: "Calcula impuesto por venta de activos fijos con ajuste fiscal.",
            sfSymbol: "chart.line.uptrend.xyaxis", category: .patrimonio,
            tags: ["ganancia ocasional", "inmuebles", "venta"],
            articles: ["299", "300", "314"], isTop5: false
        ),
        CalculatorCatalogItem(
            id: "herencias", title: "Herencias y Donaciones",
            description: "Impuesto sobre herencias, legados y donaciones con exenciones.",
            sfSymbol: "gift", category: .patrimonio,
            tags: ["herencias", "donaciones", "legados"],
            articles: ["302", "307", "314"], isTop5: false
        ),
        CalculatorCatalogItem(
            id: "dividendos", title: "Dividendos Personas Naturales",
            description: "Impuesto sobre dividendos gravados y no gravados.",
            sfSymbol: "chart.pie", category: .renta,
            tags: ["dividendos", "acciones", "retencion"],
            articles: ["242", "49"], isTop5: false
        ),
        CalculatorCatalogItem(
            id: "intereses-mora", title: "Intereses Moratorios DIAN",
            description: "Calcula intereses de mora sobre deudas tributarias.",
            sfSymbol: "percent", category: .sanciones,
            tags: ["intereses", "mora", "dian"],
            articles: ["634", "635"], isTop5: false
        ),
        CalculatorCatalogItem(
            id: "anticipo", title: "Anticipo de Renta",
            description: "Calcula anticipo del impuesto de renta para el siguiente periodo.",
            sfSymbol: "forward", category: .renta,
            tags: ["anticipo", "renta", "periodo siguiente"],
            articles: ["807"], isTop5: false
        ),
        CalculatorCatalogItem(
            id: "timbre", title: "Impuesto de Timbre",
            description: "Impuesto 1% sobre documentos que superen 6,000 UVT.",
            sfSymbol: "doc.badge.plus", category: .otros,
            tags: ["timbre", "documentos"],
            articles: ["519", "520"], isTop5: false
        ),
        CalculatorCatalogItem(
            id: "beneficio-auditoria", title: "Beneficio de Auditoria",
            description: "Verifica si aplica reduccion del periodo de firmeza.",
            sfSymbol: "magnifyingglass", category: .renta,
            tags: ["beneficio auditoria", "firmeza"],
            articles: ["689-3"], isTop5: false
        ),
        CalculatorCatalogItem(
            id: "pension", title: "Verificador de Pension",
            description: "Verifica edad y semanas cotizadas.",
            sfSymbol: "wallet.pass", category: .laboral,
            tags: ["pension", "semanas", "edad"],
            articles: [], isTop5: false
        ),
        CalculatorCatalogItem(
            id: "depreciacion", title: "Depreciacion Fiscal",
            description: "Deduccion anual por depreciacion de activos fijos.",
            sfSymbol: "chart.line.downtrend.xyaxis", category: .otros,
            tags: ["depreciacion", "activos", "fiscal"],
            articles: ["128", "137"], isTop5: false
        ),
        CalculatorCatalogItem(
            id: "consumo", title: "Impuesto al Consumo",
            description: "Impuesto nacional al consumo para restaurantes y otros.",
            sfSymbol: "cup.and.saucer", category: .iva,
            tags: ["consumo", "inc", "restaurantes"],
            articles: ["512-1"], isTop5: false
        ),
        CalculatorCatalogItem(
            id: "comparacion-patrimonial", title: "Comparacion Patrimonial",
            description: "Detecta renta no justificada por incremento patrimonial.",
            sfSymbol: "arrow.left.arrow.right.square", category: .patrimonio,
            tags: ["comparacion patrimonial", "incremento patrimonial"],
            articles: ["236", "239"], isTop5: false
        ),
        CalculatorCatalogItem(
            id: "comparador-regimenes", title: "Comparador Ordinario vs SIMPLE",
            description: "Comparacion lado a lado de carga tributaria total.",
            sfSymbol: "rectangle.split.2x1", category: .renta,
            tags: ["comparador regimenes", "simple", "ordinario"],
            articles: ["241", "908"], isTop5: false
        ),
        CalculatorCatalogItem(
            id: "dividendos-juridicas", title: "Dividendos Personas Juridicas",
            description: "Tarifas para nacionales y extranjeros (Art. 242-1 ET).",
            sfSymbol: "briefcase", category: .renta,
            tags: ["dividendos juridicas", "retencion"],
            articles: ["242-1", "245"], isTop5: false
        ),
        CalculatorCatalogItem(
            id: "descuentos-tributarios", title: "Descuentos Tributarios",
            description: "IVA activos productivos, donaciones e impuesto exterior.",
            sfSymbol: "tag", category: .renta,
            tags: ["descuentos", "donaciones", "impuesto exterior"],
            articles: ["254", "257", "258-1"], isTop5: false
        ),
        CalculatorCatalogItem(
            id: "zonas-francas", title: "Zonas Francas",
            description: "Tarifa preferencial del 20% con plan de exportaciones.",
            sfSymbol: "shippingbox", category: .renta,
            tags: ["zonas francas", "tarifa 20"],
            articles: ["240-1"], isTop5: false
        ),
        CalculatorCatalogItem(
            id: "ganancias-loterias", title: "Ganancias Ocasionales - Loterias",
            description: "Impuesto 20% sobre premios de loterias, rifas y apuestas.",
            sfSymbol: "ticket", category: .otros,
            tags: ["loteria", "premios", "ganancia ocasional"],
            articles: ["304", "317"], isTop5: false
        ),
        CalculatorCatalogItem(
            id: "licencia-maternidad", title: "Licencia Maternidad y Paternidad",
            description: "Duracion y valor con leyes vigentes.",
            sfSymbol: "figure.and.child.holdinghands", category: .laboral,
            tags: ["licencia", "maternidad", "paternidad"],
            articles: [], isTop5: false
        ),
        CalculatorCatalogItem(
            id: "ica", title: "Impuesto ICA",
            description: "Calcula ICA con sobretasas municipales.",
            sfSymbol: "mappin.and.ellipse", category: .otros,
            tags: ["ica", "industria y comercio", "municipal"],
            articles: [], isTop5: false
        ),
    ]

    static let top5: [CalculatorCatalogItem] = all.filter(\.isTop5)

    static func item(byId id: String) -> CalculatorCatalogItem? {
        all.first { $0.id == id }
    }

    static func items(for category: CalculatorCategory) -> [CalculatorCatalogItem] {
        if category == .todas { return all }
        return all.filter { $0.category == category }
    }

    static func search(_ query: String) -> [CalculatorCatalogItem] {
        let lowered = query.lowercased()
        return all.filter { item in
            item.title.lowercased().contains(lowered) ||
            item.description.lowercased().contains(lowered) ||
            item.tags.contains { $0.contains(lowered) }
        }
    }
}
