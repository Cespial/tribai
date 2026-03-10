import Testing
import Foundation
@testable import SuperAppTributaria

struct GenericCalculatorsEdgeCaseTests {
    let uvt = TaxData.uvt2026

    // MARK: - UVT Converter

    @Test func uvtConverterUnknownYearUsesDefault() {
        let result = UVTConverter.uvtToCOP(uvt: 100, year: 1990)
        #expect(result.uvtRate == TaxData.uvt2026)
    }

    @Test func uvtConverterZeroUVT() {
        let result = UVTConverter.uvtToCOP(uvt: 0)
        #expect(result.cop == 0)
    }

    @Test func copToUVTZeroCOP() {
        let result = UVTConverter.copToUVT(cop: 0)
        #expect(result.uvt == 0)
    }

    @Test func uvtConverterYear2006() {
        let result = UVTConverter.uvtToCOP(uvt: 1, year: 2006)
        #expect(result.uvtRate == 20_000)
    }

    @Test func uvtConverterRoundTrip() {
        let original: Decimal = 52_374_000
        let uvtResult = UVTConverter.copToUVT(cop: original)
        let copResult = UVTConverter.uvtToCOP(uvt: uvtResult.uvt, year: uvtResult.year)
        // Should be close (rounding may cause minor differences)
        #expect(abs(copResult.cop - original) <= uvt)
    }

    // MARK: - Debo Declarar

    @Test func deboDeclararAllCriteriaExceeded() {
        let input = DeboDeclarar.Input(
            patrimonioBruto: 500_000_000,
            ingresosBrutos: 100_000_000,
            consumosTarjeta: 100_000_000,
            comprasTotales: 100_000_000,
            consignaciones: 100_000_000
        )
        let result = DeboDeclarar.verificar(input: input)
        #expect(result.debeDeclarar == true)
        let superados = result.criterios.filter { $0.supera }
        #expect(superados.count == 5)
    }

    @Test func deboDeclararOnlySingleCriterionExceeded() {
        let input = DeboDeclarar.Input(patrimonioBruto: 500_000_000)
        let result = DeboDeclarar.verificar(input: input)
        #expect(result.debeDeclarar == true)
        let superados = result.criterios.filter { $0.supera }
        #expect(superados.count == 1)
    }

    @Test func deboDeclararJustBelowThresholds() {
        let topes = TaxData.topesDeclarar
        let uvtAG = topes.uvtAnoGravable
        let input = DeboDeclarar.Input(
            patrimonioBruto: topes.patrimonioBrutoUVT * uvtAG - 1,
            ingresosBrutos: topes.ingresosBrutosUVT * uvtAG - 1
        )
        let result = DeboDeclarar.verificar(input: input)
        #expect(result.debeDeclarar == false)
    }

    @Test func deboDeclararCriteriosHaveCorrectNames() {
        let result = DeboDeclarar.verificar(input: DeboDeclarar.Input())
        let names = result.criterios.map { $0.nombre }
        #expect(names.contains("Patrimonio bruto"))
        #expect(names.contains("Ingresos brutos"))
        #expect(names.contains("Consumos tarjeta credito"))
        #expect(names.contains("Compras totales"))
        #expect(names.contains("Consignaciones bancarias"))
    }

    @Test func deboDeclararTopeCOPCalculated() {
        let result = DeboDeclarar.verificar(input: DeboDeclarar.Input())
        for criterio in result.criterios {
            #expect(criterio.topeCOP > 0)
        }
    }

    // MARK: - Dividendos PN

    @Test func dividendosPNGravadosBelowThresholdNoTax() {
        let input = DividendosCalculator.Input(dividendos: 500 * uvt)
        let result = DividendosCalculator.calculate(input: input)
        #expect(result.impuesto == 0)
    }

    @Test func dividendosPNGravadosAboveThreshold20Percent() {
        let input = DividendosCalculator.Input(dividendos: 2_000 * uvt)
        let result = DividendosCalculator.calculate(input: input)
        #expect(result.impuesto > 0)
    }

    @Test func dividendosPNNoGravadosHigherTax() {
        let amount: Decimal = 2_000 * uvt
        let gravados = DividendosCalculator.calculate(input: DividendosCalculator.Input(dividendos: amount, gravadosSocietario: true))
        let noGravados = DividendosCalculator.calculate(input: DividendosCalculator.Input(dividendos: amount, gravadosSocietario: false))
        #expect(noGravados.impuesto > gravados.impuesto)
    }

