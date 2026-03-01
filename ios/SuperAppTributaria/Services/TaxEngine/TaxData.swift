import Foundation

// MARK: - TaxData — All Colombian tax constants (2026)

enum TaxData {

    // MARK: - Core 2026 Constants

    static let uvt2026: Decimal = 52_374
    static let smlmv2026: Decimal = 1_750_905
    static let auxilioTransporte2026: Decimal = 249_095
    static let currentUVTYear = 2026

    // MARK: - UVT Historico 2006-2026

    static let uvtValues: [Int: Decimal] = [
        2006: 20_000, 2007: 20_974, 2008: 22_054, 2009: 23_763, 2010: 24_555,
        2011: 25_132, 2012: 26_049, 2013: 26_841, 2014: 27_485, 2015: 28_279,
        2016: 29_753, 2017: 31_859, 2018: 33_156, 2019: 34_270, 2020: 35_607,
        2021: 36_308, 2022: 38_004, 2023: 42_412, 2024: 47_065, 2025: 49_799,
        2026: 52_374,
    ]

    // MARK: - Renta PN — Art. 241 ET (tabla marginal)

    struct TaxBracket {
        let fromUVT: Decimal
        let toUVT: Decimal   // Decimal.greatestFiniteMagnitude for infinity
        let rate: Decimal
        let baseUVT: Decimal
    }

    static let rentaBrackets: [TaxBracket] = [
        TaxBracket(fromUVT: 0,      toUVT: 1_090,   rate: 0,    baseUVT: 0),
        TaxBracket(fromUVT: 1_090,  toUVT: 1_700,   rate: Decimal(string: "0.19")!, baseUVT: 0),
        TaxBracket(fromUVT: 1_700,  toUVT: 4_100,   rate: Decimal(string: "0.28")!, baseUVT: 116),
        TaxBracket(fromUVT: 4_100,  toUVT: 8_670,   rate: Decimal(string: "0.33")!, baseUVT: 788),
        TaxBracket(fromUVT: 8_670,  toUVT: 18_970,  rate: Decimal(string: "0.35")!, baseUVT: 2_296),
        TaxBracket(fromUVT: 18_970, toUVT: 31_000,  rate: Decimal(string: "0.37")!, baseUVT: 5_901),
        TaxBracket(fromUVT: 31_000, toUVT: Decimal.greatestFiniteMagnitude, rate: Decimal(string: "0.39")!, baseUVT: 10_352),
    ]

    // MARK: - Retencion Salarios — Art. 383 ET

    static let retencionSalariosBrackets: [TaxBracket] = [
        TaxBracket(fromUVT: 0,     toUVT: 95,    rate: 0,    baseUVT: 0),
        TaxBracket(fromUVT: 95,    toUVT: 150,   rate: Decimal(string: "0.19")!, baseUVT: 0),
        TaxBracket(fromUVT: 150,   toUVT: 360,   rate: Decimal(string: "0.28")!, baseUVT: 10),
        TaxBracket(fromUVT: 360,   toUVT: 640,   rate: Decimal(string: "0.33")!, baseUVT: 69),
        TaxBracket(fromUVT: 640,   toUVT: 945,   rate: Decimal(string: "0.35")!, baseUVT: 161),
        TaxBracket(fromUVT: 945,   toUVT: 2_300, rate: Decimal(string: "0.37")!, baseUVT: 268),
        TaxBracket(fromUVT: 2_300, toUVT: Decimal.greatestFiniteMagnitude, rate: Decimal(string: "0.39")!, baseUVT: 770),
    ]

    // MARK: - Conceptos de Retencion (Decreto 0572/2025)

    struct RetencionConcepto {
        let id: String
        let concepto: String
        let baseUVT: Decimal
        let tarifa: Decimal?     // nil for progressive (salarios)
        let declarante: Bool?    // nil = applies to both
        let articulo: String
        let isProgressive: Bool
    }

