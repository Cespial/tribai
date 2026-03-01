import Foundation

/// Regimen SIMPLE (RST) — Art. 903, 908 ET
enum SIMPLECalculator {

    struct Input {
        var ingresosBrutos: Decimal
        var grupoId: Int        // 1-5
        var costosDeducciones: Decimal = 0
        var usaCostosReales: Bool = false
        var margenUtilidad: Decimal = 30  // % if not using real costs
        var uvt: Decimal = TaxData.uvt2026
    }

    struct Result {
        let ingresosBrutos: Decimal
        let ingresosUVT: Decimal
        let tarifaSIMPLE: Decimal
        let impuestoSIMPLE: Decimal
        // Comparison with ordinary regime
        let utilidadEstimada: Decimal
        let impuestoOrdinario: Decimal
        let ahorro: Decimal
        let convieneSIMPLE: Bool
        let grupo: String
    }

    static func calculate(input: Input) -> Result {
        let ingresosUVT = input.ingresosBrutos / input.uvt
        let groupIndex = max(0, min(4, input.grupoId - 1))

        // Find applicable bracket
        var tarifaAplicable: Decimal = 0
        for bracket in TaxData.simpleBrackets {
            if ingresosUVT >= bracket.fromUVT && ingresosUVT <= bracket.toUVT {
                tarifaAplicable = bracket.rates[groupIndex]
                break
            }
        }
        // If above all brackets, use the last
        if tarifaAplicable == 0, let last = TaxData.simpleBrackets.last, ingresosUVT > last.fromUVT {
            tarifaAplicable = last.rates[groupIndex]
        }

        // SIMPLE tax (flat rate on gross income)
        let impuestoSIMPLE = (input.ingresosBrutos * tarifaAplicable).rounded

        // Estimate ordinary regime for comparison
        let utilidadEstimada: Decimal
        if input.usaCostosReales {
            utilidadEstimada = max(0, input.ingresosBrutos - input.costosDeducciones)
        } else {
            utilidadEstimada = input.ingresosBrutos * (input.margenUtilidad / 100)
        }

        let utilidadUVT = utilidadEstimada / input.uvt
        let (impuestoUVT, _) = TaxData.applyBrackets(utilidadUVT, brackets: TaxData.rentaBrackets)
        let impuestoOrdinario = (impuestoUVT * input.uvt).rounded

        let ahorro = impuestoOrdinario - impuestoSIMPLE
        let grupoLabel = TaxData.simpleGroups.first { $0.id == input.grupoId }?.label ?? "Grupo \(input.grupoId)"

        return Result(
            ingresosBrutos: input.ingresosBrutos,
            ingresosUVT: ingresosUVT.rounded(to: 2),
            tarifaSIMPLE: tarifaAplicable,
            impuestoSIMPLE: impuestoSIMPLE,
            utilidadEstimada: utilidadEstimada,
            impuestoOrdinario: impuestoOrdinario,
            ahorro: ahorro,
            convieneSIMPLE: ahorro > 0,
            grupo: grupoLabel
        )
    }
}