    @Test func dividendosPNZero() {
        let result = DividendosCalculator.calculate(input: DividendosCalculator.Input(dividendos: 0))
        #expect(result.impuesto == 0)
        #expect(result.tarifaEfectiva == 0)
    }

    @Test func dividendosPNTarifaEfectivaRange() {
        let input = DividendosCalculator.Input(dividendos: 5_000 * uvt)
        let result = DividendosCalculator.calculate(input: input)
        #expect(result.tarifaEfectiva >= 0)
        #expect(result.tarifaEfectiva <= 1)
    }

    // MARK: - Ganancias Ocasionales

    @Test func gananciaOcasionalNoGain() {
        let input = GananciasOcasionalesCalculator.Input(valorVenta: 100_000_000, costoFiscal: 200_000_000)
        let result = GananciasOcasionalesCalculator.calculate(input: input)
        #expect(result.ganancia == 0)
        #expect(result.impuesto == 0)
    }

    @Test func gananciaOcasionalFullyExempt() {
        let input = GananciasOcasionalesCalculator.Input(valorVenta: 200_000_000, costoFiscal: 100_000_000)
        let result = GananciasOcasionalesCalculator.calculate(input: input)
        if result.ganancia <= TaxData.viviendaExencionUVT * uvt {
            #expect(result.impuesto == 0)
        }
    }

    @Test func gananciaOcasionalZeroValues() {
        let input = GananciasOcasionalesCalculator.Input(valorVenta: 0, costoFiscal: 0)
        let result = GananciasOcasionalesCalculator.calculate(input: input)
        #expect(result.ganancia == 0)
        #expect(result.impuesto == 0)
    }

    @Test func gananciaOcasionalExencionCapped() {
        let input = GananciasOcasionalesCalculator.Input(valorVenta: 1_000_000_000, costoFiscal: 0)
        let result = GananciasOcasionalesCalculator.calculate(input: input)
        #expect(result.exencion == TaxData.viviendaExencionUVT * uvt)
        #expect(result.baseGravable > 0)
    }

    // MARK: - Herencias

    @Test func herenciaViviendaHigherExencion() {
        let vivienda = HerenciasCalculator.calculate(input: HerenciasCalculator.Input(valorHerencia: 1_000_000_000, esVivienda: true))
        let noVivienda = HerenciasCalculator.calculate(input: HerenciasCalculator.Input(valorHerencia: 1_000_000_000, esVivienda: false))
        #expect(vivienda.exencion > noVivienda.exencion)
    }

    @Test func herenciaZeroValue() {
        let result = HerenciasCalculator.calculate(input: HerenciasCalculator.Input(valorHerencia: 0))
        #expect(result.impuesto == 0)
        #expect(result.exencion == 0)
    }

    @Test func herenciaSmallValueFullyExempt() {
        let result = HerenciasCalculator.calculate(input: HerenciasCalculator.Input(valorHerencia: 100 * uvt))
        #expect(result.impuesto == 0)
    }

    // MARK: - Timbre

    @Test func timbreExactlyAtThreshold() {
        let umbral = TaxData.timbreThresholdUVT * uvt
        let result = TimbreCalculator.calculate(input: TimbreCalculator.Input(valorDocumento: umbral))
        #expect(result.aplica == false)
    }

    @Test func timbreZeroValue() {
        let result = TimbreCalculator.calculate(input: TimbreCalculator.Input(valorDocumento: 0))
        #expect(result.aplica == false)
        #expect(result.impuesto == 0)
    }

    @Test func timbreRate1Percent() {
        let valor = 10_000 * uvt
        let result = TimbreCalculator.calculate(input: TimbreCalculator.Input(valorDocumento: valor))
        #expect(result.impuesto == (valor * Decimal(string: "0.01")!).rounded)
    }

    // MARK: - Anticipo

    @Test func anticipoPrimerAno25Percent() {
        let input = AnticipoCalculator.Input(impuestoNeto: 10_000_000, anoDeclaracion: .primerAno)
        let result = AnticipoCalculator.calculate(input: input)
        #expect(result.porcentaje == Decimal(string: "0.25")!)
        #expect(result.anticipoBruto == 2_500_000)
    }

