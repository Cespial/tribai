import Testing
import Foundation
@testable import SuperAppTributaria

struct PatrimonioCalculatorTests {
    let uvt = TaxData.uvt2026

    @Test func belowThresholdNoTax() {
        let input = PatrimonioCalculator.Input(patrimonioBruto: 50_000 * uvt)
        let result = PatrimonioCalculator.calculate(input: input)
        #expect(result.aplica == false)
        #expect(result.impuesto == 0)
    }

    @Test func aboveThresholdApplies() {
        let input = PatrimonioCalculator.Input(patrimonioBruto: 80_000 * uvt)
        let result = PatrimonioCalculator.calculate(input: input)
        #expect(result.aplica == true)
        #expect(result.impuesto > 0)
    }

    @Test func exactlyAtThreshold() {
        let input = PatrimonioCalculator.Input(patrimonioBruto: 72_000 * uvt)
        let result = PatrimonioCalculator.calculate(input: input)
        #expect(result.aplica == true)
    }

    @Test func deudasReduceBase() {
        let noDeudas = PatrimonioCalculator.calculate(input: PatrimonioCalculator.Input(patrimonioBruto: 100_000 * uvt))
        let withDeudas = PatrimonioCalculator.calculate(input: PatrimonioCalculator.Input(patrimonioBruto: 100_000 * uvt, deudas: 30_000 * uvt))
        #expect(withDeudas.impuesto < noDeudas.impuesto)
    }

    @Test func housingExclusionReducesBase() {
        let noExclusion = PatrimonioCalculator.calculate(input: PatrimonioCalculator.Input(patrimonioBruto: 100_000 * uvt))
        let withVivienda = PatrimonioCalculator.calculate(input: PatrimonioCalculator.Input(patrimonioBruto: 100_000 * uvt, valorVivienda: 10_000 * uvt))
        #expect(withVivienda.impuesto < noExclusion.impuesto)
    }

    @Test func housingExclusionCappedAt12000UVT() {
        let input = PatrimonioCalculator.Input(patrimonioBruto: 150_000 * uvt, valorVivienda: 20_000 * uvt)
        let result = PatrimonioCalculator.calculate(input: input)
        #expect(result.exclusionVivienda == 12_000 * uvt)
    }

    @Test func zeroPatrimonyNoTax() {
        let input = PatrimonioCalculator.Input(patrimonioBruto: 0)
        let result = PatrimonioCalculator.calculate(input: input)
        #expect(result.impuesto == 0)
        #expect(result.aplica == false)
    }

    @Test func patrimonioLiquidoNeverNegative() {
        let input = PatrimonioCalculator.Input(patrimonioBruto: 10_000_000, deudas: 50_000_000)
        let result = PatrimonioCalculator.calculate(input: input)
        #expect(result.patrimonioLiquido >= 0)
    }

    @Test func baseGravableNeverNegative() {
        let input = PatrimonioCalculator.Input(patrimonioBruto: 100_000 * uvt, valorVivienda: 200_000 * uvt)
        let result = PatrimonioCalculator.calculate(input: input)
        #expect(result.baseGravable >= 0)
    }

    @Test func effectiveRateBelowOne() {
        let input = PatrimonioCalculator.Input(patrimonioBruto: 200_000 * uvt)
        let result = PatrimonioCalculator.calculate(input: input)
        #expect(result.tarifaEfectiva > 0)
        #expect(result.tarifaEfectiva < 1)
    }

    // Comparacion patrimonial

    @Test func comparacionNoRiskWhenJustified() {
        let input = PatrimonioCalculator.ComparacionInput(
            patrimonioAnterior: 100_000_000,
            patrimonioActual: 120_000_000,
            rentaDeclarada: 30_000_000
        )
        let result = PatrimonioCalculator.calcComparacion(input: input)
        #expect(result.tieneRiesgo == false)
        #expect(result.rentaNoJustificada == 0)
    }

    @Test func comparacionRiskWhenNotJustified() {
        let input = PatrimonioCalculator.ComparacionInput(
            patrimonioAnterior: 100_000_000,
            patrimonioActual: 200_000_000,
            rentaDeclarada: 10_000_000
        )
        let result = PatrimonioCalculator.calcComparacion(input: input)
        #expect(result.tieneRiesgo == true)
        #expect(result.rentaNoJustificada > 0)
    }

    @Test func comparacionIncrementoCalculation() {
        let input = PatrimonioCalculator.ComparacionInput(
            patrimonioAnterior: 50_000_000,
            patrimonioActual: 80_000_000,
            rentaDeclarada: 20_000_000,
            gananciasOcasionales: 5_000_000
        )
        let result = PatrimonioCalculator.calcComparacion(input: input)
        #expect(result.incrementoPatrimonial == 30_000_000)
        #expect(result.rentaJustificada == 25_000_000)
    }

    @Test func comparacionNoIncrease() {
        let input = PatrimonioCalculator.ComparacionInput(
            patrimonioAnterior: 100_000_000,
            patrimonioActual: 80_000_000,
            rentaDeclarada: 10_000_000
        )
        let result = PatrimonioCalculator.calcComparacion(input: input)
        #expect(result.incrementoPatrimonial == 0)
        #expect(result.tieneRiesgo == false)
    }
}