    static let retencionConceptos: [RetencionConcepto] = [
        RetencionConcepto(id: "compras", concepto: "Compras generales", baseUVT: 10, tarifa: Decimal(string: "0.025")!, declarante: nil, articulo: "401", isProgressive: false),
        RetencionConcepto(id: "servicios-d", concepto: "Servicios (declarante)", baseUVT: 2, tarifa: Decimal(string: "0.04")!, declarante: true, articulo: "392", isProgressive: false),
        RetencionConcepto(id: "servicios-nd", concepto: "Servicios (no declarante)", baseUVT: 2, tarifa: Decimal(string: "0.06")!, declarante: false, articulo: "392", isProgressive: false),
        RetencionConcepto(id: "honorarios-d", concepto: "Honorarios (declarante)", baseUVT: 0, tarifa: Decimal(string: "0.10")!, declarante: true, articulo: "392", isProgressive: false),
        RetencionConcepto(id: "honorarios-nd", concepto: "Honorarios (no declarante)", baseUVT: 0, tarifa: Decimal(string: "0.11")!, declarante: false, articulo: "392", isProgressive: false),
        RetencionConcepto(id: "arrendamiento", concepto: "Arrendamiento inmuebles", baseUVT: 10, tarifa: Decimal(string: "0.035")!, declarante: nil, articulo: "401", isProgressive: false),
        RetencionConcepto(id: "loterias", concepto: "Loterias, rifas, apuestas", baseUVT: 48, tarifa: Decimal(string: "0.20")!, declarante: nil, articulo: "317", isProgressive: false),
        RetencionConcepto(id: "activos-fijos", concepto: "Enajenacion activos fijos (PN)", baseUVT: 10, tarifa: Decimal(string: "0.01")!, declarante: nil, articulo: "398", isProgressive: false),
        RetencionConcepto(id: "salarios", concepto: "Salarios y rentas de trabajo", baseUVT: 0, tarifa: nil, declarante: nil, articulo: "383", isProgressive: true),
    ]

    // MARK: - Ley 2277/2022 Limits

    struct Ley2277Limits {
        let rentasExentasMaxUVT: Decimal = 790
        let deduccionesExentasMaxUVT: Decimal = 1_340
        let dependienteUVT: Decimal = 72
        let maxDependientes: Int = 4
    }

    static let ley2277Limits = Ley2277Limits()

    // MARK: - GMF

    static let gmfRate: Decimal = Decimal(string: "0.004")!
    static let gmfExemptUVT: Decimal = 350

    // MARK: - IVA

    static let ivaGeneral: Decimal = Decimal(string: "0.19")!
    static let ivaReducido: Decimal = Decimal(string: "0.05")!

    // MARK: - Seguridad Social & Contratacion

    static let salarioIntegralMinSMLMV: Decimal = 13

    struct EmployerRates {
        let salud: Decimal = Decimal(string: "0.085")!
        let pension: Decimal = Decimal(string: "0.12")!
        let arl: Decimal = Decimal(string: "0.00522")!
        let sena: Decimal = Decimal(string: "0.02")!
        let icbf: Decimal = Decimal(string: "0.03")!
        let ccf: Decimal = Decimal(string: "0.04")!
        let cesantias: Decimal = Decimal(string: "0.0833")!
        let intCesantias: Decimal = Decimal(string: "0.01")!
        let prima: Decimal = Decimal(string: "0.0833")!
        let vacaciones: Decimal = Decimal(string: "0.0417")!
    }

    static let employerRates = EmployerRates()

    struct EmployeeRates {
        let salud: Decimal = Decimal(string: "0.04")!
        let pension: Decimal = Decimal(string: "0.04")!
    }

    static let employeeRates = EmployeeRates()

    struct IndependentRates {
        let baseSS: Decimal = Decimal(string: "0.40")!
        let salud: Decimal = Decimal(string: "0.125")!
        let pension: Decimal = Decimal(string: "0.17")!
        let arl: Decimal = Decimal(string: "0.00522")!
    }

    static let independentRates = IndependentRates()

    static let exonerationThresholdSMLMV: Decimal = 10

    // MARK: - ARL Classes