    @Test func anticipoSegundoAno50Percent() {
        let input = AnticipoCalculator.Input(impuestoNeto: 10_000_000, anoDeclaracion: .segundoAno)
        let result = AnticipoCalculator.calculate(input: input)
        #expect(result.porcentaje == Decimal(string: "0.50")!)
        #expect(result.anticipoBruto == 5_000_000)
    }

    @Test func anticipoWithRetenciones() {
        let input = AnticipoCalculator.Input(impuestoNeto: 10_000_000, retencionesAnoPrevio: 5_000_000)
        let result = AnticipoCalculator.calculate(input: input)
        #expect(result.anticipoNeto == result.anticipoBruto - 5_000_000)
    }

    @Test func anticipoNetoNeverNegative() {
        let input = AnticipoCalculator.Input(impuestoNeto: 1_000_000, retencionesAnoPrevio: 10_000_000)
        let result = AnticipoCalculator.calculate(input: input)
        #expect(result.anticipoNeto >= 0)
    }

    @Test func anticipoZeroImpuesto() {
        let input = AnticipoCalculator.Input(impuestoNeto: 0)
        let result = AnticipoCalculator.calculate(input: input)
        #expect(result.anticipoBruto == 0)
        #expect(result.anticipoNeto == 0)
    }

    // MARK: - Beneficio Auditoria

    @Test func beneficioAuditoria6MesesWith35PercentIncrease() {
        let input = BeneficioAuditoriaCalculator.Input(
            impuestoAnoPrevio: 10_000_000,
            impuestoAnoActual: 14_000_000
        )
        let result = BeneficioAuditoriaCalculator.calculate(input: input)
        #expect(result.incrementoPct >= Decimal(string: "0.35")!)
        if result.cumpleMinimo {
            #expect(result.firmeza6Meses == true)
            #expect(result.mesesFirmeza == 6)
        }
    }

    @Test func beneficioAuditoria12MesesWith25PercentIncrease() {
        let minUVT = TaxData.beneficioAuditoria.impuestoMinUVT * uvt
        let input = BeneficioAuditoriaCalculator.Input(
            impuestoAnoPrevio: minUVT,
            impuestoAnoActual: minUVT * Decimal(string: "1.30")!
        )
        let result = BeneficioAuditoriaCalculator.calculate(input: input)
        #expect(result.incrementoPct >= Decimal(string: "0.25")!)
        #expect(result.cumpleMinimo == true)
        #expect(result.firmeza12Meses == true)
    }

    @Test func beneficioAuditoriaNoIncrease() {
        let input = BeneficioAuditoriaCalculator.Input(
            impuestoAnoPrevio: 10_000_000,
            impuestoAnoActual: 10_000_000
        )
        let result = BeneficioAuditoriaCalculator.calculate(input: input)
        #expect(result.firmeza6Meses == false)
        #expect(result.firmeza12Meses == false)
        #expect(result.mesesFirmeza == 36)
    }

    @Test func beneficioAuditoriaZeroPriorYear() {
        let input = BeneficioAuditoriaCalculator.Input(impuestoAnoPrevio: 0, impuestoAnoActual: 5_000_000)
        let result = BeneficioAuditoriaCalculator.calculate(input: input)
        #expect(result.mesesFirmeza == 36)
        #expect(result.firmeza6Meses == false)
    }

    // MARK: - Depreciacion

    @Test func depreciacionEdificiosLongLife() {
        let input = DepreciacionCalculator.Input(valorActivo: 1_000_000_000, tipoActivo: "edificios")
        let result = DepreciacionCalculator.calculate(input: input)
        #expect(result.vidaUtil == 45)
        #expect(result.tasaAnual == Decimal(string: "0.0222")!)
    }

    @Test func depreciacionFullyDepreciated() {
        let input = DepreciacionCalculator.Input(valorActivo: 10_000_000, tipoActivo: "computadores", anosUso: 10)
        let result = DepreciacionCalculator.calculate(input: input)
        // 5 year vida util, so capped at 5 years of use
        #expect(result.depreciacionAcumulada == result.depreciacionAnual * 5)
        #expect(result.valorResidual == 0)
    }

    @Test func depreciacionZeroYearsUse() {
        let input = DepreciacionCalculator.Input(valorActivo: 10_000_000, tipoActivo: "vehiculos", anosUso: 0)
        let result = DepreciacionCalculator.calculate(input: input)
        #expect(result.depreciacionAcumulada == 0)
        #expect(result.valorResidual == 10_000_000)
    }

