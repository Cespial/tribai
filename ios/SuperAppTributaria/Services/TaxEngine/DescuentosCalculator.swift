import Foundation

enum DescuentosCalculator {

    struct Input {
        var impuestoNeto: Decimal
        var ivaActivosProductivos: Decimal = 0
        var donaciones: Decimal = 0
        var impuestoExterior: Decimal = 0
    }

    struct Result {
        let impuestoNeto: Decimal
        let descuentoIVA: Decimal
        let descuentoDonaciones: Decimal
        let descuentoExterior: Decimal
        let totalDescuentos: Decimal
        let impuestoFinal: Decimal
        let tarifaEfectiva: Decimal
    }

    /// Art. 258-1: IVA activos productivos — 100% del IVA como descuento.
    /// Art. 257: Donaciones — 25% de la donacion como descuento.
    /// Art. 254: Impuestos pagados en el exterior — limitado al impuesto colombiano proporcional.
    /// Limite total: descuentos no pueden exceder el impuesto neto de renta.
    static func calculate(input: Input) -> Result {
        let impuestoNeto = max(input.impuestoNeto, 0)

        // Art. 258-1: IVA activos fijos reales productivos (100%)
        let descuentoIVA = max(input.ivaActivosProductivos, 0)

        // Art. 257: Donaciones (25% del valor donado)
        let donacionesRate = Decimal(string: "0.25")!
        let descuentoDonaciones = (max(input.donaciones, 0) * donacionesRate).rounded

        // Art. 254: Impuestos pagados en el exterior
        // Limitado al monto del impuesto colombiano atribuible a rentas de fuente extranjera
        let descuentoExterior = max(input.impuestoExterior, 0)

        // Total antes del limite
        let totalBruto = descuentoIVA + descuentoDonaciones + descuentoExterior

        // Limite: no puede exceder el impuesto neto de renta
        let totalDescuentos = min(totalBruto, impuestoNeto)

        let impuestoFinal = max(impuestoNeto - totalDescuentos, 0)

        let tarifaEfectiva: Decimal
        if impuestoNeto > 0 {
            tarifaEfectiva = totalDescuentos / impuestoNeto
        } else {
            tarifaEfectiva = 0
        }

        return Result(
            impuestoNeto: impuestoNeto,
            descuentoIVA: min(descuentoIVA, impuestoNeto),
            descuentoDonaciones: min(descuentoDonaciones, impuestoNeto),
            descuentoExterior: min(descuentoExterior, impuestoNeto),
            totalDescuentos: totalDescuentos,
            impuestoFinal: impuestoFinal,
            tarifaEfectiva: tarifaEfectiva
        )
    }
}