    struct ARLClass {
        let clase: String
        let rate: Decimal
        let description: String
    }

    static let arlClasses: [ARLClass] = [
        ARLClass(clase: "I",   rate: Decimal(string: "0.00522")!, description: "Riesgo minimo (oficinas, administrativo)"),
        ARLClass(clase: "II",  rate: Decimal(string: "0.01044")!, description: "Riesgo bajo (manufactura liviana)"),
        ARLClass(clase: "III", rate: Decimal(string: "0.02436")!, description: "Riesgo medio (transporte, electromecanica)"),
        ARLClass(clase: "IV",  rate: Decimal(string: "0.04350")!, description: "Riesgo alto (mineria, metalurgia)"),
        ARLClass(clase: "V",   rate: Decimal(string: "0.06960")!, description: "Riesgo maximo (asbesto, bomberos, explosivos)"),
    ]

    // MARK: - FSP Brackets

    struct FSPBracket {
        let fromSMLMV: Decimal
        let toSMLMV: Decimal
        let rate: Decimal
        let detail: String
    }

    static let fspBrackets: [FSPBracket] = [
        FSPBracket(fromSMLMV: 4,  toSMLMV: 16, rate: Decimal(string: "0.010")!, detail: "0.5% solidaridad + 0.5% subsistencia"),
        FSPBracket(fromSMLMV: 16, toSMLMV: 17, rate: Decimal(string: "0.012")!, detail: "0.5% solidaridad + 0.7% subsistencia"),
        FSPBracket(fromSMLMV: 17, toSMLMV: 18, rate: Decimal(string: "0.014")!, detail: "0.5% solidaridad + 0.9% subsistencia"),
        FSPBracket(fromSMLMV: 18, toSMLMV: 19, rate: Decimal(string: "0.016")!, detail: "0.5% solidaridad + 1.1% subsistencia"),
        FSPBracket(fromSMLMV: 19, toSMLMV: 20, rate: Decimal(string: "0.018")!, detail: "0.5% solidaridad + 1.3% subsistencia"),
        FSPBracket(fromSMLMV: 20, toSMLMV: Decimal.greatestFiniteMagnitude, rate: Decimal(string: "0.020")!, detail: "0.5% solidaridad + 1.5% subsistencia"),
    ]

    static let ibcMinSMLMV: Decimal = 1
    static let ibcMaxSMLMV: Decimal = 25
    static let ssPensionTotalRate: Decimal = Decimal(string: "0.16")!
    static let ssSaludTotalRate: Decimal = Decimal(string: "0.125")!

    // MARK: - SIMPLE (ET 908)

    struct SIMPLEGroup: Identifiable {
        let id: Int
        let label: String
    }

    static let simpleGroups: [SIMPLEGroup] = [
        SIMPLEGroup(id: 1, label: "Grupo 1: Tiendas, mini y micromercados"),
        SIMPLEGroup(id: 2, label: "Grupo 2: Comerciales, industriales"),
        SIMPLEGroup(id: 3, label: "Grupo 3: Servicios profesionales, consultoria"),
        SIMPLEGroup(id: 4, label: "Grupo 4: Expendio comidas y bebidas"),
        SIMPLEGroup(id: 5, label: "Grupo 5: Educacion y salud"),
    ]

    struct SIMPLEBracket {
        let fromUVT: Decimal
        let toUVT: Decimal
        let rates: [Decimal]  // One rate per group (index 0-4)
    }

    static let simpleBrackets: [SIMPLEBracket] = [
        SIMPLEBracket(fromUVT: 0,      toUVT: 6_000,   rates: [Decimal(string: "0.017")!, Decimal(string: "0.032")!, Decimal(string: "0.059")!, Decimal(string: "0.032")!, Decimal(string: "0.019")!]),
        SIMPLEBracket(fromUVT: 6_000,  toUVT: 15_000,  rates: [Decimal(string: "0.019")!, Decimal(string: "0.038")!, Decimal(string: "0.073")!, Decimal(string: "0.038")!, Decimal(string: "0.025")!]),
        SIMPLEBracket(fromUVT: 15_000, toUVT: 30_000,  rates: [Decimal(string: "0.054")!, Decimal(string: "0.039")!, Decimal(string: "0.120")!, Decimal(string: "0.039")!, Decimal(string: "0.042")!]),
        SIMPLEBracket(fromUVT: 30_000, toUVT: 100_000, rates: [Decimal(string: "0.067")!, Decimal(string: "0.052")!, Decimal(string: "0.145")!, Decimal(string: "0.052")!, Decimal(string: "0.052")!]),
    ]

