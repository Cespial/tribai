import Foundation

// MARK: - UVT Converter

enum UVTConverter {

    struct Result {
        let uvt: Decimal
        let cop: Decimal
        let year: Int
        let uvtRate: Decimal
    }

    static func uvtToCOP(uvt: Decimal, year: Int = TaxData.currentUVTYear) -> Result {
        let rate = TaxData.uvtValues[year] ?? TaxData.uvt2026
        return Result(uvt: uvt, cop: (uvt * rate).rounded, year: year, uvtRate: rate)
    }

    static func copToUVT(cop: Decimal, year: Int = TaxData.currentUVTYear) -> Result {
        let rate = TaxData.uvtValues[year] ?? TaxData.uvt2026
        let uvt = rate > 0 ? (cop / rate).rounded(to: 2) : 0
        return Result(uvt: uvt, cop: cop, year: year, uvtRate: rate)
    }
}

// MARK: - Debo Declarar Renta

enum DeboDeclarar {

    struct Input {
        var patrimonioBruto: Decimal = 0
        var ingresosBrutos: Decimal = 0
        var consumosTarjeta: Decimal = 0
        var comprasTotales: Decimal = 0
        var consignaciones: Decimal = 0
    }

    struct Result {
        let debeDeclarar: Bool
        let criterios: [CriterioResult]
    }

    struct CriterioResult {
        let nombre: String
        let valor: Decimal
        let tope: Decimal
        let topeCOP: Decimal
        let supera: Bool
    }

    static func verificar(input: Input) -> Result {
        let topes = TaxData.topesDeclarar
        let uvtAG = topes.uvtAnoGravable

        let criterios: [CriterioResult] = [
            CriterioResult(
                nombre: "Patrimonio bruto",
                valor: input.patrimonioBruto,
                tope: topes.patrimonioBrutoUVT,
                topeCOP: (topes.patrimonioBrutoUVT * uvtAG).rounded,
                supera: input.patrimonioBruto > topes.patrimonioBrutoUVT * uvtAG
            ),
            CriterioResult(
                nombre: "Ingresos brutos",
                valor: input.ingresosBrutos,
                tope: topes.ingresosBrutosUVT,
                topeCOP: (topes.ingresosBrutosUVT * uvtAG).rounded,
                supera: input.ingresosBrutos > topes.ingresosBrutosUVT * uvtAG
            ),
            CriterioResult(
                nombre: "Consumos tarjeta credito",
                valor: input.consumosTarjeta,
                tope: topes.consumosTarjetaUVT,
                topeCOP: (topes.consumosTarjetaUVT * uvtAG).rounded,
                supera: input.consumosTarjeta > topes.consumosTarjetaUVT * uvtAG
            ),
            CriterioResult(
                nombre: "Compras totales",
                valor: input.comprasTotales,
                tope: topes.comprasTotalesUVT,
                topeCOP: (topes.comprasTotalesUVT * uvtAG).rounded,
                supera: input.comprasTotales > topes.comprasTotalesUVT * uvtAG
            ),
            CriterioResult(
                nombre: "Consignaciones bancarias",
                valor: input.consignaciones,
                tope: topes.consignacionesUVT,
                topeCOP: (topes.consignacionesUVT * uvtAG).rounded,
                supera: input.consignaciones > topes.consignacionesUVT * uvtAG
            ),
        ]

        let debeDeclarar = criterios.contains { $0.supera }
        return Result(debeDeclarar: debeDeclarar, criterios: criterios)
    }
}

// MARK: - Dividendos PN

enum DividendosCalculator {

    struct Input {
        var dividendos: Decimal
        var gravadosSocietario: Bool = true   // Gravados a nivel societario
        var uvt: Decimal = TaxData.uvt2026
    }

    struct Result {
        let dividendos: Decimal
        let impuesto: Decimal
        let tarifaEfectiva: Decimal
    }

