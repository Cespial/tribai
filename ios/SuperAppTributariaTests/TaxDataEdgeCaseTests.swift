import Testing
import Foundation
@testable import SuperAppTributaria

struct TaxDataEdgeCaseTests {
    let uvt = TaxData.uvt2026

    // MARK: - applyBrackets thorough testing

    @Test func applyBracketsExactlyAtSecondBracketStart() {
        let (imp, _) = TaxData.applyBrackets(1_090, brackets: TaxData.rentaBrackets)
        #expect(imp == 0)
    }

    @Test func applyBracketsJustAboveSecondBracketStart() {
        let value: Decimal = 1_091
        let (imp, _) = TaxData.applyBrackets(value, brackets: TaxData.rentaBrackets)
        #expect(imp == (1 * Decimal(string: "0.19")!))
    }

    @Test func applyBracketsTopBracket() {
        let value: Decimal = 50_000
        let (imp, breakdown) = TaxData.applyBrackets(value, brackets: TaxData.rentaBrackets)
        #expect(imp > 0)
        #expect(breakdown.count >= 1)
    }

    @Test func applyBracketsNegativeValueReturnsZero() {
        let (imp, breakdown) = TaxData.applyBrackets(-100, brackets: TaxData.rentaBrackets)
        #expect(imp == 0)
        #expect(breakdown.isEmpty)
    }

    @Test func applyBracketsPatrimonioBrackets() {
        let value: Decimal = 100_000 // between 72k and 122k
        let (imp, _) = TaxData.applyBrackets(value, brackets: TaxData.patrimonioBrackets)
        let expected = (value - 72_000) * Decimal(string: "0.005")!
        #expect(imp == expected)
    }

    @Test func applyBracketsEmptyBracketsReturnsZero() {
        let (imp, breakdown) = TaxData.applyBrackets(1_000, brackets: [])
        #expect(imp == 0)
        #expect(breakdown.isEmpty)
    }

    @Test func applyBracketsRetencionSalariosBelow95UVT() {
        let (imp, _) = TaxData.applyBrackets(90, brackets: TaxData.retencionSalariosBrackets)
        #expect(imp == 0)
    }

    @Test func applyBracketsRetencionSalariosAbove95UVT() {
        let (imp, _) = TaxData.applyBrackets(100, brackets: TaxData.retencionSalariosBrackets)
        #expect(imp > 0)
    }

    // MARK: - Data structure integrity

    @Test func rentaBracketsAreContiguous() {
        for i in 0..<TaxData.rentaBrackets.count - 1 {
            #expect(TaxData.rentaBrackets[i].toUVT == TaxData.rentaBrackets[i + 1].fromUVT)
        }
    }

    @Test func rentaBracketsRatesAreNonDecreasing() {
        for i in 0..<TaxData.rentaBrackets.count - 1 {
            #expect(TaxData.rentaBrackets[i].rate <= TaxData.rentaBrackets[i + 1].rate)
        }
    }

    @Test func patrimonioBracketsAreContiguous() {
        for i in 0..<TaxData.patrimonioBrackets.count - 1 {
            #expect(TaxData.patrimonioBrackets[i].toUVT == TaxData.patrimonioBrackets[i + 1].fromUVT)
        }
    }

    @Test func patrimonioBracketsRatesAreNonDecreasing() {
        for i in 0..<TaxData.patrimonioBrackets.count - 1 {
            #expect(TaxData.patrimonioBrackets[i].rate <= TaxData.patrimonioBrackets[i + 1].rate)
        }
    }

    @Test func retencionSalariosBracketsAreContiguous() {
        for i in 0..<TaxData.retencionSalariosBrackets.count - 1 {
            #expect(TaxData.retencionSalariosBrackets[i].toUVT == TaxData.retencionSalariosBrackets[i + 1].fromUVT)
        }
    }

    @Test func arlClassesHaveFiveEntries() {
        #expect(TaxData.arlClasses.count == 5)
    }

    @Test func arlClassesRatesAreIncreasing() {
        for i in 0..<TaxData.arlClasses.count - 1 {
            #expect(TaxData.arlClasses[i].rate < TaxData.arlClasses[i + 1].rate)
        }
    }

    @Test func fspBracketsAreSorted() {
        for i in 0..<TaxData.fspBrackets.count - 1 {
            #expect(TaxData.fspBrackets[i].fromSMLMV < TaxData.fspBrackets[i + 1].fromSMLMV)
        }
    }

    @Test func simpleGroupsHaveFiveEntries() {
        #expect(TaxData.simpleGroups.count == 5)
    }

    @Test func simpleBracketsHaveFourEntries() {
        #expect(TaxData.simpleBrackets.count == 4)
    }

    @Test func simpleBracketsHaveFiveRatesEach() {
        for bracket in TaxData.simpleBrackets {
            #expect(bracket.rates.count == 5)
        }
    }

    @Test func pjRatesHaveEightEntries() {
        #expect(TaxData.pjRates.count == 8)
    }

    @Test func depreciacionTasasHaveSevenEntries() {
        #expect(TaxData.depreciacionTasas.count == 7)
    }

    @Test func consumoTarifasHaveSixEntries() {
        #expect(TaxData.consumoTarifas.count == 6)
    }

    @Test func retencionConceptosHaveSalarios() {
        let salarios = TaxData.retencionConceptos.first { $0.id == "salarios" }
        #expect(salarios != nil)
        #expect(salarios?.isProgressive == true)
        #expect(salarios?.tarifa == nil)
    }

    // MARK: - Employer/Employee rate integrity

    @Test func employerPensionRateIs12Percent() {
        #expect(TaxData.employerRates.pension == Decimal(string: "0.12")!)
    }

    @Test func employeeSaludRateIs4Percent() {
        #expect(TaxData.employeeRates.salud == Decimal(string: "0.04")!)
    }

    @Test func employeePensionRateIs4Percent() {
        #expect(TaxData.employeeRates.pension == Decimal(string: "0.04")!)
    }

    @Test func independentRatesBaseSS40Percent() {
        #expect(TaxData.independentRates.baseSS == Decimal(string: "0.40")!)
    }

    @Test func licenciaMaternidad18Weeks() {
        #expect(TaxData.licenciaMaternidadSemanas == 18)
    }

    @Test func licenciaPaternidad2Weeks() {
        #expect(TaxData.licenciaPaternidadSemanas == 2)
    }
}