    // MARK: - Renta PJ — Art. 240 ET

    struct PJRate {
        let sector: String
        let label: String
        let rate: Decimal
        let articulo: String
    }

    static let pjRates: [PJRate] = [
        PJRate(sector: "general", label: "Tarifa general", rate: Decimal(string: "0.35")!, articulo: "240"),
        PJRate(sector: "financiero", label: "Sector financiero (renta > 120,000 UVT)", rate: Decimal(string: "0.50")!, articulo: "240 Par. 1 + Dto 1474"),
        PJRate(sector: "hidroelectrica", label: "Generacion hidroelectrica", rate: Decimal(string: "0.38")!, articulo: "240 Par. 2"),
        PJRate(sector: "extractivo", label: "Sector extractivo", rate: Decimal(string: "0.35")!, articulo: "240"),
        PJRate(sector: "hotelero", label: "Servicios hoteleros (nuevos/remodelados)", rate: Decimal(string: "0.15")!, articulo: "240 Par. 5"),
        PJRate(sector: "editorial", label: "Industria editorial", rate: Decimal(string: "0.15")!, articulo: "240 Par. 6"),
        PJRate(sector: "zona_franca", label: "Usuarios zona franca", rate: Decimal(string: "0.20")!, articulo: "240-1"),
        PJRate(sector: "zona_franca_comercial", label: "Zona franca comercial", rate: Decimal(string: "0.35")!, articulo: "240-1 Par. 1"),
    ]

    // MARK: - Sanciones — Art. 641, 642, 643, 644, 647, 639 ET

    static let sancionMinimaUVT: Decimal = 10

    struct SancionExtemporaneidad {
        let porImpuesto: Decimal = Decimal(string: "0.05")!
        let porIngresos: Decimal = Decimal(string: "0.005")!
        let limiteImpuesto: Decimal = 1
        let limiteIngresos: Decimal = Decimal(string: "0.05")!
    }

    static let sancionExtemporaneidad = SancionExtemporaneidad()

    struct SancionNoDeclarar {
        let rentaIngresos: Decimal = Decimal(string: "0.20")!
        let rentaConsignaciones: Decimal = Decimal(string: "0.20")!
        let ivaIngresos: Decimal = Decimal(string: "0.10")!
        let retefuente: Decimal = Decimal(string: "0.10")!
        let patrimonio: Decimal = Decimal(string: "1.60")!
    }

    static let sancionNoDeclarar = SancionNoDeclarar()

    struct SancionCorreccion {
        let voluntaria: Decimal = Decimal(string: "0.10")!
        let postEmplazamiento: Decimal = Decimal(string: "0.20")!
    }

    static let sancionCorreccion = SancionCorreccion()

    struct SancionInexactitud {
        let general: Decimal = 1
        let fraude: Decimal = 2
    }

    static let sancionInexactitud = SancionInexactitud()

    // MARK: - Topes Declarar Renta AG2026

    struct TopesDeclarar {
        let patrimonioBrutoUVT: Decimal = 4_500
        let ingresosBrutosUVT: Decimal = 1_400
        let consumosTarjetaUVT: Decimal = 1_400
        let comprasTotalesUVT: Decimal = 1_400
        let consignacionesUVT: Decimal = 1_400
        let uvtAnoGravable: Decimal = 52_374
    }

    static let topesDeclarar = TopesDeclarar()

    // MARK: - Anticipo — Art. 807 ET