    static func calculate(input: Input) -> Result {
        let divUVT = input.dividendos / input.uvt
        let impuesto: Decimal

        if input.gravadosSocietario {
            // Art. 242 — tabla para PN residentes
            let (impUVT, _) = TaxData.applyBrackets(divUVT, brackets: TaxData.dividendosPNBrackets)
            impuesto = (impUVT * input.uvt).rounded
        } else {
            // No gravados: primero 35%, luego tabla sobre el neto
            let impSocietario = (input.dividendos * TaxData.dividendosNoGravadosRate).rounded
            let netoPostSocietario = input.dividendos - impSocietario
            let netoUVT = netoPostSocietario / input.uvt
            let (impUVT, _) = TaxData.applyBrackets(netoUVT, brackets: TaxData.dividendosPNBrackets)
            impuesto = impSocietario + (impUVT * input.uvt).rounded
        }

        let tarifa = input.dividendos > 0 ? impuesto / input.dividendos : 0
        return Result(dividendos: input.dividendos, impuesto: impuesto, tarifaEfectiva: tarifa.rounded(to: 4))
    }
}

// MARK: - Ganancias Ocasionales

enum GananciasOcasionalesCalculator {

    struct Input {
        var valorVenta: Decimal
        var costoFiscal: Decimal
        var uvt: Decimal = TaxData.uvt2026
    }

    struct Result {
        let ganancia: Decimal
        let exencion: Decimal
        let baseGravable: Decimal
        let impuesto: Decimal
    }

    static func calculate(input: Input) -> Result {
        let ganancia = max(0, input.valorVenta - input.costoFiscal)
        let exencion = min(ganancia, TaxData.viviendaExencionUVT * input.uvt)
        let baseGravable = max(0, ganancia - exencion)
        let impuesto = (baseGravable * TaxData.gananciaOcasionalRate).rounded

        return Result(ganancia: ganancia, exencion: exencion, baseGravable: baseGravable, impuesto: impuesto)
    }
}

// MARK: - Herencias

enum HerenciasCalculator {

    struct Input {
        var valorHerencia: Decimal
        var esVivienda: Bool = false
        var uvt: Decimal = TaxData.uvt2026
    }

    struct Result {
        let valorHerencia: Decimal
        let exencion: Decimal
        let baseGravable: Decimal
        let impuesto: Decimal
    }

    static func calculate(input: Input) -> Result {
        let exencionUVT = input.esVivienda ? TaxData.herenciaViviendaExencionUVT : TaxData.herenciaExencionHerederosUVT
        let exencion = min(input.valorHerencia, exencionUVT * input.uvt)
        let baseGravable = max(0, input.valorHerencia - exencion)
        let impuesto = (baseGravable * TaxData.gananciaOcasionalRate).rounded

        return Result(valorHerencia: input.valorHerencia, exencion: exencion, baseGravable: baseGravable, impuesto: impuesto)
    }
}

// MARK: - Timbre

enum TimbreCalculator {

    struct Input {
        var valorDocumento: Decimal
        var uvt: Decimal = TaxData.uvt2026
    }

    struct Result {
        let valor: Decimal
        let umbral: Decimal
        let aplica: Bool
        let impuesto: Decimal
    }

    static func calculate(input: Input) -> Result {
        let umbral = TaxData.timbreThresholdUVT * input.uvt
        let aplica = input.valorDocumento > umbral
        let impuesto = aplica ? (input.valorDocumento * TaxData.timbreRate).rounded : 0

        return Result(valor: input.valorDocumento, umbral: umbral, aplica: aplica, impuesto: impuesto)
    }
}

// MARK: - Anticipo Renta (Art. 807)

enum AnticipoCalculator {

    enum AnoDeclaracion: String, CaseIterable, Identifiable {
        case primerAno = "Primer ano"
        case segundoAno = "Segundo ano"
        case subsiguientes = "Tercer ano en adelante"
        var id: String { rawValue }

        var rate: Decimal {
            switch self {
            case .primerAno: return TaxData.anticipoRates.primerAno
            case .segundoAno: return TaxData.anticipoRates.segundoAno
            case .subsiguientes: return TaxData.anticipoRates.subsiguientes
            }
        }
    }

