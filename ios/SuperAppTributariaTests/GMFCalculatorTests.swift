import Testing
import Foundation
@testable import SuperAppTributaria

struct GMFCalculatorTests {
    let uvt = TaxData.uvt2026

    @Test func normalAccountFullGMF() {
        let input = GMFCalculator.Input(monto: 100_000_000)
        let result = GMFCalculator.calculate(input: input)
        #expect(result.montoExento == 0)
        #expect(result.montoGravado == 100_000_000)
        #expect(result.gmf == 400_000) // 100M * 0.004
    }

    @Test func exemptAccountPartialGMF() {
        let input = GMFCalculator.Input(monto: 100_000_000, cuentaExenta: true)
        let result = GMFCalculator.calculate(input: input)
        let exento = 350 * uvt
        #expect(result.montoExento == exento)
        #expect(result.montoGravado == 100_000_000 - exento)
    }

    @Test func exemptAccountBelowThresholdNoGMF() {
        let lowAmount = 100 * uvt
        let input = GMFCalculator.Input(monto: lowAmount, cuentaExenta: true)
        let result = GMFCalculator.calculate(input: input)
        #expect(result.gmf == 0)
    }

    @Test func zeroAmountNoGMF() {
        let result = GMFCalculator.calculate(input: GMFCalculator.Input(monto: 0))
        #expect(result.gmf == 0)
    }

    @Test func gmfRateIs4x1000() {
        let input = GMFCalculator.Input(monto: 1_000)
        let result = GMFCalculator.calculate(input: input)
        #expect(result.gmf == 4) // 1000 * 0.004
    }

    @Test func effectiveRateBelowNominal() {
        let input = GMFCalculator.Input(monto: 100_000_000, cuentaExenta: true)
        let result = GMFCalculator.calculate(input: input)
        #expect(result.tasaEfectiva < TaxData.gmfRate)
    }

    @Test func montoPreserved() {
        let m: Decimal = 55_000_000
        let result = GMFCalculator.calculate(input: GMFCalculator.Input(monto: m))
        #expect(result.monto == m)
    }

    @Test func gravadoNeverNegative() {
        let input = GMFCalculator.Input(monto: 1, cuentaExenta: true)
        let result = GMFCalculator.calculate(input: input)
        #expect(result.montoGravado >= 0)
    }
}
