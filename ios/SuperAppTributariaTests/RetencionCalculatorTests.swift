import Testing
import Foundation
@testable import SuperAppTributaria

struct RetencionCalculatorTests {
    let uvt = TaxData.uvt2026

    // Compras — 2.5% over 10 UVT
    @Test func comprasAboveThreshold() {
        let input = RetencionCalculator.Input(conceptoId: "compras", monto: 1_000_000)
        let result = RetencionCalculator.calculate(input: input)
        #expect(result.retencion > 0)
        #expect(result.tarifaAplicada == Decimal(string: "0.025")!)
        #expect(result.isProgressive == false)
    }

    // Compras below threshold — no retention
    @Test func comprasBelowThresholdNoRetention() {
        let input = RetencionCalculator.Input(conceptoId: "compras", monto: 100_000)
        let result = RetencionCalculator.calculate(input: input)
        #expect(result.retencion == 0)
    }

    // Servicios declarante — 4%
    @Test func serviciosDeclarante() {
        let input = RetencionCalculator.Input(conceptoId: "servicios-d", monto: 5_000_000)
        let result = RetencionCalculator.calculate(input: input)
        #expect(result.retencion == 200_000)
        #expect(result.tarifaAplicada == Decimal(string: "0.04")!)
    }

    // Servicios no declarante — 6%
    @Test func serviciosNoDeclarante() {
        let input = RetencionCalculator.Input(conceptoId: "servicios-nd", monto: 5_000_000)
        let result = RetencionCalculator.calculate(input: input)
        #expect(result.retencion == 300_000)
        #expect(result.tarifaAplicada == Decimal(string: "0.06")!)
    }

    // Honorarios declarante — 10%
    @Test func honorariosDeclarante() {
        let input = RetencionCalculator.Input(conceptoId: "honorarios-d", monto: 10_000_000)
        let result = RetencionCalculator.calculate(input: input)
        #expect(result.retencion == 1_000_000)
    }

    // Honorarios no declarante — 11%
    @Test func honorariosNoDeclarante() {
        let input = RetencionCalculator.Input(conceptoId: "honorarios-nd", monto: 10_000_000)
        let result = RetencionCalculator.calculate(input: input)
        #expect(result.retencion == 1_100_000)
    }

    // Arrendamiento — 3.5% over 10 UVT
    @Test func arrendamiento() {
        let input = RetencionCalculator.Input(conceptoId: "arrendamiento", monto: 5_000_000)
        let result = RetencionCalculator.calculate(input: input)
        #expect(result.retencion == 175_000)
    }

    // Loterias — 20% over 48 UVT
    @Test func loterias() {
        let monto = 50 * uvt // above 48 UVT
        let input = RetencionCalculator.Input(conceptoId: "loterias", monto: monto)
        let result = RetencionCalculator.calculate(input: input)
        #expect(result.retencion > 0)
        #expect(result.tarifaAplicada == Decimal(string: "0.20")!)
    }

    // Activos fijos — 1%
    @Test func activosFijos() {
        let input = RetencionCalculator.Input(conceptoId: "activos-fijos", monto: 100_000_000)
        let result = RetencionCalculator.calculate(input: input)
        #expect(result.retencion == 1_000_000)
    }

    // Salarios — progressive (below 95 UVT, no retention)
    @Test func salaryBelowThresholdNoRetention() {
        let input = RetencionCalculator.Input(conceptoId: "salarios", monto: 50 * uvt)
        let result = RetencionCalculator.calculate(input: input)
        #expect(result.retencion == 0)
        #expect(result.isProgressive == true)
    }

    // Salarios — progressive (above 95 UVT)
    @Test func salaryAboveThresholdHasRetention() {
        let input = RetencionCalculator.Input(conceptoId: "salarios", monto: 200 * uvt)
        let result = RetencionCalculator.calculate(input: input)
        #expect(result.retencion > 0)
        #expect(result.isProgressive == true)
    }

    // Salarios with SS deductions
    @Test func salaryWithSSDeductions() {
        let monto = 200 * uvt
        let noSS = RetencionCalculator.calculate(input: RetencionCalculator.Input(conceptoId: "salarios", monto: monto))
        let withSS = RetencionCalculator.calculate(input: RetencionCalculator.Input(conceptoId: "salarios", monto: monto, deduccionesSS: 20 * uvt))
        #expect(withSS.retencion < noSS.retencion)
    }

    // Unknown concept returns zero
    @Test func unknownConceptReturnsZero() {
        let input = RetencionCalculator.Input(conceptoId: "inexistente", monto: 10_000_000)
        let result = RetencionCalculator.calculate(input: input)
        #expect(result.retencion == 0)
        #expect(result.concepto == "Desconocido")
    }

    // Concepto name preserved
    @Test func conceptoNamePreserved() {
        let input = RetencionCalculator.Input(conceptoId: "compras", monto: 1_000_000)
        let result = RetencionCalculator.calculate(input: input)
        #expect(result.concepto == "Compras generales")
    }

    // Articulo reference preserved
    @Test func articuloPreserved() {
        let input = RetencionCalculator.Input(conceptoId: "salarios", monto: 200 * uvt)
        let result = RetencionCalculator.calculate(input: input)
        #expect(result.articulo == "383")
    }

    // Zero monto
    @Test func zeroMontoReturnsZeroRetention() {
        let input = RetencionCalculator.Input(conceptoId: "compras", monto: 0)
        let result = RetencionCalculator.calculate(input: input)
        #expect(result.retencion == 0)
    }

    // Large salary has higher effective rate
    @Test func largeSalaryHigherEffectiveRate() {
        let low = RetencionCalculator.calculate(input: RetencionCalculator.Input(conceptoId: "salarios", monto: 200 * uvt))
        let high = RetencionCalculator.calculate(input: RetencionCalculator.Input(conceptoId: "salarios", monto: 1_000 * uvt))
        #expect(high.tarifaAplicada > low.tarifaAplicada)
    }

    // Base gravable for salary is depurated
    @Test func salaryBaseGravableIsDepurated() {
        let monto = 200 * uvt
        let ss: Decimal = 30 * uvt
        let input = RetencionCalculator.Input(conceptoId: "salarios", monto: monto, deduccionesSS: ss)
        let result = RetencionCalculator.calculate(input: input)
        #expect(result.baseGravable == monto - ss)
    }

    // Honorarios have zero base UVT threshold (always applies)
    @Test func honorariosNoBaseThreshold() {
        let input = RetencionCalculator.Input(conceptoId: "honorarios-d", monto: 100)
        let result = RetencionCalculator.calculate(input: input)
        #expect(result.retencion > 0)
    }

    // Monto preserved in result
    @Test func montoPreservedInResult() {
        let monto: Decimal = 7_500_000
        let input = RetencionCalculator.Input(conceptoId: "compras", monto: monto)
        let result = RetencionCalculator.calculate(input: input)
        #expect(result.monto == monto)
    }
}
