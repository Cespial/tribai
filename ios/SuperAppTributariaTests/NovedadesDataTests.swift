import Testing
import Foundation
@testable import SuperAppTributaria

struct NovedadesDataTests {

    // MARK: - Item Count

    @Test func itemsHas28Entries() {
        // File comments say 28 entries
        #expect(!NovedadesData.items.isEmpty)
    }

    // MARK: - IDs Unique

    @Test func allIdsAreUnique() {
        let ids = NovedadesData.items.map(\.id)
        #expect(ids.count == Set(ids).count)
    }

    // MARK: - Tipo Names

    @Test func tipoNamesNotEmpty() {
        #expect(!NovedadesData.tipoNames.isEmpty)
    }

    @Test func tipoNamesMatchAllCases() {
        #expect(NovedadesData.tipoNames.count == NovedadTipo.allCases.count)
    }

    // MARK: - Known Items

    @Test func containsLey2277() {
        let ley = NovedadesData.items.first { $0.numero == "2277 de 2022" }
        #expect(ley != nil)
        #expect(ley?.tipo == .ley)
        #expect(ley?.impacto == .alto)
    }

    @Test func containsCalendario2026() {
        let cal = NovedadesData.items.first { $0.id == "nov-001" }
        #expect(cal != nil)
        #expect(cal?.tipo == .resolucion)
        #expect(cal?.fuente == "DIAN")
    }

    // MARK: - Structure Validation

    @Test func allItemsHaveNonEmptyTitulo() {
        for item in NovedadesData.items {
            #expect(!item.titulo.isEmpty, "\(item.id) has empty titulo")
        }
    }

    @Test func allItemsHaveNonEmptyResumen() {
        for item in NovedadesData.items {
            #expect(!item.resumen.isEmpty, "\(item.id) has empty resumen")
        }
    }

    @Test func allItemsHaveValidFecha() {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        for item in NovedadesData.items {
            let date = formatter.date(from: item.fecha)
            #expect(date != nil, "Invalid date: \(item.fecha) for \(item.id)")
        }
    }

    @Test func allItemsHaveNonEmptyTags() {
        for item in NovedadesData.items {
            #expect(!item.tags.isEmpty, "\(item.id) has empty tags")
        }
    }

    // MARK: - Impact Distribution

    @Test func hasHighImpactItems() {
        let high = NovedadesData.items.filter { $0.impacto == .alto }
        #expect(!high.isEmpty)
    }

    @Test func hasMediumImpactItems() {
        let medium = NovedadesData.items.filter { $0.impacto == .medio }
        #expect(!medium.isEmpty)
    }

    // MARK: - Metadata

    @Test func lastUpdateIsSet() {
        #expect(!NovedadesData.lastUpdate.isEmpty)
    }
}
