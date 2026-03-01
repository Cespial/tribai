import Foundation

// MARK: - Calendario Fiscal

enum TipoContribuyente: String, CaseIterable, Identifiable, Sendable {
    case todos, grandes, juridicas, naturales
    var id: String { rawValue }
    var label: String {
        switch self {
        case .todos: "Todos"
        case .grandes: "Grandes"
        case .juridicas: "Juridicas"
        case .naturales: "Naturales"
        }
    }
}

struct CalendarDeadline: Identifiable, Sendable {
    let id: String  // generated from obligacion+periodo+digito
    let obligacion: String
    let descripcion: String
    let tipoContribuyente: TipoContribuyente
    let periodicidad: String
    let periodo: String
    let ultimoDigito: String
    let fecha: String  // ISO date "2026-08-12"

    var fechaDate: Date? {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        return formatter.date(from: fecha)
    }

    var mesNumero: Int? {
        guard let date = fechaDate else { return nil }
        return Calendar.current.component(.month, from: date)
    }
}

enum DeadlineStatus: Sendable {
    case vencido, hoy, proximo, futuro

    var label: String {
        switch self {
        case .vencido: "Vencido"
        case .hoy: "Hoy"
        case .proximo: "Proximo"
        case .futuro: "Futuro"
        }
    }
}

// MARK: - Glosario

struct GlosarioTerm: Identifiable, Sendable {
    let id: String
    let termino: String
    let definicion: String
    let articulos: [String]
    let relacionados: [String]
}

// MARK: - Retencion Tabla

struct RetencionConceptoCompleto: Identifiable, Sendable {
    let id: String
    let concepto: String
    let baseMinUVT: Decimal
    let tarifa: Decimal
    let tarifaNoDeclarante: Decimal?
    let articulo: String
    let notas: String?
    let descripcion: String?
    let keywords: [String]
    let aplicaA: String  // "declarante", "no-declarante", "ambos"
    let linkCalculadora: String?

    var categoria: String {
        if id.hasPrefix("compras") { return "Compras" }
        if id.hasPrefix("servicios") { return "Servicios" }
        if id.hasPrefix("honorarios") || id.hasPrefix("consultorias") { return "Honorarios" }
        if id.hasPrefix("arriendo") { return "Arrendamientos" }
        if id.hasPrefix("rendimientos") { return "Rendimientos" }
        if id.hasPrefix("dividendos") { return "Dividendos" }
        if id.hasPrefix("loterias") { return "Loterias" }
        if id.hasPrefix("activos") { return "Activos" }
        return "Otros"
    }
}

// MARK: - Doctrina DIAN

enum DoctrinaTipoDoc: String, CaseIterable, Identifiable, Sendable {
    case concepto, oficio, doctrinaGeneral = "doctrina-general", circular
    var id: String { rawValue }
    var label: String {
        switch self {
        case .concepto: "Concepto"
        case .oficio: "Oficio"
        case .doctrinaGeneral: "Doctrina General"
        case .circular: "Circular"
        }
    }
}

struct DoctrinaCurada: Identifiable, Sendable {
    let id: String
    let numero: String
    let fecha: String
    let tema: String
    let pregunta: String
    let sintesis: String
    let conclusionClave: String
    let articulosET: [String]
    let tipoDocumento: DoctrinaTipoDoc
    let descriptores: [String]
    let vigente: Bool
}

// MARK: - Novedades Normativas

enum NovedadTipo: String, CaseIterable, Identifiable, Sendable {
    case ley, decreto, resolucion, circular, sentencia, concepto
    var id: String { rawValue }
    var label: String {
        switch self {
        case .ley: "Ley"
        case .decreto: "Decreto"
        case .resolucion: "Resolucion"
        case .circular: "Circular"
        case .sentencia: "Sentencia"
        case .concepto: "Concepto"
        }
    }
}

enum NovedadImpacto: String, CaseIterable, Identifiable, Sendable {
    case alto, medio, bajo
    var id: String { rawValue }
    var label: String {
        switch self {
        case .alto: "Alto"
        case .medio: "Medio"
        case .bajo: "Bajo"
        }
    }
}

struct NovedadNormativa: Identifiable, Sendable {
    let id: String
    let fecha: String
    let titulo: String
    let resumen: String
    let tipo: NovedadTipo
    let fuente: String
    let numero: String
    let impacto: NovedadImpacto
    let articulosET: [String]
    let tags: [String]
    let queSignificaParaTi: String
    let accionRecomendada: String
    let detalleCompleto: String
}

// MARK: - Indicadores Economicos

