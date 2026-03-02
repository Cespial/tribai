import Testing
import Foundation
@testable import SuperAppTributaria

struct SancionesCalculatorTests {
    let uvt = TaxData.uvt2026

    // Extemporaneidad

    @Test func extemporaneidadBeforeEmplazamiento5PercentPerMonth() {
        let input = SancionesCalculator.ExtemporaneidadInput(impuesto: 10_000_000, meses: 3)
        let result = SancionesCalculator.calcExtemporaneidad(input: input)
        // 10M * 5% * 3 = 1.5M bruto, first offense 50% = 750K, but min 10 UVT
        #expect(result.sancionBruta == 1_500_000)
    }

    @Test func extemporaneidadWithEmplazamiento10PercentPerMonth() {
        let input = SancionesCalculator.ExtemporaneidadInput(impuesto: 10_000_000, meses: 3, conEmplazamiento: true)
        let result = SancionesCalculator.calcExtemporaneidad(input: input)
        #expect(result.sancionBruta == 3_000_000)
    }

    @Test func extemporaneidadFirstOffense50PercentReduction() {
        let input = SancionesCalculator.ExtemporaneidadInput(impuesto: 10_000_000, meses: 2, primeraInfraccion: true)
        let result = SancionesCalculator.calcExtemporaneidad(input: input)
        #expect(result.reduccion == Decimal(string: "0.50")!)
        #expect(result.sancionReducida < result.sancionConTope)
    }

    @Test func extemporaneidadNotFirstOffenseNoReduction() {
        let input = SancionesCalculator.ExtemporaneidadInput(impuesto: 10_000_000, meses: 2, primeraInfraccion: false)
        let result = SancionesCalculator.calcExtemporaneidad(input: input)
        #expect(result.reduccion == 0)
    }

    @Test func extemporaneidadMinimum10UVT() {
        let input = SancionesCalculator.ExtemporaneidadInput(impuesto: 100, meses: 1)
        let result = SancionesCalculator.calcExtemporaneidad(input: input)
        #expect(result.sancionFinal >= TaxData.sancionMinimaUVT * uvt)
    }

    @Test func extemporaneidadToppedAtImpuesto() {
        let input = SancionesCalculator.ExtemporaneidadInput(impuesto: 1_000_000, meses: 50)
        let result = SancionesCalculator.calcExtemporaneidad(input: input)
        #expect(result.sancionConTope <= 1_000_000) // tope = impuesto
    }

    @Test func extemporaneidadBasedOnIngresosWhenZeroImpuesto() {
        let input = SancionesCalculator.ExtemporaneidadInput(impuesto: 0, meses: 3, ingresoBruto: 100_000_000)
        let result = SancionesCalculator.calcExtemporaneidad(input: input)
        #expect(result.sancionBruta > 0)
    }

    // No Declarar

    @Test func noDeclarar() {
        let nd = SancionesCalculator.NoDeclarar(ingresosBrutos: 100_000_000, consignaciones: 50_000_000, uvt: uvt)
        let result = nd.calculate()
        #expect(result.sancionFinal > 0)
        #expect(result.descripcion.contains("643"))
    }

    @Test func noDeclararUsesMaxOfIngresosOrConsignaciones() {
        let nd = SancionesCalculator.NoDeclarar(ingresosBrutos: 100_000_000, consignaciones: 200_000_000, uvt: uvt)
        let result = nd.calculate()
        // 200M * 20% = 40M is the larger base
        #expect(result.sancionBruta >= (200_000_000 * Decimal(string: "0.20")!).rounded)
    }

    // Correccion

    @Test func correccionVoluntaria10Percent() {
        let input = SancionesCalculator.CorreccionInput(mayorValor: 5_000_000)
        let result = SancionesCalculator.calcCorreccion(input: input)
        #expect(result.sancionBruta == 500_000)
    }

    @Test func correccionPostEmplazamiento20Percent() {
        let input = SancionesCalculator.CorreccionInput(mayorValor: 5_000_000, esVoluntaria: false)
        let result = SancionesCalculator.calcCorreccion(input: input)
        #expect(result.sancionBruta == 1_000_000)
    }

    @Test func correccionFirstOffenseReduction() {
        let input = SancionesCalculator.CorreccionInput(mayorValor: 10_000_000, primeraInfraccion: true)
        let result = SancionesCalculator.calcCorreccion(input: input)
        #expect(result.sancionReducida < result.sancionBruta)
    }

    // Intereses de Mora

    @Test func interesMoraPositive() {
        let input = SancionesCalculator.InteresMoraInput(deuda: 10_000_000, diasMora: 90)
        let result = SancionesCalculator.calcInteresMora(input: input)
        #expect(result.interesTotal > 0)
        #expect(result.totalAPagar > result.deuda)
    }

    @Test func interesMoraZeroDaysNoInterest() {
        let input = SancionesCalculator.InteresMoraInput(deuda: 10_000_000, diasMora: 0)
        let result = SancionesCalculator.calcInteresMora(input: input)
        #expect(result.interesTotal == 0)
        #expect(result.totalAPagar == result.deuda)
    }

    @Test func interesMoraLargerDebtLargerInterest() {
        let small = SancionesCalculator.calcInteresMora(input: SancionesCalculator.InteresMoraInput(deuda: 1_000_000, diasMora: 30))
        let large = SancionesCalculator.calcInteresMora(input: SancionesCalculator.InteresMoraInput(deuda: 100_000_000, diasMora: 30))
        #expect(large.interesTotal > small.interesTotal)
    }
}
