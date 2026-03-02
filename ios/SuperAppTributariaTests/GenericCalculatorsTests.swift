import Testing
import Foundation
@testable import SuperAppTributaria

struct GenericCalculatorsTests {
    let uvt = TaxData.uvt2026

    // UVT Converter
    @Test func uvtToCOP() {
        let result = UVTConverter.uvtToCOP(uvt: 100)
        #expect(result.cop == (100 * uvt).rounded)
        #expect(result.year == 2026)
    }

    @Test func copToUVT() {
        let result = UVTConverter.copToUVT(cop: 5_237_400)
        #expect(result.uvt == 100)
    }

    @Test func uvtConverterHistorical() {
        let result = UVTConverter.uvtToCOP(uvt: 100, year: 2025)
        #expect(result.uvtRate == 49_799)
    }

    // Debo Declarar
    @Test func deboDeclarar() {
        let input = DeboDeclarar.Input(ingresosBrutos: 100_000_000)
        let result = DeboDeclarar.verificar(input: input)
        #expect(result.debeDeclarar == true)
        #expect(result.criterios.count == 5)
    }

    @Test func noDeberiaDeclararBajoTopes() {
        let result = DeboDeclarar.verificar(input: DeboDeclarar.Input())
        #expect(result.debeDeclarar == false)
    }

    // Ganancias Ocasionales
    @Test func gananciaOcasional15Percent() {
        let input = GananciasOcasionalesCalculator.Input(valorVenta: 500_000_000, costoFiscal: 100_000_000)
        let result = GananciasOcasionalesCalculator.calculate(input: input)
        #expect(result.ganancia == 400_000_000)
        #expect(result.impuesto > 0)
    }

    // Herencias
    @Test func herenciaViviendaExencion() {
        let input = HerenciasCalculator.Input(valorHerencia: 1_000_000_000, esVivienda: true)
        let result = HerenciasCalculator.calculate(input: input)
        #expect(result.exencion == min(1_000_000_000, TaxData.herenciaViviendaExencionUVT * uvt))
    }

    // Timbre
    @Test func timbreAboveThreshold() {
        let valor = 7_000 * uvt
        let input = TimbreCalculator.Input(valorDocumento: valor)
        let result = TimbreCalculator.calculate(input: input)
        #expect(result.aplica == true)
        #expect(result.impuesto > 0)
    }

    @Test func timbreBelowThreshold() {
        let valor = 1_000 * uvt
        let input = TimbreCalculator.Input(valorDocumento: valor)
        let result = TimbreCalculator.calculate(input: input)
        #expect(result.aplica == false)
        #expect(result.impuesto == 0)
    }

    // Anticipo
    @Test func anticipoTercerAno75Percent() {
        let input = AnticipoCalculator.Input(impuestoNeto: 10_000_000)
        let result = AnticipoCalculator.calculate(input: input)
        #expect(result.porcentaje == Decimal(string: "0.75")!)
        #expect(result.anticipoBruto == 7_500_000)
    }

    // Consumo
    @Test func consumoRestaurantes8Percent() {
        let input = ConsumoCalculator.Input(monto: 100_000, tipoConsumo: "restaurantes")
        let result = ConsumoCalculator.calculate(input: input)
        #expect(result.impuesto == 8_000)
        #expect(result.total == 108_000)
    }

    // Renta PJ
    @Test func rentaPJGeneral35Percent() {
        let input = RentaJuridicasCalculator.Input(rentaLiquida: 1_000_000_000)
        let result = RentaJuridicasCalculator.calculate(input: input)
        #expect(result.tarifa == Decimal(string: "0.35")!)
        #expect(result.impuesto == 350_000_000)
    }

    // Depreciacion
    @Test func depreciacionComputadores20Percent() {
        let input = DepreciacionCalculator.Input(valorActivo: 10_000_000, tipoActivo: "computadores", anosUso: 3)
        let result = DepreciacionCalculator.calculate(input: input)
        #expect(result.tasaAnual == Decimal(string: "0.20")!)
        #expect(result.depreciacionAnual == 2_000_000)
        #expect(result.depreciacionAcumulada == 6_000_000)
        #expect(result.valorResidual == 4_000_000)
    }
}
