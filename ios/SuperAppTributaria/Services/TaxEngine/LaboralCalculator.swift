import Foundation

/// Laboral Calculators — Nomina, Liquidacion, Horas Extras, Seguridad Social
enum LaboralCalculator {

    // MARK: - Nomina Completa

    struct NominaInput {
        var salarioBasico: Decimal
        var comisiones: Decimal = 0
        var claseARL: String = "I"
        var aplicaExoneracion: Bool = true
        var uvt: Decimal = TaxData.uvt2026
    }

    struct NominaResult {
        let ibc: Decimal
        let auxTransporte: Decimal
        let totalDevengado: Decimal
        // Employer costs
        let saludEmpleador: Decimal
        let pensionEmpleador: Decimal
        let arlEmpleador: Decimal
        let sena: Decimal
        let icbf: Decimal
        let ccf: Decimal
        // Benefits
        let cesantias: Decimal
        let intCesantias: Decimal
        let prima: Decimal
        let vacaciones: Decimal
        // Employee deductions
        let saludTrabajador: Decimal
        let pensionTrabajador: Decimal
        let fsp: Decimal
        // Totals
        let totalSSParafiscalesEmpleador: Decimal
        let totalPrestaciones: Decimal
        let costoTotalEmpleador: Decimal
        let netoTrabajador: Decimal
    }

    static func calcNomina(input: NominaInput) -> NominaResult {
        let ibc = input.salarioBasico + input.comisiones
        let smlmv = TaxData.smlmv2026
        let auxTransporte = input.salarioBasico <= 2 * smlmv ? TaxData.auxilioTransporte2026 : 0
        let totalDevengado = ibc + auxTransporte

        // Employer contributions
        let exoneraSalud = input.aplicaExoneracion && ibc < TaxData.exonerationThresholdSMLMV * smlmv
        let saludEmpleador = exoneraSalud ? 0 : (ibc * TaxData.employerRates.salud).rounded
        let pensionEmpleador = (ibc * TaxData.employerRates.pension).rounded
        let arlRate = TaxData.arlClasses.first { $0.clase == input.claseARL }?.rate ?? TaxData.employerRates.arl
        let arlEmpleador = (ibc * arlRate).rounded

        // Parafiscales
        let exoneraParafiscales = input.aplicaExoneracion && ibc < TaxData.exonerationThresholdSMLMV * smlmv
        let sena = exoneraParafiscales ? 0 : (ibc * TaxData.employerRates.sena).rounded
        let icbf = exoneraParafiscales ? 0 : (ibc * TaxData.employerRates.icbf).rounded
        let ccf = (ibc * TaxData.employerRates.ccf).rounded

        // Benefits
        let basePrestaciones = ibc + auxTransporte
        let cesantias = (basePrestaciones * TaxData.employerRates.cesantias).rounded
        let intCesantias = (cesantias * TaxData.interesCesantiasRate).rounded
        let prima = (basePrestaciones * TaxData.employerRates.prima).rounded
        let vacaciones = (ibc * TaxData.employerRates.vacaciones).rounded

        // Employee deductions
        let saludTrabajador = (ibc * TaxData.employeeRates.salud).rounded
        let pensionTrabajador = (ibc * TaxData.employeeRates.pension).rounded

        // FSP
        var fsp: Decimal = 0
        let smVal = ibc / smlmv
        for bracket in TaxData.fspBrackets {
            if smVal >= bracket.fromSMLMV && smVal < bracket.toSMLMV {
                fsp = (ibc * bracket.rate).rounded
                break
            }
        }

        // Totals
        let totalSSParafiscales = saludEmpleador + pensionEmpleador + arlEmpleador + sena + icbf + ccf
        let totalPrestaciones = cesantias + intCesantias + prima + vacaciones
        let costoTotal = ibc + auxTransporte + totalSSParafiscales + totalPrestaciones
        let neto = totalDevengado - saludTrabajador - pensionTrabajador - fsp

        return NominaResult(
            ibc: ibc, auxTransporte: auxTransporte, totalDevengado: totalDevengado,
            saludEmpleador: saludEmpleador, pensionEmpleador: pensionEmpleador,
            arlEmpleador: arlEmpleador, sena: sena, icbf: icbf, ccf: ccf,
            cesantias: cesantias, intCesantias: intCesantias,
            prima: prima, vacaciones: vacaciones,
            saludTrabajador: saludTrabajador, pensionTrabajador: pensionTrabajador, fsp: fsp,
            totalSSParafiscalesEmpleador: totalSSParafiscales,
            totalPrestaciones: totalPrestaciones,
            costoTotalEmpleador: costoTotal,
            netoTrabajador: neto
        )
    }

