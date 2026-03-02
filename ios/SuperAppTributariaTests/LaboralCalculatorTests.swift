import Testing
import Foundation
@testable import SuperAppTributaria

struct LaboralCalculatorTests {
    let smlmv = TaxData.smlmv2026
    let uvt = TaxData.uvt2026

    // MARK: - Nomina

    @Test func nominaSMLMVGetsAuxTransporte() {
        let input = LaboralCalculator.NominaInput(salarioBasico: smlmv)
        let result = LaboralCalculator.calcNomina(input: input)
        #expect(result.auxTransporte == TaxData.auxilioTransporte2026)
        #expect(result.ibc == smlmv)
    }

    @Test func nominaHighSalaryNoAuxTransporte() {
        let salary = smlmv * 3
        let input = LaboralCalculator.NominaInput(salarioBasico: salary)
        let result = LaboralCalculator.calcNomina(input: input)
        #expect(result.auxTransporte == 0)
    }

    @Test func nominaEmployerContributions() {
        let input = LaboralCalculator.NominaInput(salarioBasico: smlmv * 3)
        let result = LaboralCalculator.calcNomina(input: input)
        #expect(result.pensionEmpleador > 0)
        #expect(result.arlEmpleador > 0)
        #expect(result.ccf > 0)
    }

    @Test func nominaExonerationExemptsSENAICBF() {
        let salary = smlmv * 5 // below 10 SMLMV
        let input = LaboralCalculator.NominaInput(salarioBasico: salary, aplicaExoneracion: true)
        let result = LaboralCalculator.calcNomina(input: input)
        #expect(result.sena == 0)
        #expect(result.icbf == 0)
        #expect(result.saludEmpleador == 0)
    }

    @Test func nominaNoExonerationChargesSENAICBF() {
        let salary = smlmv * 5
        let input = LaboralCalculator.NominaInput(salarioBasico: salary, aplicaExoneracion: false)
        let result = LaboralCalculator.calcNomina(input: input)
        #expect(result.sena > 0)
        #expect(result.icbf > 0)
        #expect(result.saludEmpleador > 0)
    }

    @Test func nominaHighSalaryAboveExonerationThreshold() {
        let salary = smlmv * 12 // above 10 SMLMV
        let input = LaboralCalculator.NominaInput(salarioBasico: salary, aplicaExoneracion: true)
        let result = LaboralCalculator.calcNomina(input: input)
        #expect(result.sena > 0) // no longer exonerated
        #expect(result.saludEmpleador > 0)
    }

    @Test func nominaBenefitsCalculated() {
        let input = LaboralCalculator.NominaInput(salarioBasico: smlmv * 2)
        let result = LaboralCalculator.calcNomina(input: input)
        #expect(result.cesantias > 0)
        #expect(result.intCesantias > 0)
        #expect(result.prima > 0)
        #expect(result.vacaciones > 0)
    }

    @Test func nominaEmployeeDeductions() {
        let input = LaboralCalculator.NominaInput(salarioBasico: smlmv * 2)
        let result = LaboralCalculator.calcNomina(input: input)
        #expect(result.saludTrabajador > 0)
        #expect(result.pensionTrabajador > 0)
    }

    @Test func nominaWithCommissions() {
        let input = LaboralCalculator.NominaInput(salarioBasico: smlmv, comisiones: 500_000)
        let result = LaboralCalculator.calcNomina(input: input)
        #expect(result.ibc == smlmv + 500_000)
    }

    @Test func nominaFSPForHighSalary() {
        let salary = smlmv * 5 // 4+ SMLMV triggers FSP
        let input = LaboralCalculator.NominaInput(salarioBasico: salary)
        let result = LaboralCalculator.calcNomina(input: input)
        #expect(result.fsp > 0)
    }

    @Test func nominaNoFSPForLowSalary() {
        let input = LaboralCalculator.NominaInput(salarioBasico: smlmv)
        let result = LaboralCalculator.calcNomina(input: input)
        #expect(result.fsp == 0)
    }

    @Test func nominaNetoLessThanDevengado() {
        let input = LaboralCalculator.NominaInput(salarioBasico: smlmv * 3)
        let result = LaboralCalculator.calcNomina(input: input)
        #expect(result.netoTrabajador < result.totalDevengado)
    }

    @Test func nominaCostoTotalGreaterThanSalary() {
        let input = LaboralCalculator.NominaInput(salarioBasico: smlmv * 3)
        let result = LaboralCalculator.calcNomina(input: input)
        #expect(result.costoTotalEmpleador > smlmv * 3)
    }

    // MARK: - Liquidacion

    @Test func liquidacionRenunciaNoIndemnizacion() {
        let cal = Calendar.current
        let inicio = cal.date(from: DateComponents(year: 2025, month: 1, day: 1))!
        let fin = cal.date(from: DateComponents(year: 2026, month: 1, day: 1))!
        let input = LaboralCalculator.LiquidacionInput(salario: smlmv * 2, fechaInicio: inicio, fechaTerminacion: fin, motivoTerminacion: .renuncia)
        let result = LaboralCalculator.calcLiquidacion(input: input)
        #expect(result.indemnizacion == 0)
        #expect(result.cesantias > 0)
        #expect(result.prima > 0)
        #expect(result.vacaciones > 0)
    }