    @Test func depreciacionUnknownTypeUsesGeneral() {
        let input = DepreciacionCalculator.Input(valorActivo: 10_000_000, tipoActivo: "desconocido")
        let result = DepreciacionCalculator.calculate(input: input)
        #expect(result.label == "General")
        #expect(result.vidaUtil == 10)
    }

    @Test func depreciacionValorResidualNeverNegative() {
        let input = DepreciacionCalculator.Input(valorActivo: 1_000_000, tipoActivo: "computadores", anosUso: 100)
        let result = DepreciacionCalculator.calculate(input: input)
        #expect(result.valorResidual >= 0)
    }

    // MARK: - Consumo

    @Test func consumoTelefonia4Percent() {
        let input = ConsumoCalculator.Input(monto: 100_000, tipoConsumo: "telefonia")
        let result = ConsumoCalculator.calculate(input: input)
        #expect(result.tarifa == Decimal(string: "0.04")!)
        #expect(result.impuesto == 4_000)
        #expect(result.total == 104_000)
    }

    @Test func consumoVehiculosAlto16Percent() {
        let input = ConsumoCalculator.Input(monto: 200_000_000, tipoConsumo: "vehiculos_alto")
        let result = ConsumoCalculator.calculate(input: input)
        #expect(result.tarifa == Decimal(string: "0.16")!)
        #expect(result.impuesto == 32_000_000)
    }

    @Test func consumoUnknownTypeDefaultsToRestaurantes() {
        let input = ConsumoCalculator.Input(monto: 100_000, tipoConsumo: "desconocido")
        let result = ConsumoCalculator.calculate(input: input)
        #expect(result.tarifa == Decimal(string: "0.08")!)
    }

    @Test func consumoZeroMonto() {
        let input = ConsumoCalculator.Input(monto: 0, tipoConsumo: "restaurantes")
        let result = ConsumoCalculator.calculate(input: input)
        #expect(result.impuesto == 0)
        #expect(result.total == 0)
    }

    @Test func consumoTotalIsBaseAndImpuesto() {
        let input = ConsumoCalculator.Input(monto: 50_000, tipoConsumo: "restaurantes")
        let result = ConsumoCalculator.calculate(input: input)
        #expect(result.total == result.base + result.impuesto)
    }

    // MARK: - Renta PJ

    @Test func rentaPJFinancieroWithSobretasa() {
        let threshold = TaxData.sobretasaFinancieroThresholdUVT * uvt
        let input = RentaJuridicasCalculator.Input(rentaLiquida: threshold + 1_000_000, sector: "financiero")
        let result = RentaJuridicasCalculator.calculate(input: input)
        #expect(result.sobretasa > 0)
        #expect(result.totalImpuesto > result.impuesto)
    }

    @Test func rentaPJFinancieroNoSobretasaBelowThreshold() {
        let input = RentaJuridicasCalculator.Input(rentaLiquida: 100_000_000, sector: "financiero")
        let result = RentaJuridicasCalculator.calculate(input: input)
        #expect(result.sobretasa == 0)
    }

    @Test func rentaPJHotelero15Percent() {
        let input = RentaJuridicasCalculator.Input(rentaLiquida: 1_000_000_000, sector: "hotelero")
        let result = RentaJuridicasCalculator.calculate(input: input)
        #expect(result.tarifa == Decimal(string: "0.15")!)
    }

    @Test func rentaPJZeroRentaLiquida() {
        let input = RentaJuridicasCalculator.Input(rentaLiquida: 0)
        let result = RentaJuridicasCalculator.calculate(input: input)
        #expect(result.impuesto == 0)
    }

    @Test func rentaPJUnknownSectorUsesGeneral() {
        let input = RentaJuridicasCalculator.Input(rentaLiquida: 100_000_000, sector: "desconocido")
        let result = RentaJuridicasCalculator.calculate(input: input)
        #expect(result.tarifa == Decimal(string: "0.35")!)
    }

    @Test func rentaPJTotalImpuestoIsSumOfImpuestoAndSobretasa() {
        let input = RentaJuridicasCalculator.Input(rentaLiquida: 500_000_000, sector: "general")
        let result = RentaJuridicasCalculator.calculate(input: input)
        #expect(result.totalImpuesto == result.impuesto + result.sobretasa)
    }
}
