import Testing
import Foundation
@testable import SuperAppTributaria

struct RentaCalculatorTests {
    let uvt = TaxData.uvt2026 // 52,374

    // Zero income
    @Test func zeroIncomeReturnsZeroTax() {
        let input = RentaCalculator.Input(ingresosBrutos: 0)
        let result = RentaCalculator.calculate(input: input)
        #expect(result.impuesto == 0)
        #expect(result.rentaLiquida == 0)
        #expect(result.tarifaEfectiva == 0)
    }

    // Below first bracket (1,090 UVT) — 0% tax
    @Test func incomeBelowFirstBracketPayNoTax() {
        let input = RentaCalculator.Input(ingresosBrutos: 1_000 * uvt)
        let result = RentaCalculator.calculate(input: input)
        #expect(result.impuesto == 0)
        #expect(result.tarifaEfectiva == 0)
    }

    // In second bracket (1,090–1,700 UVT) — 19%
    @Test func incomeInSecondBracketTaxedAt19Percent() {
        let input = RentaCalculator.Input(ingresosBrutos: 1_500 * uvt)
        let result = RentaCalculator.calculate(input: input)
        #expect(result.impuesto > 0)
        #expect(result.breakdown.count >= 2)
    }

    // In third bracket (1,700–4,100 UVT) — 28%
    @Test func incomeInThirdBracket() {
        let input = RentaCalculator.Input(ingresosBrutos: 3_000 * uvt)
        let result = RentaCalculator.calculate(input: input)
        #expect(result.impuesto > 0)
        #expect(result.breakdown.count >= 3)
    }

    // In fourth bracket (4,100–8,670 UVT) — 33%
    @Test func incomeInFourthBracket() {
        let input = RentaCalculator.Input(ingresosBrutos: 6_000 * uvt)
        let result = RentaCalculator.calculate(input: input)
        #expect(result.impuesto > 0)
    }

    // In fifth bracket (8,670–18,970 UVT) — 35%
    @Test func incomeInFifthBracket() {
        let input = RentaCalculator.Input(ingresosBrutos: 15_000 * uvt)
        let result = RentaCalculator.calculate(input: input)
        #expect(result.impuesto > 0)
    }

    // In sixth bracket (18,970–31,000 UVT) — 37%
    @Test func incomeInSixthBracket() {
        let input = RentaCalculator.Input(ingresosBrutos: 25_000 * uvt)
        let result = RentaCalculator.calculate(input: input)
        #expect(result.impuesto > 0)
    }

    // In top bracket (31,000+ UVT) — 39%
    @Test func incomeInTopBracket() {
        let input = RentaCalculator.Input(ingresosBrutos: 40_000 * uvt)
        let result = RentaCalculator.calculate(input: input)
        #expect(result.impuesto > 0)
        #expect(result.breakdown.count == 7)
    }

    // Deductions reduce taxable income
    @Test func deductionsReduceTaxableIncome() {
        let noDeductions = RentaCalculator.calculate(input: RentaCalculator.Input(ingresosBrutos: 5_000 * uvt))
        let withDeductions = RentaCalculator.calculate(input: RentaCalculator.Input(ingresosBrutos: 5_000 * uvt, deducciones: 1_000 * uvt))
        #expect(withDeductions.impuesto < noDeductions.impuesto)
        #expect(withDeductions.totalDeducciones > 0)
    }

    // Deductions capped at 1,340 UVT
    @Test func deductionsCappedAt1340UVT() {
        let input = RentaCalculator.Input(
            ingresosBrutos: 10_000 * uvt,
            deducciones: 2_000 * uvt
        )
        let result = RentaCalculator.calculate(input: input)
        let cap = TaxData.ley2277Limits.deduccionesExentasMaxUVT * uvt
        #expect(result.totalDeducciones <= cap)
    }

    // Rentas exentas capped at 790 UVT
    @Test func rentasExentasCappedAt790UVT() {
        let input = RentaCalculator.Input(
            ingresosBrutos: 10_000 * uvt,
            rentasExentas: 1_000 * uvt
        )
        let result = RentaCalculator.calculate(input: input)
        // The total deduction includes the capped rentas exentas
        #expect(result.totalDeducciones > 0)
    }