    struct Input {
        var impuestoNeto: Decimal
        var retencionesAnoPrevio: Decimal = 0
        var anoDeclaracion: AnoDeclaracion = .subsiguientes
    }

    struct Result {
        let impuestoNeto: Decimal
        let porcentaje: Decimal
        let anticipoBruto: Decimal
        let retencionesDescontadas: Decimal
        let anticipoNeto: Decimal
    }

    static func calculate(input: Input) -> Result {
        let porcentaje = input.anoDeclaracion.rate
        let bruto = (input.impuestoNeto * porcentaje).rounded
        let neto = max(0, bruto - input.retencionesAnoPrevio)

        return Result(
            impuestoNeto: input.impuestoNeto,
            porcentaje: porcentaje,
            anticipoBruto: bruto,
            retencionesDescontadas: input.retencionesAnoPrevio,
            anticipoNeto: neto
        )
    }
}

// MARK: - Beneficio de Auditoria (Art. 689-3)

enum BeneficioAuditoriaCalculator {

    struct Input {
        var impuestoAnoPrevio: Decimal
        var impuestoAnoActual: Decimal
        var uvt: Decimal = TaxData.uvt2026
    }

    struct Result {
        let incremento: Decimal
        let incrementoPct: Decimal
        let cumpleMinimo: Bool
        let firmeza6Meses: Bool
        let firmeza12Meses: Bool
        let mesesFirmeza: Int
    }

    static func calculate(input: Input) -> Result {
        let ba = TaxData.beneficioAuditoria
        let minimoUVT = ba.impuestoMinUVT * input.uvt

        guard input.impuestoAnoPrevio > 0 else {
            return Result(incremento: 0, incrementoPct: 0, cumpleMinimo: false, firmeza6Meses: false, firmeza12Meses: false, mesesFirmeza: 36)
        }

        let incremento = input.impuestoAnoActual - input.impuestoAnoPrevio
        let incrementoPct = incremento / input.impuestoAnoPrevio
        let cumpleMinimo = input.impuestoAnoActual >= minimoUVT

        let firmeza6 = cumpleMinimo && incrementoPct >= ba.incremento6Meses
        let firmeza12 = cumpleMinimo && incrementoPct >= ba.incremento12Meses

        let meses: Int
        if firmeza6 { meses = 6 }
        else if firmeza12 { meses = 12 }
        else { meses = 36 }

        return Result(
            incremento: incremento,
            incrementoPct: incrementoPct.rounded(to: 4),
            cumpleMinimo: cumpleMinimo,
            firmeza6Meses: firmeza6,
            firmeza12Meses: firmeza12,
            mesesFirmeza: meses
        )
    }
}

// MARK: - Pension Verificador

enum PensionVerificador {

    struct Input {
        var genero: String  // "hombre" or "mujer"
        var fechaNacimiento: Date
        var semanasActuales: Int
        var anoRetiro: Int = 2026
    }

    struct Result {
        let edadActual: Int
        let edadRequerida: Int
        let cumpleEdad: Bool
        let semanasRequeridas: Int
        let cumpleSemanas: Bool
        let faltanSemanas: Int
    }

    static func verificar(input: Input) -> Result {
        let calendar = Calendar.current
        let edadActual = calendar.dateComponents([.year], from: input.fechaNacimiento, to: Date()).year ?? 0

        let edadRequerida = input.genero == "hombre"
            ? TaxData.pensionRequisitos.edadHombreActual
            : TaxData.pensionRequisitos.edadMujerActual

        var semanasRequeridas = TaxData.pensionRequisitos.semanasBase
        if input.genero == "mujer" {
            if let entry = TaxData.semanasMujeresProgresivo.first(where: { $0.anio == input.anoRetiro }) {
                semanasRequeridas = entry.semanas
            } else if input.anoRetiro > 2031 {
                semanasRequeridas = 1000
            }
        }

        let cumpleEdad = edadActual >= edadRequerida
        let cumpleSemanas = input.semanasActuales >= semanasRequeridas
        let faltanSemanas = max(0, semanasRequeridas - input.semanasActuales)

        return Result(
            edadActual: edadActual,
            edadRequerida: edadRequerida,
            cumpleEdad: cumpleEdad,
            semanasRequeridas: semanasRequeridas,
            cumpleSemanas: cumpleSemanas,
            faltanSemanas: faltanSemanas
        )
    }
}