    struct AnticipoRates {
        let primerAno: Decimal = Decimal(string: "0.25")!
        let segundoAno: Decimal = Decimal(string: "0.50")!
        let subsiguientes: Decimal = Decimal(string: "0.75")!
    }

    static let anticipoRates = AnticipoRates()

    // MARK: - Timbre — Art. 519 ET

    static let timbreRate: Decimal = Decimal(string: "0.01")!
    static let timbreThresholdUVT: Decimal = 6_000
    static let timbreInmueblesUVT: Decimal = 20_000

    // MARK: - Ganancias Ocasionales — Art. 313, 314 ET

    static let gananciaOcasionalRate: Decimal = Decimal(string: "0.15")!
    static let viviendaExencionUVT: Decimal = 5_000
    static let herenciaViviendaExencionUVT: Decimal = 13_000
    static let herenciaOtrosInmueblesExencionUVT: Decimal = 7_700
    static let herenciaExencionHerederosUVT: Decimal = 3_250
    static let herenciaExencionOtrosPct: Decimal = Decimal(string: "0.20")!
    static let herenciaExencionOtrosTopeUVT: Decimal = 1_625
    static let porcionConyugalExentaUVT: Decimal = 3_250

    // MARK: - Dividendos — Art. 242 ET

    static let dividendosPNBrackets: [TaxBracket] = [
        TaxBracket(fromUVT: 0,     toUVT: 1_090, rate: 0,    baseUVT: 0),
        TaxBracket(fromUVT: 1_090, toUVT: Decimal.greatestFiniteMagnitude, rate: Decimal(string: "0.20")!, baseUVT: 0),
    ]

    static let dividendosNoGravadosRate: Decimal = Decimal(string: "0.35")!
    static let dividendosDescuentoRate: Decimal = Decimal(string: "0.19")!

    // MARK: - Patrimonio — Art. 292-3, 295-3 ET (Ley 2277 de 2022)

    static let patrimonioThresholdUVT: Decimal = 72_000
    static let patrimonioViviendaExclusionUVT: Decimal = 12_000

    static let patrimonioBrackets: [TaxBracket] = [
        TaxBracket(fromUVT: 0,       toUVT: 72_000,  rate: 0,                            baseUVT: 0),
        TaxBracket(fromUVT: 72_000,  toUVT: 122_000, rate: Decimal(string: "0.005")!,    baseUVT: 0),
        TaxBracket(fromUVT: 122_000, toUVT: 239_000, rate: Decimal(string: "0.010")!,    baseUVT: 250),
        TaxBracket(fromUVT: 239_000, toUVT: Decimal.greatestFiniteMagnitude, rate: Decimal(string: "0.015")!, baseUVT: 1_420),
    ]

    // MARK: - Laboral

    struct IndemnizacionConfig {
        let primerAno: Int
        let adicionalPorAno: Int
    }

    static let indemnizacionBajo = IndemnizacionConfig(primerAno: 30, adicionalPorAno: 20)
    static let indemnizacionAlto = IndemnizacionConfig(primerAno: 20, adicionalPorAno: 15)
    static let indemnizacionUmbralSMLMV: Decimal = 10
    static let indemnizacionFijoMinDias: Int = 15
    static let interesCesantiasRate: Decimal = Decimal(string: "0.12")!

    struct Recargos {
        let extraDiurna: Decimal = Decimal(string: "0.25")!
        let extraNocturna: Decimal = Decimal(string: "0.75")!
        let recargoNocturno: Decimal = Decimal(string: "0.35")!
    }

    static let recargos = Recargos()

    struct DominicalProgresivo {
        let desde: String
        let hasta: String
        let recargo: Decimal
        let label: String
    }

    static let dominicalProgresivo: [DominicalProgresivo] = [
        DominicalProgresivo(desde: "2025-07-01", hasta: "2026-06-30", recargo: Decimal(string: "0.80")!, label: "80% (Jul 2025 - Jun 2026)"),
        DominicalProgresivo(desde: "2026-07-01", hasta: "2027-06-30", recargo: Decimal(string: "0.90")!, label: "90% (Jul 2026 - Jun 2027)"),
        DominicalProgresivo(desde: "2027-07-01", hasta: "9999-12-31", recargo: 1, label: "100% (Jul 2027 en adelante)"),
    ]

