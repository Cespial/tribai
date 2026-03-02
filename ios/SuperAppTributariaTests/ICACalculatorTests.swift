import Testing
import Foundation
@testable import SuperAppTributaria

struct ICACalculatorTests {
    @Test func comercialDefaultTarifa() {
        let input = ICACalculator.Input(ingresosBrutos: 100_000_000)
        let result = ICACalculator.calculate(input: input)
        #expect(result.tarifaPorMil == Decimal(string: "4.14")!)
        #expect(result.ica > 0)
    }

    @Test func serviciosTarifa() {
        let input = ICACalculator.Input(ingresosBrutos: 100_000_000, actividad: .servicios)
        let result = ICACalculator.calculate(input: input)
        #expect(result.tarifaPorMil == Decimal(string: "9.66")!)
    }

    @Test func financieraTarifa() {
        let input = ICACalculator.Input(ingresosBrutos: 100_000_000, actividad: .financiera)
        let result = ICACalculator.calculate(input: input)
        #expect(result.tarifaPorMil == Decimal(string: "11.04")!)
    }

    @Test func avisosTableros15PercentOfICA() {
        let input = ICACalculator.Input(ingresosBrutos: 100_000_000)
        let result = ICACalculator.calculate(input: input)
        #expect(result.avisosTableros == (result.ica * Decimal(string: "0.15")!).rounded)
    }

    @Test func sobretasaBomberil3PercentOfICA() {
        let input = ICACalculator.Input(ingresosBrutos: 100_000_000)
        let result = ICACalculator.calculate(input: input)
        #expect(result.sobretasaBomberil == (result.ica * Decimal(string: "0.03")!).rounded)
    }

    @Test func totalICAIsSumOfComponents() {
        let input = ICACalculator.Input(ingresosBrutos: 100_000_000)
        let result = ICACalculator.calculate(input: input)
        #expect(result.totalICA == result.ica + result.avisosTableros + result.sobretasaBomberil)
    }

    @Test func customTarifaOverridesDefault() {
        let input = ICACalculator.Input(ingresosBrutos: 100_000_000, tarifaPersonalizada: 10)
        let result = ICACalculator.calculate(input: input)
        #expect(result.tarifaPorMil == 10)
        #expect(result.ica == (100_000_000 * 10 / 1_000).rounded)
    }

    @Test func zeroIncomesNoICA() {
        let result = ICACalculator.calculate(input: ICACalculator.Input(ingresosBrutos: 0))
        #expect(result.ica == 0)
        #expect(result.totalICA == 0)
    }

    @Test func actividadLabelReturned() {
        let input = ICACalculator.Input(ingresosBrutos: 100_000_000, actividad: .industrial)
        let result = ICACalculator.calculate(input: input)
        #expect(result.actividad == "Industrial")
    }

    @Test func allActividadesIterable() {
        #expect(ICACalculator.Actividad.allCases.count == 4)
    }
}