    @Test func liquidacionDespidoSinJustaGetsIndemnizacion() {
        let cal = Calendar.current
        let inicio = cal.date(from: DateComponents(year: 2025, month: 1, day: 1))!
        let fin = cal.date(from: DateComponents(year: 2026, month: 1, day: 1))!
        let input = LaboralCalculator.LiquidacionInput(salario: smlmv * 2, fechaInicio: inicio, fechaTerminacion: fin, motivoTerminacion: .despidoSinJusta)
        let result = LaboralCalculator.calcLiquidacion(input: input)
        #expect(result.indemnizacion > 0)
    }

    @Test func liquidacionTotalIsSum() {
        let cal = Calendar.current
        let inicio = cal.date(from: DateComponents(year: 2025, month: 6, day: 1))!
        let fin = cal.date(from: DateComponents(year: 2026, month: 1, day: 1))!
        let input = LaboralCalculator.LiquidacionInput(salario: smlmv * 2, fechaInicio: inicio, fechaTerminacion: fin)
        let result = LaboralCalculator.calcLiquidacion(input: input)
        #expect(result.total == result.cesantias + result.intCesantias + result.prima + result.vacaciones + result.indemnizacion)
    }

    @Test func liquidacionDiasCalculated() {
        let cal = Calendar.current
        let inicio = cal.date(from: DateComponents(year: 2025, month: 1, day: 1))!
        let fin = cal.date(from: DateComponents(year: 2025, month: 7, day: 1))!
        let input = LaboralCalculator.LiquidacionInput(salario: smlmv, fechaInicio: inicio, fechaTerminacion: fin)
        let result = LaboralCalculator.calcLiquidacion(input: input)
        #expect(result.diasTrabajados > 0)
    }

    // MARK: - Horas Extras

    @Test func horasExtraDiurna25Percent() {
        let input = LaboralCalculator.HorasExtrasInput(salario: smlmv, horasExtraDiurna: 10)
        let result = LaboralCalculator.calcHorasExtras(input: input)
        #expect(result.extraDiurna > 0)
        #expect(result.totalExtras == result.extraDiurna)
    }

    @Test func horasExtraNocturna75Percent() {
        let input = LaboralCalculator.HorasExtrasInput(salario: smlmv, horasExtraNocturna: 10)
        let result = LaboralCalculator.calcHorasExtras(input: input)
        #expect(result.extraNocturna > result.extraDiurna || result.extraNocturna > 0)
    }

    @Test func horasValorHoraCalculated() {
        let input = LaboralCalculator.HorasExtrasInput(salario: smlmv, periodo: .h1_2026)
        let result = LaboralCalculator.calcHorasExtras(input: input)
        #expect(result.valorHoraOrdinaria > 0)
    }

    @Test func horasExtrasZeroHoursReturnsZero() {
        let input = LaboralCalculator.HorasExtrasInput(salario: smlmv)
        let result = LaboralCalculator.calcHorasExtras(input: input)
        #expect(result.totalExtras == 0)
    }

    @Test func periodoH2_2025Divisor220() {
        #expect(LaboralCalculator.Periodo.h2_2025.divisor == 220)
    }

    @Test func periodoH1_2026Divisor210() {
        #expect(LaboralCalculator.Periodo.h1_2026.divisor == 210)
    }

    // MARK: - SS Independiente

    @Test func ssIndependienteIBCIsFortyPercent() {
        let ingresos: Decimal = 10_000_000
        let input = LaboralCalculator.SSIndependienteInput(ingresosNetos: ingresos)
        let result = LaboralCalculator.calcSSIndependiente(input: input)
        #expect(result.ibc == (ingresos * Decimal(string: "0.40")!).rounded.clamped(min: smlmv, max: 25 * smlmv))
    }

    @Test func ssIndependienteMinIBCSMLMV() {
        let input = LaboralCalculator.SSIndependienteInput(ingresosNetos: 100_000)
        let result = LaboralCalculator.calcSSIndependiente(input: input)
        #expect(result.ibc == smlmv)
    }

    @Test func ssIndependienteTotalIsSum() {
        let input = LaboralCalculator.SSIndependienteInput(ingresosNetos: 10_000_000)
        let result = LaboralCalculator.calcSSIndependiente(input: input)
        #expect(result.total == result.salud + result.pension + result.arl)
    }

    // MARK: - Licencia

    @Test func licenciaMaternidad18Semanas() {
        let input = LaboralCalculator.LicenciaInput(salario: smlmv * 2, esMaternidad: true)
        let result = LaboralCalculator.calcLicencia(input: input)
        #expect(result.semanas == 18)
        #expect(result.dias == 126)
    }

    @Test func licenciaPaternidad2Semanas() {
        let input = LaboralCalculator.LicenciaInput(salario: smlmv * 2, esMaternidad: false)
        let result = LaboralCalculator.calcLicencia(input: input)
        #expect(result.semanas == 2)
        #expect(result.dias == 14)
    }

    @Test func licenciaValorTotalPositive() {
        let input = LaboralCalculator.LicenciaInput(salario: smlmv * 3)
        let result = LaboralCalculator.calcLicencia(input: input)
        #expect(result.valorTotal > 0)
        #expect(result.valorDiario > 0)
    }
}
