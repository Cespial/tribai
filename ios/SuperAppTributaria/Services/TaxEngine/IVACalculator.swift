import Foundation

/// IVA Calculator — Art. 468, 477, 424 ET
enum IVACalculator {

    enum Mode {
        case calcular   // Add IVA to base
        case extraer    // Extract IVA from total
    }

    enum Tarifa: String, CaseIterable, Identifiable {
        case general = "19%"
        case reducido = "5%"

        var id: String { rawValue }

        var rate: Decimal {
            switch self {
            case .general: return TaxData.ivaGeneral
            case .reducido: return TaxData.ivaReducido
            }
        }
    }

    struct Input {
        var monto: Decimal
        var mode: Mode = .calcular
        var tarifa: Tarifa = .general
    }

    struct Result {
        let base: Decimal
        let iva: Decimal
        let total: Decimal
        let tarifa: Decimal
        let mode: Mode
    }

    static func calculate(input: Input) -> Result {
        let rate = input.tarifa.rate

        switch input.mode {
        case .calcular:
            let base = input.monto
            let iva = (base * rate).rounded
            let total = base + iva
            return Result(base: base, iva: iva, total: total, tarifa: rate, mode: .calcular)

        case .extraer:
            let total = input.monto
            let base = (total / (1 + rate)).rounded
            let iva = total - base
            return Result(base: base, iva: iva, total: total, tarifa: rate, mode: .extraer)
        }
    }
}
