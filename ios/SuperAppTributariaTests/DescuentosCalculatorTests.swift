import Testing
import Foundation
@testable import SuperAppTributaria

struct DescuentosCalculatorTests {
    @Test func ivaActivosProductivos100PercentDiscount() {
        let input = DescuentosCalculator.Input(impuestoNeto: 10_000_000, ivaActivosProductivos: 2_000_000)
        let result = DescuentosCalculator.calculate(input: input)
        #expect(result.totalDescuentos == 2_000_000)
        #expect(result.impuestoFinal == 8_000_000)
    }

    @Test func donaciones25PercentDiscount() {
        let input = DescuentosCalculator.Input(impuestoNeto: 10_000_000, donaciones: 4_000_000)
        let result = DescuentosCalculator.calculate(input: input)
        #expect(result.descuentoDonaciones == 1_000_000)
    }

    @Test func impuestoExteriorDiscount() {
        let input = DescuentosCalculator.Input(impuestoNeto: 10_000_000, impuestoExterior: 3_000_000)
        let result = DescuentosCalculator.calculate(input: input)
        #expect(result.descuentoExterior == 3_000_000)
    }

    @Test func totalDiscountsCannotExceedTaxNet() {
        let input = DescuentosCalculator.Input(
            impuestoNeto: 5_000_000,
            ivaActivosProductivos: 3_000_000,
            donaciones: 8_000_000,
            impuestoExterior: 3_000_000
        )
        let result = DescuentosCalculator.calculate(input: input)
        #expect(result.totalDescuentos <= 5_000_000)
        #expect(result.impuestoFinal >= 0)
    }

    @Test func proratedWhenExceedsCap() {
        let input = DescuentosCalculator.Input(
            impuestoNeto: 5_000_000,
            ivaActivosProductivos: 3_000_000,
            donaciones: 20_000_000,
            impuestoExterior: 3_000_000
        )
        let result = DescuentosCalculator.calculate(input: input)
        // All individual discounts should be prorated
        #expect(result.descuentoIVA < 3_000_000)
    }

    @Test func noDiscountsReturnsFullTax() {
        let input = DescuentosCalculator.Input(impuestoNeto: 10_000_000)
        let result = DescuentosCalculator.calculate(input: input)
        #expect(result.totalDescuentos == 0)
        #expect(result.impuestoFinal == 10_000_000)
    }

    @Test func zeroTaxNoDiscounts() {
        let input = DescuentosCalculator.Input(impuestoNeto: 0, ivaActivosProductivos: 1_000_000)
        let result = DescuentosCalculator.calculate(input: input)
        #expect(result.totalDescuentos == 0)
        #expect(result.impuestoFinal == 0)
    }

    @Test func impuestoFinalNeverNegative() {
        let input = DescuentosCalculator.Input(impuestoNeto: 1_000, ivaActivosProductivos: 999_999)
        let result = DescuentosCalculator.calculate(input: input)
        #expect(result.impuestoFinal >= 0)
    }

    @Test func tarifaEfectivaWhenZeroTax() {
        let result = DescuentosCalculator.calculate(input: DescuentosCalculator.Input(impuestoNeto: 0))
        #expect(result.tarifaEfectiva == 0)
    }

    @Test func allThreeDiscountsCombined() {
        let input = DescuentosCalculator.Input(
            impuestoNeto: 100_000_000,
            ivaActivosProductivos: 10_000_000,
            donaciones: 20_000_000,
            impuestoExterior: 5_000_000
        )
        let result = DescuentosCalculator.calculate(input: input)
        let expectedTotal: Decimal = 10_000_000 + 5_000_000 + 5_000_000 // IVA + 25% donations + exterior
        #expect(result.totalDescuentos == expectedTotal)
    }

    @Test func impuestoNetoPreserved() {
        let input = DescuentosCalculator.Input(impuestoNeto: 42_000_000)
        let result = DescuentosCalculator.calculate(input: input)
        #expect(result.impuestoNeto == 42_000_000)
    }
}
