import Foundation

enum ComparadorContratacionCalculator {

    struct Input {
        var salarioBase: Decimal
        var uvt: Decimal = TaxData.uvt2026
        var smlmv: Decimal = TaxData.smlmv2026
        var auxTransporte: Decimal = TaxData.auxilioTransporte2026
    }

    struct Escenario: Sendable {
        let tipo: String
        let salarioBruto: Decimal
        let aportesSaludEmpleador: Decimal
        let aportesPensionEmpleador: Decimal
        let arl: Decimal
        let parafiscales: Decimal // SENA + ICBF + CCF
        let prestaciones: Decimal // Cesantias + Interes ces. + Prima + Vacaciones
        let costoTotalEmpleador: Decimal
        let deduccionesTrabajador: Decimal // Salud + Pension empleado
        let netoTrabajador: Decimal
    }

    struct Result {
        let laboral: Escenario
        let integral: Escenario
        let servicios: Escenario
    }

    static func calculate(input: Input) -> Result {
        let salario = max(input.salarioBase, 0)
        let smlmv = input.smlmv
        let auxTransporte = input.auxTransporte

        let laboral = calcularLaboral(salario: salario, smlmv: smlmv, auxTransporte: auxTransporte)
        let integral = calcularIntegral(salario: salario, smlmv: smlmv)
        let servicios = calcularServicios(salario: salario)

        return Result(laboral: laboral, integral: integral, servicios: servicios)
    }

    // MARK: - Contrato Laboral

    private static func calcularLaboral(salario: Decimal, smlmv: Decimal, auxTransporte: Decimal) -> Escenario {
        let aplicaAuxTransporte = salario <= (smlmv * 2)
        let baseSS = salario
        let baseParafiscales = salario
        let basePrestaciones = salario + (aplicaAuxTransporte ? auxTransporte : 0)

        // Empleador
        let saludEmpleador = (baseSS * Decimal(string: "0.085")!).rounded
        let pensionEmpleador = (baseSS * Decimal(string: "0.12")!).rounded
        let arl = (baseSS * Decimal(string: "0.00522")!).rounded

        // Parafiscales (aplican si salario > 10 SMLMV o no aplican exoneracion Ley 1607)
        // Para simplificar: SENA 2% + ICBF 3% + CCF 4%
        // Exoneracion Art. 114-1: empresas que aportan salud, exoneradas de SENA+ICBF si salario < 10 SMLMV
        let exonerado = salario < (smlmv * 10)
        let ccf = (baseParafiscales * Decimal(string: "0.04")!).rounded
        let senaIcbf: Decimal
        if exonerado {
            senaIcbf = 0
        } else {
            senaIcbf = (baseParafiscales * Decimal(string: "0.05")!).rounded
        }
        let parafiscales = ccf + senaIcbf

        // Prestaciones sociales
        let cesantias = (basePrestaciones * Decimal(string: "0.0833")!).rounded
        let interesesCesantias = (cesantias * Decimal(string: "0.12")!).rounded
        let prima = (basePrestaciones * Decimal(string: "0.0833")!).rounded
        let vacaciones = (salario * Decimal(string: "0.0417")!).rounded
        let prestaciones = cesantias + interesesCesantias + prima + vacaciones

        let costoTotal = salario + (aplicaAuxTransporte ? auxTransporte : 0) + saludEmpleador + pensionEmpleador + arl + parafiscales + prestaciones

        // Empleado
        let saludEmpleado = (baseSS * Decimal(string: "0.04")!).rounded
        let pensionEmpleado = (baseSS * Decimal(string: "0.04")!).rounded
        let deducciones = saludEmpleado + pensionEmpleado
        let neto = salario + (aplicaAuxTransporte ? auxTransporte : 0) - deducciones

        return Escenario(
            tipo: "Laboral",
            salarioBruto: salario,
            aportesSaludEmpleador: saludEmpleador,
            aportesPensionEmpleador: pensionEmpleador,
            arl: arl,
            parafiscales: parafiscales,
            prestaciones: prestaciones,
            costoTotalEmpleador: costoTotal,
            deduccionesTrabajador: deducciones,
            netoTrabajador: neto
        )
    }

    // MARK: - Salario Integral

    private static func calcularIntegral(salario: Decimal, smlmv: Decimal) -> Escenario {
        // Salario integral = minimo 13 SMLMV (10 salario + 3 factor prestacional)
        let minimoIntegral = smlmv * 13
        let salarioIntegral = max(salario, minimoIntegral)

        // Base SS = 70% del salario integral
        let baseSS = (salarioIntegral * Decimal(string: "0.70")!).rounded

        // Empleador
        let saludEmpleador = (baseSS * Decimal(string: "0.085")!).rounded
        let pensionEmpleador = (baseSS * Decimal(string: "0.12")!).rounded
        let arl = (baseSS * Decimal(string: "0.00522")!).rounded

        // Parafiscales sobre 70%
        let exonerado = salarioIntegral < (smlmv * 10) // rara vez para integral
        let ccf = (baseSS * Decimal(string: "0.04")!).rounded
        let senaIcbf: Decimal
        if exonerado {
            senaIcbf = 0
        } else {
            senaIcbf = (baseSS * Decimal(string: "0.05")!).rounded
        }
        let parafiscales = ccf + senaIcbf

        // Sin prestaciones (incluidas en el factor prestacional del 30%)
        let vacaciones = (baseSS * Decimal(string: "0.0417")!).rounded

        let costoTotal = salarioIntegral + saludEmpleador + pensionEmpleador + arl + parafiscales + vacaciones

        // Empleado
        let saludEmpleado = (baseSS * Decimal(string: "0.04")!).rounded
        let pensionEmpleado = (baseSS * Decimal(string: "0.04")!).rounded
        let deducciones = saludEmpleado + pensionEmpleado
        let neto = salarioIntegral - deducciones

        return Escenario(
            tipo: "Integral",
            salarioBruto: salarioIntegral,
            aportesSaludEmpleador: saludEmpleador,
            aportesPensionEmpleador: pensionEmpleador,
            arl: arl,
            parafiscales: parafiscales,
            prestaciones: vacaciones,
            costoTotalEmpleador: costoTotal,
            deduccionesTrabajador: deducciones,
            netoTrabajador: neto
        )
    }

    // MARK: - Prestacion de Servicios

    private static func calcularServicios(salario: Decimal) -> Escenario {
        // Honorarios = monto total pactado (equivalente al salario)
        let honorarios = salario

        // Contratista paga su propia SS sobre 40% del ingreso
        let baseSSContratista = (honorarios * Decimal(string: "0.40")!).rounded
        let saludContratista = (baseSSContratista * Decimal(string: "0.125")!).rounded
        let pensionContratista = (baseSSContratista * Decimal(string: "0.16")!).rounded

        // Contratante: retencion en la fuente (simplificado 11% para servicios)
        let retencionRate = Decimal(string: "0.11")!
        let retencion = (honorarios * retencionRate).rounded

        // Costo total para el contratante = honorarios (no paga SS ni parafiscales)
        let costoTotal = honorarios

        // Neto contratista = honorarios - SS propia - retencion
        let deduccionesContratista = saludContratista + pensionContratista
        let neto = honorarios - deduccionesContratista - retencion

        return Escenario(
            tipo: "Servicios",
            salarioBruto: honorarios,
            aportesSaludEmpleador: 0,
            aportesPensionEmpleador: 0,
            arl: 0,
            parafiscales: 0,
            prestaciones: 0,
            costoTotalEmpleador: costoTotal,
            deduccionesTrabajador: deduccionesContratista + retencion,
            netoTrabajador: neto
        )
    }
}
