import Testing
import Foundation
@testable import SuperAppTributaria

struct DividendosPJCalculatorTests {
    @Test func nacionalGravados0Percent() {
        let input = DividendosPJCalculator.Input(dividendos: 100_000_000, esNacional: true, gravadosSocietario: true)
        let result = DividendosPJCalculator.calculate(input: input)
        #expect(result.impuesto == 0)
        #expect(result.tarifa == 0)
        #expect(result.neto == 100_000_000)
    }

    @Test func nacionalNoGravados35Percent() {
        let input = DividendosPJCalculator.Input(dividendos: 100_000_000, esNacional: true, gravadosSocietario: false)
        let result = DividendosPJCalculator.calculate(input: input)
        #expect(result.impuesto == 35_000_000)
        #expect(result.tarifa == Decimal(string: "0.35")!)
    }

    @Test func extranjeroGravados20Percent() {
        let input = DividendosPJCalculator.Input(dividendos: 100_000_000, esNacional: false, gravadosSocietario: true)
        let result = DividendosPJCalculator.calculate(input: input)
        #expect(result.impuesto == 20_000_000)
    }

    @Test func extranjeroNoGravadosCombinedRate() {
        let input = DividendosPJCalculator.Input(dividendos: 100_000_000, esNacional: false, gravadosSocietario: false)
        let result = DividendosPJCalculator.calculate(input: input)
        // 35M first layer + 20% of 65M = 13M => 48M total
        #expect(result.impuesto == 48_000_000)
    }

    @Test func netoIsDividendosMinusImpuesto() {
        let input = DividendosPJCalculator.Input(dividendos: 100_000_000, esNacional: false, gravadosSocietario: true)
        let result = DividendosPJCalculator.calculate(input: input)
        #expect(result.neto == result.dividendos - result.impuesto)
    }

    @Test func zeroDividendosNoTax() {
        let result = DividendosPJCalculator.calculate(input: DividendosPJCalculator.Input(dividendos: 0))
        #expect(result.impuesto == 0)
        #expect(result.neto == 0)
    }

    @Test func explicacionNotEmpty() {
        let input = DividendosPJCalculator.Input(dividendos: 50_000_000)
        let result = DividendosPJCalculator.calculate(input: input)
        #expect(!result.explicacion.isEmpty)
    }

    @Test func tarifaEfectivaCalculated() {
        let input = DividendosPJCalculator.Input(dividendos: 100_000_000, esNacional: false, gravadosSocietario: false)
        let result = DividendosPJCalculator.calculate(input: input)
        #expect(result.tarifaEfectiva > 0)
        #expect(result.tarifaEfectiva == result.impuesto / result.dividendos)
    }

    @Test func flagsPreserved() {
        let input = DividendosPJCalculator.Input(dividendos: 50_000_000, esNacional: false, gravadosSocietario: true)
        let result = DividendosPJCalculator.calculate(input: input)
        #expect(result.esNacional == false)
        #expect(result.gravadosSocietario == true)
    }
}
