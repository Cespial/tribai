import Testing
import Foundation
@testable import SuperAppTributaria

struct CalculatorCatalogTests {

    // MARK: - Catalog Integrity

    @Test func catalogHas35Calculators() {
        #expect(CalculatorCatalog.all.count == 35)
    }

    @Test func allCalculatorsHaveUniqueIds() {
        let ids = CalculatorCatalog.all.map(\.id)
        #expect(Set(ids).count == ids.count)
    }

    @Test func allCalculatorsHaveTitles() {
        for calc in CalculatorCatalog.all {
            #expect(!calc.title.isEmpty, "Calculator \(calc.id) has empty title")
        }
    }

    @Test func allCalculatorsHaveDescriptions() {
        for calc in CalculatorCatalog.all {
            #expect(!calc.description.isEmpty, "Calculator \(calc.id) has empty description")
        }
    }

    @Test func allCalculatorsHaveSfSymbols() {
        for calc in CalculatorCatalog.all {
            #expect(!calc.sfSymbol.isEmpty, "Calculator \(calc.id) has empty sfSymbol")
        }
    }

    @Test func allCalculatorsHaveTags() {
        for calc in CalculatorCatalog.all {
            #expect(!calc.tags.isEmpty, "Calculator \(calc.id) has no tags")
        }
    }

    // MARK: - Top 5

    @Test func top5HasExactly5Items() {
        #expect(CalculatorCatalog.top5.count == 5)
    }

    @Test func top5ContainsDeBoDeclarar() {
        #expect(CalculatorCatalog.top5.contains { $0.id == "debo-declarar" })
    }

    @Test func top5ContainsRenta() {
        #expect(CalculatorCatalog.top5.contains { $0.id == "renta" })
    }

    // MARK: - Lookup

    @Test func itemByIdFindsExisting() {
        let item = CalculatorCatalog.item(byId: "renta")
        #expect(item != nil)
        #expect(item?.title == "Renta Personas Naturales")
    }

    @Test func itemByIdReturnsNilForMissing() {
        #expect(CalculatorCatalog.item(byId: "nonexistent") == nil)
    }

    // MARK: - Category Filtering

    @Test func itemsForTodasReturnsAll() {
        #expect(CalculatorCatalog.items(for: .todas).count == 35)
    }

    @Test func itemsForRentaReturnsOnlyRenta() {
        let items = CalculatorCatalog.items(for: .renta)
        #expect(items.allSatisfy { $0.category == .renta })
        #expect(!items.isEmpty)
    }

    @Test func itemsForIVAReturnsOnlyIVA() {
        let items = CalculatorCatalog.items(for: .iva)
        #expect(items.allSatisfy { $0.category == .iva })
    }

    @Test func itemsForLaboralReturnsOnlyLaboral() {
        let items = CalculatorCatalog.items(for: .laboral)
        #expect(items.allSatisfy { $0.category == .laboral })
    }

    @Test func itemsForPatrimonioReturnsOnlyPatrimonio() {
        let items = CalculatorCatalog.items(for: .patrimonio)
        #expect(items.allSatisfy { $0.category == .patrimonio })
    }

    @Test func itemsForSancionesReturnsOnlySanciones() {
        let items = CalculatorCatalog.items(for: .sanciones)
        #expect(items.allSatisfy { $0.category == .sanciones })
    }

    @Test func itemsForOtrosReturnsOnlyOtros() {
        let items = CalculatorCatalog.items(for: .otros)
        #expect(items.allSatisfy { $0.category == .otros })
    }

    @Test func allCategoriesCoverAllCalculators() {
        var total = 0
        for cat in CalculatorCategory.allCases where cat != .todas {
            total += CalculatorCatalog.items(for: cat).count
        }
        #expect(total == 35)
    }

    // MARK: - Search

    @Test func searchByTitleFindsMatch() {
        let results = CalculatorCatalog.search("renta")
        #expect(!results.isEmpty)
        #expect(results.contains { $0.id == "renta" })
    }

    @Test func searchByTagFindsMatch() {
        let results = CalculatorCatalog.search("4x1000")
        #expect(results.contains { $0.id == "gmf" })
    }

    @Test func searchByDescriptionFindsMatch() {
        let results = CalculatorCatalog.search("marginal")
        #expect(results.contains { $0.id == "renta" })
    }

    @Test func searchIsCaseInsensitive() {
        let lower = CalculatorCatalog.search("iva")
        let upper = CalculatorCatalog.search("IVA")
        #expect(lower.count == upper.count)
    }

    @Test func searchReturnsEmptyForNoMatch() {
        #expect(CalculatorCatalog.search("xyznonexistent").isEmpty)
    }

    // MARK: - Category Display Names

    @Test func allCategoriesHaveDisplayNames() {
        for cat in CalculatorCategory.allCases {
            #expect(!cat.displayName.isEmpty)
        }
    }

    @Test func todasDisplayNameIsTodas() {
        #expect(CalculatorCategory.todas.displayName == "Todas")
    }
}
