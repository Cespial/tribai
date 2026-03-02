import Testing
import Foundation
@testable import SuperAppTributaria

struct IVACalculatorTests {
    // Calcular mode — general 19%
    @Test func calcularGeneral19Percent() {
        let input = IVACalculator.Input(monto: 1_000_000)
        let result = IVACalculator.calculate(input: input)
        #expect(result.base == 1_000_000)
        #expect(result.iva == 190_000)
        #expect(result.total == 1_190_000)
        #expect(result.tarifa == TaxData.ivaGeneral)
    }

    // Calcular mode — reducido 5%
    @Test func calcularReducido5Percent() {
        let input = IVACalculator.Input(monto: 1_000_000, tarifa: .reducido)
        let result = IVACalculator.calculate(input: input)
        #expect(result.base == 1_000_000)
        #expect(result.iva == 50_000)
        #expect(result.total == 1_050_000)
        #expect(result.tarifa == TaxData.ivaReducido)
    }

    // Extraer mode — general
    @Test func extraerGeneral19Percent() {
        let input = IVACalculator.Input(monto: 1_190_000, mode: .extraer)
        let result = IVACalculator.calculate(input: input)
        #expect(result.total == 1_190_000)
        #expect(result.base == 1_000_000)
        #expect(result.iva == 190_000)
    }

    // Extraer mode — reducido
    @Test func extraerReducido5Percent() {
        let input = IVACalculator.Input(monto: 1_050_000, mode: .extraer, tarifa: .reducido)
        let result = IVACalculator.calculate(input: input)
        #expect(result.total == 1_050_000)
        #expect(result.base == 1_000_000)
        #expect(result.iva == 50_000)
    }

    // Zero amount
    @Test func zeroAmountReturnsZeros() {
        let result = IVACalculator.calculate(input: IVACalculator.Input(monto: 0))
        #expect(result.base == 0)
        #expect(result.iva == 0)
        #expect(result.total == 0)
    }

    // Mode preserved in result
    @Test func modePreservedInResult() {
        let calc = IVACalculator.calculate(input: IVACalculator.Input(monto: 100, mode: .calcular))
        let extr = IVACalculator.calculate(input: IVACalculator.Input(monto: 119, mode: .extraer))
        #expect(calc.mode == .calcular)
        #expect(extr.mode == .extraer)
    }

    // Large amount
    @Test func largeAmountCalculatesCorrectly() {
        let input = IVACalculator.Input(monto: 10_000_000_000)
        let result = IVACalculator.calculate(input: input)
        #expect(result.iva == 1_900_000_000)
        #expect(result.total == 11_900_000_000)
    }

    // Tarifa rate values
    @Test func tarifaRateValues() {
        #expect(IVACalculator.Tarifa.general.rate == Decimal(string: "0.19")!)
        #expect(IVACalculator.Tarifa.reducido.rate == Decimal(string: "0.05")!)
    }

    // Base + IVA = total in calcular mode
    @Test func baseAndIVAEqualTotalInCalcular() {
        let input = IVACalculator.Input(monto: 500_000, mode: .calcular, tarifa: .general)
        let result = IVACalculator.calculate(input: input)
        #expect(result.base + result.iva == result.total)
    }

    // Base + IVA = total in extraer mode
    @Test func baseAndIVAEqualTotalInExtraer() {
        let input = IVACalculator.Input(monto: 595_000, mode: .extraer, tarifa: .general)
        let result = IVACalculator.calculate(input: input)
        #expect(result.base + result.iva == result.total)
    }

    // Small amount rounding
    @Test func smallAmountRounding() {
        let input = IVACalculator.Input(monto: 1)
        let result = IVACalculator.calculate(input: input)
        #expect(result.iva >= 0)
        #expect(result.total >= result.base)
    }

    // Calcular then extraer returns same base
    @Test func calcularAndExtraerAreInverse() {
        let calcResult = IVACalculator.calculate(input: IVACalculator.Input(monto: 1_000_000, mode: .calcular))
        let extrResult = IVACalculator.calculate(input: IVACalculator.Input(monto: calcResult.total, mode: .extraer))
        #expect(extrResult.base == calcResult.base)
    }

    // All tarifas are iterable
    @Test func allTarifasIterable() {
        let allCases = IVACalculator.Tarifa.allCases
        #expect(allCases.count == 2)
    }

    // Tarifa identifiable
    @Test func tarifaIdentifiable() {
        let general = IVACalculator.Tarifa.general
        #expect(general.id == "19%")
        let reducido = IVACalculator.Tarifa.reducido
        #expect(reducido.id == "5%")
    }
}