    struct JornadaSemanal {
        let desde: String
        let hasta: String
        let horas: Int
        let divisor: Int
    }

    static let jornadaSemanal: [JornadaSemanal] = [
        JornadaSemanal(desde: "2024-07-16", hasta: "2025-07-15", horas: 46, divisor: 230),
        JornadaSemanal(desde: "2025-07-16", hasta: "2026-07-15", horas: 44, divisor: 220),
        JornadaSemanal(desde: "2026-07-16", hasta: "9999-12-31", horas: 42, divisor: 210),
    ]

    struct DepuracionLimits {
        let dependientePct: Decimal = Decimal(string: "0.10")!
        let dependienteMaxUVTMensual: Decimal = Decimal(string: "32.5")!
        let medicinaPrepagadaMaxUVTMensual: Decimal = 16
        let rentaExenta25Pct: Decimal = Decimal(string: "0.25")!
        let limiteGlobalPct: Decimal = Decimal(string: "0.40")!
    }

    static let depuracionLimits = DepuracionLimits()

    // MARK: - Wave 4: Intereses Mora, Auditoria, Pension, Depreciacion, Consumo

    struct InteresMoraRate {
        let desde: String
        let hasta: String
        let tasaEA: Decimal
        let label: String
    }

    static let interesMoraRates: [InteresMoraRate] = [
        InteresMoraRate(desde: "2025-10-01", hasta: "2025-12-31", tasaEA: Decimal(string: "0.2683")!, label: "26.83% EA (Oct-Dic 2025)"),
        InteresMoraRate(desde: "2026-01-01", hasta: "2026-03-31", tasaEA: Decimal(string: "0.2567")!, label: "25.67% EA (Ene-Mar 2026)"),
        InteresMoraRate(desde: "2026-04-01", hasta: "2026-06-30", tasaEA: Decimal(string: "0.2450")!, label: "24.50% EA (Abr-Jun 2026)"),
        InteresMoraRate(desde: "2026-07-01", hasta: "2026-09-30", tasaEA: Decimal(string: "0.2350")!, label: "23.50% EA (Jul-Sep 2026)"),
        InteresMoraRate(desde: "2026-10-01", hasta: "2026-12-31", tasaEA: Decimal(string: "0.2350")!, label: "23.50% EA (Oct-Dic 2026)"),
    ]

    struct BeneficioAuditoria {
        let incremento6Meses: Decimal = Decimal(string: "0.35")!
        let incremento12Meses: Decimal = Decimal(string: "0.25")!
        let impuestoMinUVT: Decimal = 71
        let vigencia: String = "2022-2026"
    }

    static let beneficioAuditoria = BeneficioAuditoria()

    struct PensionRequisitos {
        let edadHombreActual: Int = 62
        let edadMujerActual: Int = 57
        let semanasBase: Int = 1300
    }

    static let pensionRequisitos = PensionRequisitos()

    struct SemanasMujeresProgresivo {
        let anio: Int
        let semanas: Int
    }

    static let semanasMujeresProgresivo: [SemanasMujeresProgresivo] = [
        SemanasMujeresProgresivo(anio: 2025, semanas: 1300),
        SemanasMujeresProgresivo(anio: 2026, semanas: 1250),
        SemanasMujeresProgresivo(anio: 2027, semanas: 1200),
        SemanasMujeresProgresivo(anio: 2028, semanas: 1150),
        SemanasMujeresProgresivo(anio: 2029, semanas: 1100),
        SemanasMujeresProgresivo(anio: 2030, semanas: 1050),
        SemanasMujeresProgresivo(anio: 2031, semanas: 1000),
    ]

    struct DepreciacionTasa {
        let tipo: String
        let label: String
        let tasaMax: Decimal
        let vidaUtil: Int
    }

