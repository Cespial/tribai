import Foundation

// MARK: - IndicadoresData — Indicadores Economicos Colombia 2026

enum IndicadoresData {

    // MARK: - Metadata

    static let lastUpdate = "2026-02-19"

    // MARK: - All Indicators (9 entries)

    static let items: [IndicadorItem] = [
        IndicadorItem(
            id: "uvt",
            nombre: "UVT 2026",
            valor: "$49,799",
            valorNumerico: 49799,
            unidad: "cop",
            fechaCorte: "2026-01-01",
            paraQueSirve: "Sirve para convertir topes, sanciones, deducciones y umbrales del Estatuto Tributario a pesos colombianos.",
            categoria: .tributarios,
            notas: "Base oficial usada para calculos tributarios 2026.",
            articulo: "868",
            calculatorIds: ["uvt", "debo-declarar", "retencion"],
            history: [
                IndicadorHistoryPoint(periodo: "2017", valor: 31859),
                IndicadorHistoryPoint(periodo: "2018", valor: 33156),
                IndicadorHistoryPoint(periodo: "2019", valor: 34270),
                IndicadorHistoryPoint(periodo: "2020", valor: 35607),
                IndicadorHistoryPoint(periodo: "2021", valor: 36308),
                IndicadorHistoryPoint(periodo: "2022", valor: 38004),
                IndicadorHistoryPoint(periodo: "2023", valor: 42412),
                IndicadorHistoryPoint(periodo: "2024", valor: 47065),
                IndicadorHistoryPoint(periodo: "2025", valor: 49799),
                IndicadorHistoryPoint(periodo: "2026", valor: 49799),
            ]
        ),
        IndicadorItem(
            id: "smlmv",
            nombre: "SMLMV 2026",
            valor: "$1,423,500",
            valorNumerico: 1423500,
            unidad: "cop",
            fechaCorte: "2026-01-01",
            paraQueSirve: "Impacta bases de seguridad social, retencion laboral, costos de nomina y beneficios asociados al salario minimo.",
            categoria: .laborales,
            notas: "Incluye unicamente salario base, sin auxilio de transporte.",
            articulo: nil,
            calculatorIds: ["nomina-completa", "seguridad-social"],
            history: [
                IndicadorHistoryPoint(periodo: "2017", valor: 737717),
                IndicadorHistoryPoint(periodo: "2018", valor: 781242),
                IndicadorHistoryPoint(periodo: "2019", valor: 828116),
                IndicadorHistoryPoint(periodo: "2020", valor: 877803),
                IndicadorHistoryPoint(periodo: "2021", valor: 908526),
                IndicadorHistoryPoint(periodo: "2022", valor: 1000000),
                IndicadorHistoryPoint(periodo: "2023", valor: 1160000),
                IndicadorHistoryPoint(periodo: "2024", valor: 1300000),
                IndicadorHistoryPoint(periodo: "2025", valor: 1380000),
                IndicadorHistoryPoint(periodo: "2026", valor: 1423500),
            ]
        ),
        IndicadorItem(
            id: "trm",
            nombre: "TRM hoy",
            valor: "$4,120",
            valorNumerico: 4120,
            unidad: "cop",
            fechaCorte: "2026-02-19",
            paraQueSirve: "Se usa para convertir obligaciones en moneda extranjera y valorar activos, pasivos y operaciones internacionales.",
            categoria: .financieros,
            notas: "Valor de referencia para calculos internos. Verificar corte diario oficial.",
            articulo: nil,
            calculatorIds: ["renta-juridicas", "comparador-regimenes"],
            history: [
                IndicadorHistoryPoint(periodo: "2017", valor: 2951),
                IndicadorHistoryPoint(periodo: "2018", valor: 2956),
                IndicadorHistoryPoint(periodo: "2019", valor: 3281),
                IndicadorHistoryPoint(periodo: "2020", valor: 3693),
                IndicadorHistoryPoint(periodo: "2021", valor: 3743),
                IndicadorHistoryPoint(periodo: "2022", valor: 4255),
                IndicadorHistoryPoint(periodo: "2023", valor: 4326),
                IndicadorHistoryPoint(periodo: "2024", valor: 3908),
                IndicadorHistoryPoint(periodo: "2025", valor: 4025),
                IndicadorHistoryPoint(periodo: "2026", valor: 4120),
            ]
        ),
        IndicadorItem(
            id: "usura",
            nombre: "Tasa de usura",
            valor: "29.50% E.A.",
            valorNumerico: 29.5,
            unidad: "porcentaje",
            fechaCorte: "2026-02-19",
            paraQueSirve: "Define el limite legal para intereses de financiacion y sirve de base para calcular intereses moratorios tributarios.",
            categoria: .financieros,
            notas: nil,
            articulo: nil,
            calculatorIds: ["intereses-mora"],
            history: [
                IndicadorHistoryPoint(periodo: "2017", valor: 31.0),
                IndicadorHistoryPoint(periodo: "2018", valor: 30.8),
                IndicadorHistoryPoint(periodo: "2019", valor: 28.6),
                IndicadorHistoryPoint(periodo: "2020", valor: 27.1),
                IndicadorHistoryPoint(periodo: "2021", valor: 25.9),
                IndicadorHistoryPoint(periodo: "2022", valor: 31.9),
                IndicadorHistoryPoint(periodo: "2023", valor: 37.6),
                IndicadorHistoryPoint(periodo: "2024", valor: 34.1),
                IndicadorHistoryPoint(periodo: "2025", valor: 30.8),
                IndicadorHistoryPoint(periodo: "2026", valor: 29.5),
            ]
        ),
        IndicadorItem(
            id: "auxilio-transporte",
            nombre: "Auxilio de transporte",
            valor: "$200,000",
            valorNumerico: 200000,
            unidad: "cop",
            fechaCorte: "2026-01-01",
            paraQueSirve: "Complementa el ingreso de trabajadores con salario hasta dos minimos y afecta costos laborales mensuales.",
            categoria: .laborales,
            notas: nil,
            articulo: nil,
            calculatorIds: ["nomina-completa"],
            history: [
                IndicadorHistoryPoint(periodo: "2022", valor: 117172),
                IndicadorHistoryPoint(periodo: "2023", valor: 140606),
                IndicadorHistoryPoint(periodo: "2024", valor: 162000),
                IndicadorHistoryPoint(periodo: "2025", valor: 190000),
                IndicadorHistoryPoint(periodo: "2026", valor: 200000),
            ]
        ),
        IndicadorItem(
            id: "ipc",
            nombre: "IPC anual",
            valor: "6.2%",
            valorNumerico: 6.2,
            unidad: "porcentaje",
            fechaCorte: "2026-01-31",
            paraQueSirve: "Se usa para ajustes de valores tributarios, actualizaciones de topes y proyecciones financieras anuales.",
            categoria: .monetarios,
            notas: nil,
            articulo: nil,
            calculatorIds: ["uvt"],
            history: [
                IndicadorHistoryPoint(periodo: "2017", valor: 4.09),
                IndicadorHistoryPoint(periodo: "2018", valor: 3.18),
                IndicadorHistoryPoint(periodo: "2019", valor: 3.8),
                IndicadorHistoryPoint(periodo: "2020", valor: 1.61),
                IndicadorHistoryPoint(periodo: "2021", valor: 5.62),
                IndicadorHistoryPoint(periodo: "2022", valor: 13.12),
                IndicadorHistoryPoint(periodo: "2023", valor: 9.28),
                IndicadorHistoryPoint(periodo: "2024", valor: 7.36),
                IndicadorHistoryPoint(periodo: "2025", valor: 6.8),
                IndicadorHistoryPoint(periodo: "2026", valor: 6.2),
            ]
        ),
        IndicadorItem(
            id: "dtf",
            nombre: "DTF efectiva anual",
            valor: "10.20%",
            valorNumerico: 10.2,
            unidad: "porcentaje",
            fechaCorte: "2026-02-19",
            paraQueSirve: "Indicador de referencia para contratos financieros y actualizaciones de costos de financiacion empresarial.",
            categoria: .financieros,
            notas: nil,
            articulo: nil,
            calculatorIds: ["intereses-mora"],
            history: [
                IndicadorHistoryPoint(periodo: "2019", valor: 4.8),
                IndicadorHistoryPoint(periodo: "2020", valor: 2.7),
                IndicadorHistoryPoint(periodo: "2021", valor: 2.0),
                IndicadorHistoryPoint(periodo: "2022", valor: 9.0),
                IndicadorHistoryPoint(periodo: "2023", valor: 13.2),
                IndicadorHistoryPoint(periodo: "2024", valor: 11.3),
                IndicadorHistoryPoint(periodo: "2025", valor: 10.6),
                IndicadorHistoryPoint(periodo: "2026", valor: 10.2),
            ]
        ),
        IndicadorItem(
            id: "sancion-minima",
            nombre: "Sancion minima",
            valor: "10 UVT ($497,990)",
            valorNumerico: 497990,
            unidad: "cop",
            fechaCorte: "2026-01-01",
            paraQueSirve: "Marca el minimo de sancion tributaria aplicable en procesos de fiscalizacion y cumplimiento.",
            categoria: .tributarios,
            notas: nil,
            articulo: "639",
            calculatorIds: ["sanciones", "sanciones-ampliadas"],
            history: [
                IndicadorHistoryPoint(periodo: "2022", valor: 380040),
                IndicadorHistoryPoint(periodo: "2023", valor: 424120),
                IndicadorHistoryPoint(periodo: "2024", valor: 470650),
                IndicadorHistoryPoint(periodo: "2025", valor: 497990),
                IndicadorHistoryPoint(periodo: "2026", valor: 497990),
            ]
        ),
        IndicadorItem(
            id: "gmf-exento",
            nombre: "GMF exento mensual",
            valor: "350 UVT ($17,429,650)",
            valorNumerico: 17429650,
            unidad: "cop",
            fechaCorte: "2026-01-01",
            paraQueSirve: "Permite estimar el limite de movimientos exentos del 4x1000 en cuentas marcadas.",
            categoria: .tributarios,
            notas: nil,
            articulo: "879",
            calculatorIds: ["gmf"],
            history: [
                IndicadorHistoryPoint(periodo: "2022", valor: 13301400),
                IndicadorHistoryPoint(periodo: "2023", valor: 14844200),
                IndicadorHistoryPoint(periodo: "2024", valor: 16472750),
                IndicadorHistoryPoint(periodo: "2025", valor: 17429650),
                IndicadorHistoryPoint(periodo: "2026", valor: 17429650),
            ]
        ),
    ]

    // MARK: - Destacados

    static let destacadosIds = ["uvt", "smlmv", "trm", "usura"]

    // MARK: - Categorias

    static let categorias: [IndicadorCategoria] = IndicadorCategoria.allCases
}
