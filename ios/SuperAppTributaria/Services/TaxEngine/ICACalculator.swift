import Foundation

enum ICACalculator {

    enum Actividad: String, CaseIterable, Identifiable, Sendable {
        case comercial = "comercial"
        case industrial = "industrial"
        case servicios = "servicios"
        case financiera = "financiera"

        var id: String { rawValue }

        var label: String {
            switch self {
            case .comercial: "Comercial"
            case .industrial: "Industrial"
            case .servicios: "Servicios"
            case .financiera: "Financiera"
            }
        }

        /// Tarifas tipicas por mil (rango promedio nacional)
        var tarifaPorMil: Decimal {
            switch self {
            case .comercial: Decimal(string: "4.14")!
            case .industrial: Decimal(string: "6.9")!
            case .servicios: Decimal(string: "9.66")!
            case .financiera: Decimal(string: "11.04")!
            }
        }

        var rangoTarifa: String {
            switch self {
            case .comercial: "4.14 - 13.8 por mil"
            case .industrial: "3.0 - 7.0 por mil"
            case .servicios: "4.0 - 14.0 por mil"
            case .financiera: "5.0 - 14.0 por mil"
            }
        }
    }

    struct Input {
        var ingresosBrutos: Decimal
        var actividad: Actividad = .comercial
        var tarifaPersonalizada: Decimal? = nil // por mil
    }

    struct Result {
        let ingresosBrutos: Decimal
        let actividad: String
        let tarifaPorMil: Decimal
        let baseGravable: Decimal
        let ica: Decimal
        let avisosTableros: Decimal // 15% del ICA
        let sobretasaBomberil: Decimal // tipicamente 2-6% del ICA
        let totalICA: Decimal
        let tarifaEfectiva: Decimal
    }

    /// ICA = Impuesto de Industria y Comercio
    /// Base: ingresos brutos obtenidos en el municipio
    /// Tarifa: variable por actividad y municipio (2 a 14 por mil)
    /// Sobretasa avisos y tableros: 15% del ICA (Art. 37 Ley 14/1983)
    /// Sobretasa bomberil: variable (tipicamente 3% del ICA)
    static func calculate(input: Input) -> Result {
        let ingresos = max(input.ingresosBrutos, 0)

        let tarifaPorMil = input.tarifaPersonalizada ?? input.actividad.tarifaPorMil

        // ICA = ingresos * tarifa / 1000
        let porMilDivisor = Decimal(string: "1000")!
        let ica = (ingresos * tarifaPorMil / porMilDivisor).rounded

        // Avisos y tableros: 15% del ICA
        let avisosRate = Decimal(string: "0.15")!
        let avisos = (ica * avisosRate).rounded

        // Sobretasa bomberil: tipicamente 3% del ICA
        let bomberilRate = Decimal(string: "0.03")!
        let bomberil = (ica * bomberilRate).rounded

        let total = ica + avisos + bomberil

        let tarifaEfectiva: Decimal
        if ingresos > 0 {
            tarifaEfectiva = total / ingresos
        } else {
            tarifaEfectiva = 0
        }

        return Result(
            ingresosBrutos: ingresos,
            actividad: input.actividad.label,
            tarifaPorMil: tarifaPorMil,
            baseGravable: ingresos,
            ica: ica,
            avisosTableros: avisos,
            sobretasaBomberil: bomberil,
            totalICA: total,
            tarifaEfectiva: tarifaEfectiva
        )
    }
}