    static let depreciacionTasas: [DepreciacionTasa] = [
        DepreciacionTasa(tipo: "edificios", label: "Edificaciones y construcciones", tasaMax: Decimal(string: "0.0222")!, vidaUtil: 45),
        DepreciacionTasa(tipo: "maquinaria", label: "Maquinaria y equipo", tasaMax: Decimal(string: "0.10")!, vidaUtil: 10),
        DepreciacionTasa(tipo: "muebles", label: "Muebles y enseres", tasaMax: Decimal(string: "0.10")!, vidaUtil: 10),
        DepreciacionTasa(tipo: "vehiculos", label: "Equipo de transporte", tasaMax: Decimal(string: "0.10")!, vidaUtil: 10),
        DepreciacionTasa(tipo: "computadores", label: "Equipo de computacion y comunicacion", tasaMax: Decimal(string: "0.20")!, vidaUtil: 5),
        DepreciacionTasa(tipo: "redes", label: "Redes de procesamiento de datos", tasaMax: Decimal(string: "0.20")!, vidaUtil: 5),
        DepreciacionTasa(tipo: "semovientes", label: "Semovientes productivos", tasaMax: Decimal(string: "0.10")!, vidaUtil: 10),
    ]

    struct ConsumoTarifa {
        let tipo: String
        let label: String
        let tarifa: Decimal
        let articulo: String
    }

    static let consumoTarifas: [ConsumoTarifa] = [
        ConsumoTarifa(tipo: "restaurantes", label: "Servicio de restaurante y bares", tarifa: Decimal(string: "0.08")!, articulo: "512-1"),
        ConsumoTarifa(tipo: "telefonia", label: "Servicio de telefonia movil", tarifa: Decimal(string: "0.04")!, articulo: "512-2"),
        ConsumoTarifa(tipo: "vehiculos_bajo", label: "Vehiculos (menos de USD 30,000)", tarifa: Decimal(string: "0.08")!, articulo: "512-3"),
        ConsumoTarifa(tipo: "vehiculos_alto", label: "Vehiculos (USD 30,000 o mas)", tarifa: Decimal(string: "0.16")!, articulo: "512-3"),
        ConsumoTarifa(tipo: "motos_alto", label: "Motocicletas > 200cc", tarifa: Decimal(string: "0.08")!, articulo: "512-3"),
        ConsumoTarifa(tipo: "aeronaves", label: "Aeronaves, botes y similares", tarifa: Decimal(string: "0.16")!, articulo: "512-4"),
    ]

    // MARK: - Sobretasa Financiero

    static let sobretasaFinancieroRate: Decimal = Decimal(string: "0.15")!
    static let sobretasaFinancieroThresholdUVT: Decimal = 120_000

    // MARK: - Normalizacion

    static let normalizacionRate: Decimal = Decimal(string: "0.19")!

    // MARK: - IVA Threshold

    static let ivaThresholdUVTAnnual: Decimal = 3_500

    // MARK: - Licencia Maternidad/Paternidad

    static let licenciaMaternidadSemanas: Int = 18
    static let licenciaPaternidadSemanas: Int = 2

    // MARK: - Helper: Apply progressive brackets

    static func applyBrackets(_ valueUVT: Decimal, brackets: [TaxBracket]) -> (impuestoUVT: Decimal, breakdown: [(bracket: TaxBracket, impuesto: Decimal)]) {
        var breakdown: [(bracket: TaxBracket, impuesto: Decimal)] = []

        for bracket in brackets {
            guard valueUVT > bracket.fromUVT else { continue }

            if valueUVT <= bracket.toUVT {
                let impuesto = (valueUVT - bracket.fromUVT) * bracket.rate + bracket.baseUVT
                breakdown.append((bracket, impuesto))
                return (impuesto, breakdown)
            }
        }

        // If we get here, it's in the last bracket
        if let lastBracket = brackets.last, valueUVT > lastBracket.fromUVT {
            let impuesto = (valueUVT - lastBracket.fromUVT) * lastBracket.rate + lastBracket.baseUVT
            breakdown.append((lastBracket, impuesto))
            return (impuesto, breakdown)
        }

        return (0, [])
    }
}
