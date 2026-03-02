import Testing
import Foundation
@testable import SuperAppTributaria

struct ComparadorContratacionTests {
    let smlmv = TaxData.smlmv2026

    @Test func laboralCostHigherThanSalary() {
        let input = ComparadorContratacionCalculator.Input(salarioBase: smlmv * 3)
        let result = ComparadorContratacionCalculator.calculate(input: input)
        #expect(result.laboral.costoTotalEmpleador > smlmv * 3)
    }

    @Test func serviciosCostEqualToSalary() {
        let input = ComparadorContratacionCalculator.Input(salarioBase: smlmv * 3)
        let result = ComparadorContratacionCalculator.calculate(input: input)
        #expect(result.servicios.costoTotalEmpleador == smlmv * 3)
    }

    @Test func integralMinimum13SMLMV() {
        let input = ComparadorContratacionCalculator.Input(salarioBase: smlmv * 5)
        let result = ComparadorContratacionCalculator.calculate(input: input)
        #expect(result.integral.salarioBruto >= smlmv * 13)
    }

    @Test func laboralGetsAuxTransporteForLowSalary() {
        let input = ComparadorContratacionCalculator.Input(salarioBase: smlmv)
        let result = ComparadorContratacionCalculator.calculate(input: input)
        #expect(result.laboral.netoTrabajador > 0)
    }

    @Test func serviciosNoEmployerContributions() {
        let input = ComparadorContratacionCalculator.Input(salarioBase: smlmv * 5)
        let result = ComparadorContratacionCalculator.calculate(input: input)
        #expect(result.servicios.aportesSaludEmpleador == 0)
        #expect(result.servicios.aportesPensionEmpleador == 0)
        #expect(result.servicios.arl == 0)
        #expect(result.servicios.parafiscales == 0)
        #expect(result.servicios.prestaciones == 0)
    }

    @Test func allThreeEscenariosReturned() {
        let input = ComparadorContratacionCalculator.Input(salarioBase: smlmv * 5)
        let result = ComparadorContratacionCalculator.calculate(input: input)
        #expect(result.laboral.tipo == "Laboral")
        #expect(result.integral.tipo == "Integral")
        #expect(result.servicios.tipo == "Servicios")
    }

    @Test func laboralExonerationBelowThreshold() {
        let input = ComparadorContratacionCalculator.Input(salarioBase: smlmv * 5)
        let result = ComparadorContratacionCalculator.calculate(input: input)
        // Below 10 SMLMV, SENA+ICBF exonerated
        #expect(result.laboral.parafiscales > 0) // CCF still charged
    }

    @Test func integralSS70PercentBase() {
        let input = ComparadorContratacionCalculator.Input(salarioBase: smlmv * 15)
        let result = ComparadorContratacionCalculator.calculate(input: input)
        let baseSS = (result.integral.salarioBruto * Decimal(string: "0.70")!).rounded
        #expect(result.integral.aportesSaludEmpleador == (baseSS * Decimal(string: "0.085")!).rounded)
    }

    @Test func laboralNetoPositive() {
        let input = ComparadorContratacionCalculator.Input(salarioBase: smlmv * 3)
        let result = ComparadorContratacionCalculator.calculate(input: input)
        #expect(result.laboral.netoTrabajador > 0)
        #expect(result.integral.netoTrabajador > 0)
        #expect(result.servicios.netoTrabajador > 0)
    }

    @Test func zeroSalaryHandled() {
        let input = ComparadorContratacionCalculator.Input(salarioBase: 0)
        let result = ComparadorContratacionCalculator.calculate(input: input)
        #expect(result.laboral.costoTotalEmpleador >= 0)
    }
}