    // MARK: - Liquidacion Laboral

    enum TipoContrato: String, CaseIterable, Identifiable {
        case indefinido = "Indefinido"
        case fijo = "Fijo"
        case obraLabor = "Obra o labor"
        var id: String { rawValue }
    }

    enum MotivoTerminacion: String, CaseIterable, Identifiable {
        case renuncia = "Renuncia voluntaria"
        case despidoSinJusta = "Despido sin justa causa"
        case despidoConJusta = "Despido con justa causa"
        case mutuoAcuerdo = "Mutuo acuerdo"
        var id: String { rawValue }
    }

    struct LiquidacionInput {
        var salario: Decimal
        var fechaInicio: Date
        var fechaTerminacion: Date
        var tipoContrato: TipoContrato = .indefinido
        var motivoTerminacion: MotivoTerminacion = .renuncia
        var fechaFinFijo: Date?
    }

    struct LiquidacionResult {
        let diasTrabajados: Int
        let cesantias: Decimal
        let intCesantias: Decimal
        let prima: Decimal
        let vacaciones: Decimal
        let indemnizacion: Decimal
        let total: Decimal
    }

    static func calcLiquidacion(input: LiquidacionInput) -> LiquidacionResult {
        let calendar = Calendar.current
        let dias = max(1, calendar.dateComponents([.day], from: input.fechaInicio, to: input.fechaTerminacion).day ?? 1)
        let smlmv = TaxData.smlmv2026
        let auxilio = input.salario <= 2 * smlmv ? TaxData.auxilioTransporte2026 : 0

        let baseCesantiasPrima = input.salario + auxilio
        let baseVacaciones = input.salario

        // Cesantias
        let cesantias = (baseCesantiasPrima * Decimal(dias) / 360).rounded

        // Intereses cesantias (12% annual pro-rata)
        let intCesantias = (cesantias * Decimal(dias) * TaxData.interesCesantiasRate / 360).rounded

        // Prima (semestral, pro-rata)
        let diasSemestre = min(dias, 180)
        let prima = (baseCesantiasPrima * Decimal(diasSemestre) / 360).rounded

        // Vacaciones
        let vacaciones = (baseVacaciones * Decimal(dias) / 720).rounded

        // Indemnizacion
        var indemnizacion: Decimal = 0
        if input.motivoTerminacion == .despidoSinJusta {
            let anosServicio = Decimal(dias) / 360

            switch input.tipoContrato {
            case .indefinido:
                if input.salario < TaxData.indemnizacionUmbralSMLMV * smlmv {
                    indemnizacion = (input.salario / 30) * Decimal(TaxData.indemnizacionBajo.primerAno)
                    if anosServicio > 1 {
                        let adicional = (anosServicio - 1).rounded(to: 0)
                        indemnizacion += (input.salario / 30) * Decimal(TaxData.indemnizacionBajo.adicionalPorAno) * max(0, adicional)
                    }
                } else {
                    indemnizacion = (input.salario / 30) * Decimal(TaxData.indemnizacionAlto.primerAno)
                    if anosServicio > 1 {
                        let adicional = (anosServicio - 1).rounded(to: 0)
                        indemnizacion += (input.salario / 30) * Decimal(TaxData.indemnizacionAlto.adicionalPorAno) * max(0, adicional)
                    }
                }

            case .fijo:
                if let fechaFin = input.fechaFinFijo {
                    let diasRestantes = max(0, calendar.dateComponents([.day], from: input.fechaTerminacion, to: fechaFin).day ?? 0)
                    indemnizacion = max((input.salario / 30) * Decimal(diasRestantes), (input.salario / 30) * Decimal(TaxData.indemnizacionFijoMinDias))
                } else {
                    indemnizacion = (input.salario / 30) * Decimal(TaxData.indemnizacionFijoMinDias)
                }

            case .obraLabor:
                indemnizacion = (input.salario / 30) * Decimal(TaxData.indemnizacionFijoMinDias)
            }

            indemnizacion = indemnizacion.rounded
        }

        let total = cesantias + intCesantias + prima + vacaciones + indemnizacion

        return LiquidacionResult(
            diasTrabajados: dias,
            cesantias: cesantias,
            intCesantias: intCesantias,
            prima: prima,
            vacaciones: vacaciones,
            indemnizacion: indemnizacion,
            total: total
        )
    }

    // MARK: - Horas Extras

    enum Periodo: String, CaseIterable, Identifiable {
        case h2_2025 = "Jul 2025 - Jun 2026"
        case h1_2026 = "Jul 2026 - Jun 2027"
        case h2_2027 = "Jul 2027 en adelante"

        var id: String { rawValue }