// MARK: - Depreciacion Fiscal (Art. 137)

enum DepreciacionCalculator {

    struct Input {
        var valorActivo: Decimal
        var tipoActivo: String   // matches TaxData.DepreciacionTasa.tipo
        var anosUso: Int = 0
    }

    struct Result {
        let label: String
        let vidaUtil: Int
        let tasaAnual: Decimal
        let depreciacionAnual: Decimal
        let depreciacionAcumulada: Decimal
        let valorResidual: Decimal
    }

    static func calculate(input: Input) -> Result {
        let tasa = TaxData.depreciacionTasas.first { $0.tipo == input.tipoActivo }
            ?? TaxData.DepreciacionTasa(tipo: "general", label: "General", tasaMax: Decimal(string: "0.10")!, vidaUtil: 10)

        let anual = (input.valorActivo * tasa.tasaMax).rounded
        let acumulada = (anual * Decimal(min(input.anosUso, tasa.vidaUtil))).rounded
        let residual = max(0, input.valorActivo - acumulada)

        return Result(
            label: tasa.label,
            vidaUtil: tasa.vidaUtil,
            tasaAnual: tasa.tasaMax,
            depreciacionAnual: anual,
            depreciacionAcumulada: acumulada,
            valorResidual: residual
        )
    }
}

// MARK: - Consumo (Art. 512-1)

enum ConsumoCalculator {

    struct Input {
        var monto: Decimal
        var tipoConsumo: String  // matches TaxData.ConsumoTarifa.tipo
    }

    struct Result {
        let label: String
        let base: Decimal
        let tarifa: Decimal
        let impuesto: Decimal
        let total: Decimal
    }

    static func calculate(input: Input) -> Result {
        let tarifa = TaxData.consumoTarifas.first { $0.tipo == input.tipoConsumo }
            ?? TaxData.ConsumoTarifa(tipo: "restaurantes", label: "Restaurantes", tarifa: Decimal(string: "0.08")!, articulo: "512-1")

        let impuesto = (input.monto * tarifa.tarifa).rounded
        return Result(label: tarifa.label, base: input.monto, tarifa: tarifa.tarifa, impuesto: impuesto, total: input.monto + impuesto)
    }
}

// MARK: - Renta PJ (Art. 240)

enum RentaJuridicasCalculator {

    struct Input {
        var rentaLiquida: Decimal
        var sector: String = "general"
        var uvt: Decimal = TaxData.uvt2026
    }

    struct Result {
        let rentaLiquida: Decimal
        let sector: String
        let tarifa: Decimal
        let impuesto: Decimal
        let sobretasa: Decimal
        let totalImpuesto: Decimal
    }

    static func calculate(input: Input) -> Result {
        let pjRate = TaxData.pjRates.first { $0.sector == input.sector }
            ?? TaxData.pjRates[0]

        let impuesto = (input.rentaLiquida * pjRate.rate).rounded

        // Sobretasa for financial sector
        var sobretasa: Decimal = 0
        if input.sector == "financiero" {
            let threshold = TaxData.sobretasaFinancieroThresholdUVT * input.uvt
            if input.rentaLiquida > threshold {
                sobretasa = (input.rentaLiquida * TaxData.sobretasaFinancieroRate).rounded
            }
        }

        return Result(
            rentaLiquida: input.rentaLiquida,
            sector: pjRate.label,
            tarifa: pjRate.rate,
            impuesto: impuesto,
            sobretasa: sobretasa,
            totalImpuesto: impuesto + sobretasa
        )
    }
}
