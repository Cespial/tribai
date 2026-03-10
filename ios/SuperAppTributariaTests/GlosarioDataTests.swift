import Testing
import Foundation
@testable import SuperAppTributaria

struct GlosarioDataTests {

    // MARK: - Term Count

    @Test func terminosHas33Entries() {
        #expect(GlosarioData.terminos.count == 33)
    }

    // MARK: - IDs Unique

    @Test func allIdsAreUnique() {
        let ids = GlosarioData.terminos.map(\.id)
        #expect(ids.count == Set(ids).count)
    }

    // MARK: - Available Letters

    @Test func availableLettersNotEmpty() {
        #expect(!GlosarioData.availableLetters.isEmpty)
    }

    @Test func availableLettersAreSorted() {
        let letters = GlosarioData.availableLetters
        #expect(letters == letters.sorted())
    }

    @Test func availableLettersContainsU() {
        #expect(GlosarioData.availableLetters.contains("U"))
    }

    @Test func availableLettersAreUppercase() {
        for letter in GlosarioData.availableLetters {
            #expect(letter == letter.uppercased())
        }
    }

    // MARK: - Known Terms

    @Test func containsUVT() {
        let uvt = GlosarioData.terminos.first { $0.id == "uvt" }
        #expect(uvt != nil)
        #expect(uvt?.termino == "UVT")
        #expect(uvt?.definicion.contains("Unidad de Valor Tributario") == true)
    }

    @Test func containsSMLMV() {
        let smlmv = GlosarioData.terminos.first { $0.id == "smlmv" }
        #expect(smlmv != nil)
        #expect(smlmv?.termino == "SMLMV")
    }

    @Test func containsIVA() {
        let iva = GlosarioData.terminos.first { $0.id == "iva" }
        #expect(iva != nil)
        #expect(iva?.termino == "IVA")
    }

    // MARK: - Term Structure

    @Test func allTermsHaveNonEmptyDefinicion() {
        for term in GlosarioData.terminos {
            #expect(!term.definicion.isEmpty, "Term \(term.id) has empty definicion")
        }
    }

    @Test func allTermsHaveNonEmptyTermino() {
        for term in GlosarioData.terminos {
            #expect(!term.termino.isEmpty, "Term \(term.id) has empty termino")
        }
    }

    // MARK: - Metadata

    @Test func lastUpdateIsSet() {
        #expect(!GlosarioData.lastUpdate.isEmpty)
    }
}