        var divisor: Int {
            switch self {
            case .h2_2025: return 220
            case .h1_2026: return 210
            case .h2_2027: return 210
            }
        }

        var domRecargo: Decimal {
            switch self {
            case .h2_2025: return Decimal(string: "0.80")!
            case .h1_2026: return Decimal(string: "0.90")!
            case .h2_2027: return 1
            }
        }
    }

    struct HorasExtrasInput {
        var salario: Decimal
        var periodo: Periodo = .h2_2025
        var horasExtraDiurna: Decimal = 0
        var horasExtraNocturna: Decimal = 0
        var horasRecargoNocturno: Decimal = 0
        var horasDomDiurno: Decimal = 0
        var horasDomNocturno: Decimal = 0
        var horasExtraDiurnaDom: Decimal = 0
        var horasExtraNocturnaDom: Decimal = 0
    }

    struct HorasExtrasResult {
        let valorHoraOrdinaria: Decimal
        let extraDiurna: Decimal
        let extraNocturna: Decimal
        let recargoNocturno: Decimal
        let domDiurno: Decimal
        let domNocturno: Decimal
        let extraDiurnaDom: Decimal
        let extraNocturnaDom: Decimal
        let totalExtras: Decimal
    }

    static func calcHorasExtras(input: HorasExtrasInput) -> HorasExtrasResult {
        let valorHora = input.salario / Decimal(input.periodo.divisor)
        let recargos = TaxData.recargos
        let domRec = input.periodo.domRecargo

        let extraDiurna     = (input.horasExtraDiurna * valorHora * (1 + recargos.extraDiurna)).rounded
        let extraNocturna   = (input.horasExtraNocturna * valorHora * (1 + recargos.extraNocturna)).rounded
        let recargoNocturno = (input.horasRecargoNocturno * valorHora * recargos.recargoNocturno).rounded
        let domDiurno       = (input.horasDomDiurno * valorHora * (1 + domRec)).rounded
        let domNocturno     = (input.horasDomNocturno * valorHora * (1 + domRec + recargos.recargoNocturno)).rounded
        let extraDiurnaDom  = (input.horasExtraDiurnaDom * valorHora * (1 + domRec + recargos.extraDiurna)).rounded
        let extraNocturnaDom = (input.horasExtraNocturnaDom * valorHora * (1 + domRec + recargos.extraNocturna)).rounded

        let total = extraDiurna + extraNocturna + recargoNocturno + domDiurno + domNocturno + extraDiurnaDom + extraNocturnaDom

        return HorasExtrasResult(
            valorHoraOrdinaria: valorHora.rounded,
            extraDiurna: extraDiurna, extraNocturna: extraNocturna,
            recargoNocturno: recargoNocturno,
            domDiurno: domDiurno, domNocturno: domNocturno,
            extraDiurnaDom: extraDiurnaDom, extraNocturnaDom: extraNocturnaDom,
            totalExtras: total
        )
    }

    // MARK: - Seguridad Social Independiente

    struct SSIndependienteInput {
        var ingresosNetos: Decimal
    }

    struct SSIndependienteResult {
        let ibc: Decimal
        let salud: Decimal
        let pension: Decimal
        let arl: Decimal
        let total: Decimal
    }

    static func calcSSIndependiente(input: SSIndependienteInput) -> SSIndependienteResult {
        let rates = TaxData.independentRates
        let ibc = max(input.ingresosNetos * rates.baseSS, TaxData.smlmv2026)
        let ibcCapped = min(ibc, TaxData.ibcMaxSMLMV * TaxData.smlmv2026)

        let salud = (ibcCapped * rates.salud).rounded
        let pension = (ibcCapped * rates.pension).rounded
        let arl = (ibcCapped * rates.arl).rounded
        let total = salud + pension + arl

        return SSIndependienteResult(ibc: ibcCapped, salud: salud, pension: pension, arl: arl, total: total)
    }

    // MARK: - Licencia Maternidad/Paternidad

    struct LicenciaInput {
        var salario: Decimal
        var esMaternidad: Bool = true
    }

    struct LicenciaResult {
        let semanas: Int
        let dias: Int
        let valorTotal: Decimal
        let valorDiario: Decimal
    }

    static func calcLicencia(input: LicenciaInput) -> LicenciaResult {
        let semanas = input.esMaternidad ? TaxData.licenciaMaternidadSemanas : TaxData.licenciaPaternidadSemanas
        let dias = semanas * 7
        let valorDiario = (input.salario / 30).rounded
        let valorTotal = (valorDiario * Decimal(dias)).rounded

        return LicenciaResult(semanas: semanas, dias: dias, valorTotal: valorTotal, valorDiario: valorDiario)
    }
}