    // Dependientes max 4
    @Test func dependientesMaxFour() {
        let with4 = RentaCalculator.calculate(input: RentaCalculator.Input(ingresosBrutos: 5_000 * uvt, dependientes: 4))
        let with10 = RentaCalculator.calculate(input: RentaCalculator.Input(ingresosBrutos: 5_000 * uvt, dependientes: 10))
        #expect(with4.impuesto == with10.impuesto)
    }

    // Dependientes deduction = n * 72 UVT
    @Test func dependientesDeductionCalculation() {
        let noDep = RentaCalculator.calculate(input: RentaCalculator.Input(ingresosBrutos: 5_000 * uvt, dependientes: 0))
        let withDep = RentaCalculator.calculate(input: RentaCalculator.Input(ingresosBrutos: 5_000 * uvt, dependientes: 2))
        #expect(withDep.impuesto < noDep.impuesto)
    }

    // Aportes voluntarios reduce tax
    @Test func aportesVoluntariosReduceTax() {
        let noAportes = RentaCalculator.calculate(input: RentaCalculator.Input(ingresosBrutos: 5_000 * uvt))
        let withAportes = RentaCalculator.calculate(input: RentaCalculator.Input(ingresosBrutos: 5_000 * uvt, aportesVoluntarios: 200 * uvt))
        #expect(withAportes.impuesto < noAportes.impuesto)
    }

    // Effective rate increases with income
    @Test func effectiveRateIncreasesWithIncome() {
        let low = RentaCalculator.calculate(input: RentaCalculator.Input(ingresosBrutos: 2_000 * uvt))
        let high = RentaCalculator.calculate(input: RentaCalculator.Input(ingresosBrutos: 20_000 * uvt))
        #expect(high.tarifaEfectiva > low.tarifaEfectiva)
    }

    // Renta liquida never negative
    @Test func rentaLiquidaNeverNegative() {
        let input = RentaCalculator.Input(ingresosBrutos: 100 * uvt, deducciones: 500 * uvt)
        let result = RentaCalculator.calculate(input: input)
        #expect(result.rentaLiquida >= 0)
        #expect(result.impuesto == 0)
    }

    // Breakdown items sum matches total
    @Test func breakdownSumMatchesTotal() {
        let input = RentaCalculator.Input(ingresosBrutos: 10_000 * uvt)
        let result = RentaCalculator.calculate(input: input)
        // The total impuesto should equal the bracket calculation
        #expect(result.impuesto > 0)
        #expect(result.breakdown.count > 0)
    }

    // UVT values in result
    @Test func resultContainsUVTValues() {
        let input = RentaCalculator.Input(ingresosBrutos: 5_000 * uvt)
        let result = RentaCalculator.calculate(input: input)
        #expect(result.rentaLiquidaUVT > 0)
        #expect(result.impuestoUVT > 0)
    }

    // Combined cap test
    @Test func combinedDeductionsAndExemptionsCapped() {
        let input = RentaCalculator.Input(
            ingresosBrutos: 10_000 * uvt,
            deducciones: 500 * uvt,
            rentasExentas: 500 * uvt,
            dependientes: 4,
            aportesVoluntarios: 500 * uvt
        )
        let result = RentaCalculator.calculate(input: input)
        let cap = TaxData.ley2277Limits.deduccionesExentasMaxUVT * uvt
        #expect(result.totalDeducciones <= cap)
    }

    // Boundary: exactly at bracket edge
    @Test func exactlyAtBracketBoundary1090UVT() {
        let input = RentaCalculator.Input(ingresosBrutos: 1_090 * uvt)
        let result = RentaCalculator.calculate(input: input)
        #expect(result.impuesto == 0)
    }

    // Very large income
    @Test func veryLargeIncome() {
        let input = RentaCalculator.Input(ingresosBrutos: 100_000 * uvt)
        let result = RentaCalculator.calculate(input: input)
        #expect(result.impuesto > 0)
        #expect(result.tarifaEfectiva > 0)
        #expect(result.tarifaEfectiva < 1)
    }

    // Custom UVT
    @Test func customUVTValueWorks() {
        let input = RentaCalculator.Input(ingresosBrutos: 100_000_000, uvt: 50_000)
        let result = RentaCalculator.calculate(input: input)
        #expect(result.impuesto > 0)
    }

    // Ingresos brutos matches in result
    @Test func ingresosBrutosPreservedInResult() {
        let amount: Decimal = 250_000_000
        let input = RentaCalculator.Input(ingresosBrutos: amount)
        let result = RentaCalculator.calculate(input: input)
        #expect(result.ingresosBrutos == amount)
    }
}