enum IndicadorCategoria: String, CaseIterable, Identifiable, Sendable {
    case tributarios, laborales, financieros, monetarios
    var id: String { rawValue }
    var label: String {
        switch self {
        case .tributarios: "Tributarios"
        case .laborales: "Laborales"
        case .financieros: "Financieros"
        case .monetarios: "Monetarios"
        }
    }
}

struct IndicadorHistoryPoint: Sendable {
    let periodo: String
    let valor: Double
}

struct IndicadorItem: Identifiable, Sendable {
    let id: String
    let nombre: String
    let valor: String
    let valorNumerico: Double
    let unidad: String  // "cop", "porcentaje", "indice"
    let fechaCorte: String
    let paraQueSirve: String
    let categoria: IndicadorCategoria
    let notas: String?
    let articulo: String?
    let calculatorIds: [String]
    let history: [IndicadorHistoryPoint]
}

// MARK: - Guias Interactivas

struct DecisionOption: Sendable {
    let label: String
    let nextNodeId: String
}

struct DecisionNode: Identifiable, Sendable {
    let id: String
    let tipo: String  // "pregunta" or "resultado"
    let texto: String
    let opciones: [DecisionOption]
    let recomendacion: String?
    let enlaces: [(label: String, href: String)]
    let ayudaRapida: String?

    var esPregunta: Bool { tipo == "pregunta" }
    var esResultado: Bool { tipo == "resultado" }
}

struct GuiaEducativa: Identifiable, Sendable {
    let id: String
    let titulo: String
    let descripcion: String
    let categoria: String
    let complejidad: String
    let nodos: [DecisionNode]
    let nodoInicial: String

    var complejidadLabel: String {
        switch complejidad {
        case "basica": "Basica"
        case "intermedia": "Intermedia"
        case "avanzada": "Avanzada"
        default: complejidad.capitalized
        }
    }

    func nodo(byId nodeId: String) -> DecisionNode? {
        nodos.first { $0.id == nodeId }
    }
}

// MARK: - Dashboard

struct DashboardStats: Codable, Sendable {
    let totalArticles: Int
    let statsCards: StatsCards
    let estadoDistribution: EstadoDistribution
    let libroDistribution: [NameValue]
    let reformTimeline: [ReformYear]
    let topModified: [TopArticle]
    let topReferenced: [TopArticle]
    let topLaws: [NameCount]
    let complexityDistribution: [ScoreCount]

    enum CodingKeys: String, CodingKey {
        case totalArticles = "total_articles"
        case statsCards = "stats_cards"
        case estadoDistribution = "estado_distribution"
        case libroDistribution = "libro_distribution"
        case reformTimeline = "reform_timeline"
        case topModified = "top_modified"
        case topReferenced = "top_referenced"
        case topLaws = "top_laws"
        case complexityDistribution = "complexity_distribution"
    }

    struct StatsCards: Codable, Sendable {
        let total: Int
        let modificados: Int
        let modificadosPct: Double
        let conDerogado: Int
        let conDerogadoPct: Double
        let conNormas: Int
        let conNormasPct: Double
        let conCrossRefs: Int
        let conCrossRefsPct: Double

        enum CodingKeys: String, CodingKey {
            case total, modificados
            case modificadosPct = "modificados_pct"
            case conDerogado = "con_derogado"
            case conDerogadoPct = "con_derogado_pct"
            case conNormas = "con_normas"
            case conNormasPct = "con_normas_pct"
            case conCrossRefs = "con_cross_refs"
            case conCrossRefsPct = "con_cross_refs_pct"
        }
    }

    struct EstadoDistribution: Codable, Sendable {
        let vigente: Int
        let modificado: Int
    }

    struct NameValue: Codable, Identifiable, Sendable {
        let name: String
        let value: Int
        var id: String { name }
    }

    struct ReformYear: Codable, Identifiable, Sendable {
        let year: Int
        let total: Int
        let laws: [NameCount]
        var id: Int { year }
    }

    struct TopArticle: Codable, Identifiable, Sendable {
        let id: String
        let slug: String
        let titulo: String
        let estado: String
        // handle both total_mods and total_refs
        let totalMods: Int?
        let totalRefs: Int?

        enum CodingKeys: String, CodingKey {
            case id, slug, titulo, estado
            case totalMods = "total_mods"
            case totalRefs = "total_refs"
        }

        var count: Int { totalMods ?? totalRefs ?? 0 }
    }

    struct NameCount: Codable, Identifiable, Sendable {
        let name: String
        let count: Int
        var id: String { name }
    }

    struct ScoreCount: Codable, Identifiable, Sendable {
        let score: Int
        let count: Int
        var id: Int { score }
    }
}
