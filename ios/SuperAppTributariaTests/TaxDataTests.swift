import Testing
import Foundation
@testable import SuperAppTributaria

struct TaxDataTests {
    // Core constants
    @Test func uvt2026Value() {
        #expect(TaxData.uvt2026 == 52_374)
    }

    @Test func smlmv2026Value() {
        #expect(TaxData.smlmv2026 == 1_750_905)
    }

    @Test func auxilioTransporte2026Value() {
        #expect(TaxData.auxilioTransporte2026 == 249_095)
    }

    @Test func currentUVTYear() {
        #expect(TaxData.currentUVTYear == 2026)
    }

    // UVT historical values
    @Test func historicalUVTHas21Entries() {
        #expect(TaxData.uvtValues.count == 21)
    }

    @Test func uvtValuesContain2026() {
        #expect(TaxData.uvtValues[2026] == 52_374)
    }

    @Test func uvtValuesContain2025() {
        #expect(TaxData.uvtValues[2025] == 49_799)
    }

    // Renta brackets
    @Test func rentaBracketsHaveSevenLevels() {
        #expect(TaxData.rentaBrackets.count == 7)
    }

    @Test func firstRentaBracketIsZeroRate() {
        #expect(TaxData.rentaBrackets[0].rate == 0)
        #expect(TaxData.rentaBrackets[0].fromUVT == 0)
        #expect(TaxData.rentaBrackets[0].toUVT == 1_090)
    }

    @Test func lastRentaBracketIs39Percent() {
        let last = TaxData.rentaBrackets[6]
        #expect(last.rate == Decimal(string: "0.39")!)
        #expect(last.fromUVT == 31_000)
    }

    // ApplyBrackets helper
    @Test func applyBracketsZeroReturnsZero() {
        let (imp, breakdown) = TaxData.applyBrackets(0, brackets: TaxData.rentaBrackets)
        #expect(imp == 0)
        #expect(breakdown.isEmpty)
    }

    @Test func applyBracketsBelowFirstThresholdReturnsZero() {
        let (imp, _) = TaxData.applyBrackets(500, brackets: TaxData.rentaBrackets)
        #expect(imp == 0)
    }

    @Test func applyBracketsInSecondBracket() {
        let value: Decimal = 1_200 // In second bracket (1090–1700)
        let (imp, breakdown) = TaxData.applyBrackets(value, brackets: TaxData.rentaBrackets)
        let expected = (value - 1_090) * Decimal(string: "0.19")!
        #expect(imp == expected)
        #expect(breakdown.count == 1)
    }

    // Ley 2277 limits
    @Test func ley2277LimitsValues() {
        let limits = TaxData.ley2277Limits
        #expect(limits.rentasExentasMaxUVT == 790)
        #expect(limits.deduccionesExentasMaxUVT == 1_340)
        #expect(limits.dependienteUVT == 72)
        #expect(limits.maxDependientes == 4)
    }

    // GMF
    @Test func gmfRateIs4x1000() {
        #expect(TaxData.gmfRate == Decimal(string: "0.004")!)
    }

    // IVA
    @Test func ivaRates() {
        #expect(TaxData.ivaGeneral == Decimal(string: "0.19")!)
        #expect(TaxData.ivaReducido == Decimal(string: "0.05")!)
    }

    // Retencion conceptos
    @Test func retencionConceptosHas9Items() {
        #expect(TaxData.retencionConceptos.count == 9)
    }

    // Patrimonio
    @Test func patrimonioThreshold72000UVT() {
        #expect(TaxData.patrimonioThresholdUVT == 72_000)
    }

    // Sanciones
    @Test func sancionMinima10UVT() {
        #expect(TaxData.sancionMinimaUVT == 10)
    }
}
