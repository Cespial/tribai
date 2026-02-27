import Foundation

/// Renta Personas Naturales — Art. 241 ET (tabla marginal, depuracion, cedulas)
enum RentaCalculator {

    struct Input {
        var ingresosBrutos: Decimal
        var deducciones: Decimal = 0
        var rentasExentas: Decimal = 0
        var dependientes: Int = 0
        var aportesVoluntarios: Decimal = 0
        var uvt: Decimal = TaxData.uvt2026
    }

    struct BreakdownItem {
        let fromUVT: Decimal
        let toUVT: Decimal
        let rate: Decimal
        let impuestoUVT: Decimal
        let impuestoCOP: Decimal
    }

    struct Result {
        let ingresosBrutos: Decimal
        let totalDeducciones: Decimal
        let rentaLiquida: Decimal
        let rentaLiquidaUVT: Decimal
        let impuesto: Decimal
        let impuestoUVT: Decimal
        let tarifaEfectiva: Decimal
        let breakdown: [BreakdownItem]
    }

    static func calculate(input: Input) -> Result {
        let limits = TaxData.ley2277Limits

        // 1. Dependientes deduction (max 4 dependientes * 72 UVT)
        let dependienteDeduccion = Decimal(min(input.dependientes, limits.maxDependientes)) * limits.dependienteUVT * input.uvt

        // 2. Cap rentas exentas at 790 UVT
        let rentasExentasCap = min(input.rentasExentas, limits.rentasExentasMaxUVT * input.uvt)

        // 3. Total deductions + exemptions
        let totalDeduccionesExentas = input.deducciones + rentasExentasCap + dependienteDeduccion + input.aportesVoluntarios

        // 4. Cap combined at 1,340 UVT
        let capDeduccionesExentas = limits.deduccionesExentasMaxUVT * input.uvt
        let deduccionesAplicadas = min(totalDeduccionesExentas, capDeduccionesExentas)

        // 5. Renta liquida gravable
        let rentaLiquida = max(0, input.ingresosBrutos - deduccionesAplicadas)
        let rentaLiquidaUVT = rentaLiquida / input.uvt

        // 6. Apply progressive brackets
        let (impuestoUVT, _) = TaxData.applyBrackets(rentaLiquidaUVT, brackets: TaxData.rentaBrackets)
        let impuestoCOP = (impuestoUVT * input.uvt).rounded

        // 7. Build breakdown
        var breakdown: [BreakdownItem] = []
        for br in TaxData.rentaBrackets {
            guard rentaLiquidaUVT > br.fromUVT else { break }
            let topInBracket = min(rentaLiquidaUVT, br.toUVT)
            let taxableInBracket = topInBracket - br.fromUVT
            let impBracket = taxableInBracket * br.rate
            breakdown.append(BreakdownItem(
                fromUVT: br.fromUVT, toUVT: br.toUVT,
                rate: br.rate, impuestoUVT: impBracket,
                impuestoCOP: (impBracket * input.uvt).rounded
            ))
        }

        // 8. Effective rate
        let tarifaEfectiva = input.ingresosBrutos > 0 ? impuestoCOP / input.ingresosBrutos : 0

        return Result(
            ingresosBrutos: input.ingresosBrutos,
            totalDeducciones: deduccionesAplicadas,
            rentaLiquida: rentaLiquida,
            rentaLiquidaUVT: rentaLiquidaUVT.rounded(to: 2),
            impuesto: impuestoCOP,
            impuestoUVT: impuestoUVT.rounded(to: 2),
            tarifaEfectiva: tarifaEfectiva.rounded(to: 4),
            breakdown: breakdown
        )
    }
}
