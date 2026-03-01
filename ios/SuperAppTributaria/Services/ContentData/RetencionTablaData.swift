import Foundation

// MARK: - RetencionTablaData — Tabla de Retencion en la Fuente 2026
// Decreto 0572/2025 + Estatuto Tributario

enum RetencionTablaData {

    // MARK: - Metadata

    static let lastUpdate = "2026-02-19"

    // MARK: - Categories (derived)

    static let categories: [String] = {
        Array(Set(conceptos.map { $0.categoria })).sorted()
    }()

    // MARK: - All Concepts (32 entries)

    static let conceptos: [RetencionConceptoCompleto] = [

        // ── Compras ──────────────────────────────────────

        RetencionConceptoCompleto(
            id: "compras-general",
            concepto: "Compras generales (declarantes)",
            baseMinUVT: Decimal(27),
            tarifa: Decimal(string: "0.025")!,
            tarifaNoDeclarante: nil,
            articulo: "401",
            notas: "Aplica sobre pagos o abonos",
            descripcion: "Compras de bienes gravados cuando el beneficiario es declarante.",
            keywords: ["compras", "bienes", "declarante"],
            aplicaA: "declarante",
            linkCalculadora: nil
        ),
        RetencionConceptoCompleto(
            id: "compras-no-decl",
            concepto: "Compras generales (no declarantes)",
            baseMinUVT: Decimal(27),
            tarifa: Decimal(string: "0.035")!,
            tarifaNoDeclarante: nil,
            articulo: "401",
            notas: nil,
            descripcion: nil,
            keywords: ["compras", "no declarante"],
            aplicaA: "no-declarante",
            linkCalculadora: nil
        ),
        RetencionConceptoCompleto(
            id: "compras-combustible",
            concepto: "Combustibles derivados del petroleo",
            baseMinUVT: Decimal(0),
            tarifa: Decimal(string: "0.001")!,
            tarifaNoDeclarante: nil,
            articulo: "401",
            notas: nil,
            descripcion: nil,
            keywords: ["combustible", "petroleo"],
            aplicaA: "ambos",
            linkCalculadora: nil
        ),
        RetencionConceptoCompleto(
            id: "compras-cafe-export",
            concepto: "Cafe pergamino o cereza",
            baseMinUVT: Decimal(160),
            tarifa: Decimal(string: "0.005")!,
            tarifaNoDeclarante: nil,
            articulo: "401",
            notas: nil,
            descripcion: nil,
            keywords: ["cafe", "exportacion"],
            aplicaA: "ambos",
            linkCalculadora: nil
        ),
        RetencionConceptoCompleto(
            id: "compras-oro",
            concepto: "Productos agropecuarios sin procesamiento",
            baseMinUVT: Decimal(92),
            tarifa: Decimal(string: "0.015")!,
            tarifaNoDeclarante: nil,
            articulo: "401",
            notas: nil,
            descripcion: nil,
            keywords: ["agropecuario"],
            aplicaA: "ambos",
            linkCalculadora: nil
        ),
        RetencionConceptoCompleto(
            id: "compras-vehiculos",
            concepto: "Compra de vehiculos",
            baseMinUVT: Decimal(0),
            tarifa: Decimal(string: "0.01")!,
            tarifaNoDeclarante: nil,
            articulo: "401",
            notas: nil,
            descripcion: nil,
            keywords: ["vehiculos"],
            aplicaA: "ambos",
            linkCalculadora: nil
        ),
        RetencionConceptoCompleto(
            id: "compras-bienes-raices",
            concepto: "Compra de bienes raices",
            baseMinUVT: Decimal(0),
            tarifa: Decimal(string: "0.01")!,
            tarifaNoDeclarante: nil,
            articulo: "401",
            notas: "Para vivienda: 1%; otros inmuebles: 2.5%",
            descripcion: nil,
            keywords: ["inmuebles"],
            aplicaA: "ambos",
            linkCalculadora: nil
        ),

        // ── Servicios ───────────────────────────────────

        RetencionConceptoCompleto(
            id: "servicios-general-d",
            concepto: "Servicios en general (declarantes)",
            baseMinUVT: Decimal(4),
            tarifa: Decimal(string: "0.04")!,
            tarifaNoDeclarante: nil,
            articulo: "392",
            notas: nil,
            descripcion: nil,
            keywords: ["servicios", "declarante"],
            aplicaA: "declarante",
            linkCalculadora: nil
        ),
        RetencionConceptoCompleto(
            id: "servicios-general-nd",
            concepto: "Servicios en general (no declarantes)",
            baseMinUVT: Decimal(4),
            tarifa: Decimal(string: "0.06")!,
            tarifaNoDeclarante: nil,
            articulo: "392",
            notas: nil,
            descripcion: nil,
            keywords: ["servicios", "no declarante"],
            aplicaA: "no-declarante",
            linkCalculadora: nil
        ),
        RetencionConceptoCompleto(
            id: "servicios-transporte-carga",
            concepto: "Transporte de carga",
            baseMinUVT: Decimal(4),
            tarifa: Decimal(string: "0.01")!,
            tarifaNoDeclarante: nil,
            articulo: "392-1",
            notas: nil,
            descripcion: nil,
            keywords: ["transporte", "carga"],
            aplicaA: "ambos",
            linkCalculadora: nil
        ),
        RetencionConceptoCompleto(
            id: "servicios-transporte-pasajeros",
            concepto: "Transporte nacional de pasajeros (terrestre)",
            baseMinUVT: Decimal(27),
            tarifa: Decimal(string: "0.035")!,
            tarifaNoDeclarante: nil,
            articulo: "392-1",
            notas: nil,
            descripcion: nil,
            keywords: ["transporte", "pasajeros"],
            aplicaA: "ambos",
            linkCalculadora: nil
        ),
        RetencionConceptoCompleto(
            id: "servicios-transporte-aereo",
            concepto: "Transporte nacional de pasajeros (aereo/maritimo)",
            baseMinUVT: Decimal(4),
            tarifa: Decimal(string: "0.01")!,
            tarifaNoDeclarante: nil,
            articulo: "392-1",
            notas: nil,
            descripcion: nil,
            keywords: ["transporte", "aereo", "maritimo"],
            aplicaA: "ambos",
            linkCalculadora: nil
        ),
        RetencionConceptoCompleto(
            id: "servicios-hotel",
            concepto: "Servicios de hotel, restaurante y hospedaje",
            baseMinUVT: Decimal(4),
            tarifa: Decimal(string: "0.035")!,
            tarifaNoDeclarante: nil,
            articulo: "392",
            notas: nil,
            descripcion: nil,
            keywords: ["hotel", "restaurante"],
            aplicaA: "ambos",
            linkCalculadora: nil
        ),
        RetencionConceptoCompleto(
            id: "servicios-temporales",
            concepto: "Empresas de servicios temporales",
            baseMinUVT: Decimal(4),
            tarifa: Decimal(string: "0.01")!,
            tarifaNoDeclarante: nil,
            articulo: "392",
            notas: nil,
            descripcion: nil,
            keywords: ["temporales"],
            aplicaA: "ambos",
            linkCalculadora: nil
        ),
        RetencionConceptoCompleto(
            id: "servicios-aseo-vigilancia",
            concepto: "Servicios de aseo y vigilancia",
            baseMinUVT: Decimal(4),
            tarifa: Decimal(string: "0.02")!,
            tarifaNoDeclarante: nil,
            articulo: "392",
            notas: nil,
            descripcion: nil,
            keywords: ["aseo", "vigilancia"],
            aplicaA: "ambos",
            linkCalculadora: nil
        ),

        // ── Honorarios y comisiones ─────────────────────

        RetencionConceptoCompleto(
            id: "honorarios-d",
            concepto: "Honorarios y comisiones (declarantes PJ)",
            baseMinUVT: Decimal(0),
            tarifa: Decimal(string: "0.10")!,
            tarifaNoDeclarante: nil,
            articulo: "392",
            notas: nil,
            descripcion: nil,
            keywords: ["honorarios", "comisiones"],
            aplicaA: "declarante",
            linkCalculadora: nil
        ),
        RetencionConceptoCompleto(
            id: "honorarios-nd",
            concepto: "Honorarios y comisiones (no declarantes)",
            baseMinUVT: Decimal(0),
            tarifa: Decimal(string: "0.11")!,
            tarifaNoDeclarante: nil,
            articulo: "392",
            notas: nil,
            descripcion: nil,
            keywords: ["honorarios", "comisiones"],
            aplicaA: "no-declarante",
            linkCalculadora: nil
        ),
        RetencionConceptoCompleto(
            id: "honorarios-pn-d",
            concepto: "Honorarios persona natural (declarante)",
            baseMinUVT: Decimal(0),
            tarifa: Decimal(string: "0.10")!,
            tarifaNoDeclarante: nil,
            articulo: "392",
            notas: nil,
            descripcion: nil,
            keywords: ["honorarios", "persona natural"],
            aplicaA: "declarante",
            linkCalculadora: nil
        ),
        RetencionConceptoCompleto(
            id: "consultorias-d",
            concepto: "Consultorias (declarantes)",
            baseMinUVT: Decimal(0),
            tarifa: Decimal(string: "0.10")!,
            tarifaNoDeclarante: nil,
            articulo: "392",
            notas: nil,
            descripcion: nil,
            keywords: ["consultoria"],
            aplicaA: "declarante",
            linkCalculadora: nil
        ),
        RetencionConceptoCompleto(
            id: "consultorias-nd",
            concepto: "Consultorias (no declarantes)",
            baseMinUVT: Decimal(0),
            tarifa: Decimal(string: "0.11")!,
            tarifaNoDeclarante: nil,
            articulo: "392",
            notas: nil,
            descripcion: nil,
            keywords: ["consultoria"],
            aplicaA: "no-declarante",
            linkCalculadora: nil
        ),

        // ── Arrendamientos ──────────────────────────────

        RetencionConceptoCompleto(
            id: "arriendo-inmuebles",
            concepto: "Arrendamiento de bienes inmuebles",
            baseMinUVT: Decimal(27),
            tarifa: Decimal(string: "0.035")!,
            tarifaNoDeclarante: nil,
            articulo: "401",
            notas: nil,
            descripcion: nil,
            keywords: ["arrendamiento", "inmuebles"],
            aplicaA: "ambos",
            linkCalculadora: nil
        ),
        RetencionConceptoCompleto(
            id: "arriendo-muebles",
            concepto: "Arrendamiento de bienes muebles",
            baseMinUVT: Decimal(0),
            tarifa: Decimal(string: "0.04")!,
            tarifaNoDeclarante: nil,
            articulo: "401",
            notas: nil,
            descripcion: nil,
            keywords: ["arrendamiento", "muebles"],
            aplicaA: "ambos",
            linkCalculadora: nil
        ),

        // ── Rendimientos financieros ────────────────────

        RetencionConceptoCompleto(
            id: "rendimientos-financieros",
            concepto: "Rendimientos financieros",
            baseMinUVT: Decimal(0),
            tarifa: Decimal(string: "0.07")!,
            tarifaNoDeclarante: nil,
            articulo: "395",
            notas: "CDT, ahorros, fiducia, etc.",
            descripcion: nil,
            keywords: ["rendimientos", "cdt", "fiducia"],
            aplicaA: "ambos",
            linkCalculadora: nil
        ),

        // ── Dividendos ─────────────────────────────────

        RetencionConceptoCompleto(
            id: "dividendos-pn",
            concepto: "Dividendos (personas naturales residentes)",
            baseMinUVT: Decimal(0),
            tarifa: Decimal(string: "0.20")!,
            tarifaNoDeclarante: nil,
            articulo: "242",
            notas: "Progresiva segun Art. 242",
            descripcion: nil,
            keywords: ["dividendos", "persona natural"],
            aplicaA: "ambos",
            linkCalculadora: nil
        ),
        RetencionConceptoCompleto(
            id: "dividendos-pj",
            concepto: "Dividendos (personas juridicas nacionales)",
            baseMinUVT: Decimal(0),
            tarifa: Decimal(string: "0.075")!,
            tarifaNoDeclarante: nil,
            articulo: "242-1",
            notas: nil,
            descripcion: nil,
            keywords: ["dividendos", "persona juridica"],
            aplicaA: "ambos",
            linkCalculadora: nil
        ),

        // ── Loterias y azar ─────────────────────────────

        RetencionConceptoCompleto(
            id: "loterias",
            concepto: "Loterias, rifas, apuestas y similares",
            baseMinUVT: Decimal(48),
            tarifa: Decimal(string: "0.20")!,
            tarifaNoDeclarante: nil,
            articulo: "317",
            notas: nil,
            descripcion: nil,
            keywords: ["loterias", "rifas", "apuestas"],
            aplicaA: "ambos",
            linkCalculadora: nil
        ),

        // ── Enajenacion activos ─────────────────────────

        RetencionConceptoCompleto(
            id: "activos-fijos-pn",
            concepto: "Enajenacion de activos fijos (persona natural)",
            baseMinUVT: Decimal(0),
            tarifa: Decimal(string: "0.01")!,
            tarifaNoDeclarante: nil,
            articulo: "398",
            notas: nil,
            descripcion: nil,
            keywords: ["activos fijos"],
            aplicaA: "ambos",
            linkCalculadora: nil
        ),
        RetencionConceptoCompleto(
            id: "activos-fijos-pj",
            concepto: "Enajenacion de activos fijos (persona juridica)",
            baseMinUVT: Decimal(0),
            tarifa: Decimal(string: "0.01")!,
            tarifaNoDeclarante: nil,
            articulo: "398",
            notas: nil,
            descripcion: nil,
            keywords: ["activos fijos"],
            aplicaA: "ambos",
            linkCalculadora: nil
        ),

        // ── Otros ───────────────────────────────────────

        RetencionConceptoCompleto(
            id: "pagos-exterior",
            concepto: "Pagos al exterior (general)",
            baseMinUVT: Decimal(0),
            tarifa: Decimal(string: "0.20")!,
            tarifaNoDeclarante: nil,
            articulo: "406-414",
            notas: "Varia por concepto y convenio",
            descripcion: nil,
            keywords: ["exterior"],
            aplicaA: "ambos",
            linkCalculadora: nil
        ),
        RetencionConceptoCompleto(
            id: "pagos-exterior-software",
            concepto: "Pagos al exterior por software",
            baseMinUVT: Decimal(0),
            tarifa: Decimal(string: "0.267")!,
            tarifaNoDeclarante: nil,
            articulo: "411",
            notas: nil,
            descripcion: nil,
            keywords: ["software", "exterior"],
            aplicaA: "ambos",
            linkCalculadora: nil
        ),
        RetencionConceptoCompleto(
            id: "emolumentos-eclesiasticos",
            concepto: "Emolumentos eclesiasticos",
            baseMinUVT: Decimal(27),
            tarifa: Decimal(string: "0.04")!,
            tarifaNoDeclarante: nil,
            articulo: "401",
            notas: nil,
            descripcion: nil,
            keywords: ["emolumentos"],
            aplicaA: "ambos",
            linkCalculadora: nil
        ),
        RetencionConceptoCompleto(
            id: "contratos-construccion",
            concepto: "Contratos de construccion o urbanizacion",
            baseMinUVT: Decimal(27),
            tarifa: Decimal(string: "0.02")!,
            tarifaNoDeclarante: nil,
            articulo: "401",
            notas: nil,
            descripcion: nil,
            keywords: ["construccion"],
            aplicaA: "ambos",
            linkCalculadora: nil
        ),
    ]
}
