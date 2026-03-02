import Testing
import Foundation
@testable import SuperAppTributaria

struct SIMPLECalculatorTests {
    let uvt = TaxData.uvt2026

    @Test func group1LowIncome() {
        let input = SIMPLECalculator.Input(ingresosBrutos: 3_000 * uvt, grupoId: 1)
        let result = SIMPLECalculator.calculate(input: input)
        #expect(result.tarifaSIMPLE == Decimal(string: "0.017")!)
        #expect(result.impuestoSIMPLE > 0)
    }

    @Test func group3HighIncome() {
        let input = SIMPLECalculator.Input(ingresosBrutos: 50_000 * uvt, grupoId: 3)
        let result = SIMPLECalculator.calculate(input: input)
        #expect(result.tarifaSIMPLE == Decimal(string: "0.145")!)
    }

    @Test func comparisonWithOrdinaryRegime() {
        let input = SIMPLECalculator.Input(ingresosBrutos: 10_000 * uvt, grupoId: 1, margenUtilidad: 30)
        let result = SIMPLECalculator.calculate(input: input)
        #expect(result.impuestoOrdinario > 0)
        #expect(result.ahorro != 0)
    }

    @Test func convieneSIMPLEFlag() {
        let input = SIMPLECalculator.Input(ingresosBrutos: 5_000 * uvt, grupoId: 1, margenUtilidad: 30)
        let result = SIMPLECalculator.calculate(input: input)
        #expect(result.convieneSIMPLE == (result.ahorro > 0))
    }

    @Test func grupoLabelReturned() {
        let input = SIMPLECalculator.Input(ingresosBrutos: 5_000 * uvt, grupoId: 1)
        let result = SIMPLECalculator.calculate(input: input)
        #expect(result.grupo.contains("Tiendas"))
    }

    @Test func allFiveGroupsWork() {
        for g in 1...5 {
            let input = SIMPLECalculator.Input(ingresosBrutos: 5_000 * uvt, grupoId: g)
            let result = SIMPLECalculator.calculate(input: input)
            #expect(result.impuestoSIMPLE > 0)
        }
    }

    @Test func invalidGroupClampedToValid() {
        let input = SIMPLECalculator.Input(ingresosBrutos: 5_000 * uvt, grupoId: 99)
        let result = SIMPLECalculator.calculate(input: input)
        #expect(result.impuestoSIMPLE > 0) // Uses last valid group index
    }

    @Test func usaCostosReales() {
        let input = SIMPLECalculator.Input(
            ingresosBrutos: 10_000 * uvt,
            grupoId: 2,
            costosDeducciones: 6_000 * uvt,
            usaCostosReales: true
        )
        let result = SIMPLECalculator.calculate(input: input)
        #expect(result.utilidadEstimada == 4_000 * uvt)
    }

    @Test func ingresosUVTCalculated() {
        let input = SIMPLECalculator.Input(ingresosBrutos: 10_000 * uvt, grupoId: 1)
        let result = SIMPLECalculator.calculate(input: input)
        #expect(result.ingresosUVT == 10_000)
    }

    @Test func zeroIncomeReturnsZeroTax() {
        let input = SIMPLECalculator.Input(ingresosBrutos: 0, grupoId: 1)
        let result = SIMPLECalculator.calculate(input: input)
        #expect(result.impuestoSIMPLE == 0)
    }

    @Test func aboveAllBracketsUsesLast() {
        let input = SIMPLECalculator.Input(ingresosBrutos: 99_000 * uvt, grupoId: 1)
        let result = SIMPLECalculator.calculate(input: input)
        #expect(result.tarifaSIMPLE == Decimal(string: "0.067")!)
    }

    @Test func ingresosBrutosPreserved() {
        let amount: Decimal = 500_000_000
        let input = SIMPLECalculator.Input(ingresosBrutos: amount, grupoId: 2)
        let result = SIMPLECalculator.calculate(input: input)
        #expect(result.ingresosBrutos == amount)
    }
}
