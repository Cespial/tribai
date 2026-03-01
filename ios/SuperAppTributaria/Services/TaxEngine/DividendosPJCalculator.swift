import Foundation

enum DividendosPJCalculator {

    struct Input {
        var dividendos: Decimal
        var esNacional: Bool = true
        var gravadosSocietario: Bool = true
    }

    struct Result {
        let dividendos: Decimal
        let esNacional: Bool
        let gravadosSocietario: Bool
        let tarifa: Decimal
        let impuesto: Decimal
        let neto: Decimal
        let tarifaEfectiva: Decimal
        let explicacion: String
    }

    /// Dividendos recibidos por personas juridicas:
    /// - PJ Nacional + gravados a nivel societario: 0% (Art. 242-1 par. 1)
    /// - PJ Nacional + NO gravados: 35% tarifa general (Art. 240)
    /// - PJ Extranjera + gravados: 20% retencion (Art. 245)
    /// - PJ Extranjera + NO gravados: 35% primera capa + 20% segunda capa
    static func calculate(input: Input) -> Result {
        let dividendos = max(input.dividendos, 0)

        let tarifa: Decimal
        let impuesto: Decimal
        let explicacion: String

        if input.esNacional {
            if input.gravadosSocietario {
                // Nacional, gravados: 0%
                tarifa = 0
                impuesto = 0
                explicacion = "Dividendos nacionales ya gravados a nivel societario no generan impuesto adicional (Art. 242-1 par. 1 ET)."
            } else {
                // Nacional, no gravados: tarifa general 35%
                let rate = Decimal(string: "0.35")!
                tarifa = rate
                impuesto = (dividendos * rate).rounded
                explicacion = "Dividendos nacionales no gravados a nivel societario tributan a tarifa general del 35% (Art. 240 ET)."
            }
        } else {
            if input.gravadosSocietario {
                // Extranjero, gravados: 20% retencion
                let rate = Decimal(string: "0.20")!
                tarifa = rate
                impuesto = (dividendos * rate).rounded
                explicacion = "Dividendos a PJ extranjera con gravamen societario: retencion del 20% (Art. 245 ET)."
            } else {
                // Extranjero, no gravados: 35% + 20% sobre el neto
                let rate1 = Decimal(string: "0.35")!
                let rate2 = Decimal(string: "0.20")!
                let impuesto1 = (dividendos * rate1).rounded
                let netoPostPrimera = dividendos - impuesto1
                let impuesto2 = (netoPostPrimera * rate2).rounded
                let totalImpuesto = impuesto1 + impuesto2
                tarifa = dividendos > 0 ? totalImpuesto / dividendos : 0
                impuesto = totalImpuesto
                explicacion = "Dividendos a PJ extranjera sin gravamen societario: 35% primera capa (Art. 240) + 20% segunda capa sobre el neto (Art. 245 ET). Tarifa combinada: \(CurrencyFormatter.percent(tarifa))."
            }
        }

        let neto = dividendos - impuesto

        return Result(
            dividendos: dividendos,
            esNacional: input.esNacional,
            gravadosSocietario: input.gravadosSocietario,
            tarifa: tarifa,
            impuesto: impuesto,
            neto: neto,
            tarifaEfectiva: dividendos > 0 ? impuesto / dividendos : 0,
            explicacion: explicacion
        )
    }
}
