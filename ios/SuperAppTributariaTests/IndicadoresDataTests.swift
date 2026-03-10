import Testing
import Foundation
@testable import SuperAppTributaria

struct IndicadoresDataTests {

    // MARK: - Item Count

    @Test func itemsHas9Entries() {
        #expect(IndicadoresData.items.count == 9)
    }

    // MARK: - IDs Unique

    @Test func allIdsAreUnique() {
        let ids = IndicadoresData.items.map(\.id)
        #expect(ids.count == Set(ids).count)
    }

    // MARK: - Known Indicators

    @Test func uvtIndicator() {
        let uvt = IndicadoresData.items.first { $0.id == "uvt" }
        #expect(uvt != nil)
        #expect(uvt?.valorNumerico == 52374)
        #expect(uvt?.categoria == .tributarios)
    }

    @Test func smlmvIndicator() {
        let smlmv = IndicadoresData.items.first { $0.id == "smlmv" }
        #expect(smlmv != nil)
        #expect(smlmv?.valorNumerico == 1750905)
        #expect(smlmv?.categoria == .laborales)
    }

    @Test func auxilioTransporteIndicator() {
        let aux = IndicadoresData.items.first { $0.id == "auxilio-transporte" }
        #expect(aux != nil)
        #expect(aux?.valorNumerico == 249095)
    }

    @Test func trmIndicator() {
        let trm = IndicadoresData.items.first { $0.id == "trm" }
        #expect(trm != nil)
        #expect(trm?.categoria == .financieros)
    }

    // MARK: - Destacados

    @Test func destacadosHas4Items() {
        #expect(IndicadoresData.destacadosIds.count == 4)
    }

    @Test func destacadosContainUVTAndSMLMV() {
        #expect(IndicadoresData.destacadosIds.contains("uvt"))
        #expect(IndicadoresData.destacadosIds.contains("smlmv"))
    }

    @Test func allDestacadosExistInItems() {
        let itemIds = Set(IndicadoresData.items.map(\.id))
        for id in IndicadoresData.destacadosIds {
            #expect(itemIds.contains(id), "\(id) not found in items")
        }
    }

    // MARK: - History

    @Test func allIndicatorsHaveHistory() {
        for item in IndicadoresData.items {
            #expect(!item.history.isEmpty, "\(item.id) has empty history")
        }
    }

    @Test func uvtHistoryContains2026() {
        let uvt = IndicadoresData.items.first { $0.id == "uvt" }!
        let has2026 = uvt.history.contains { $0.periodo == "2026" }
        #expect(has2026)
    }

    // MARK: - Categories

    @Test func categoriasContainAllCases() {
        #expect(IndicadoresData.categorias.count == IndicadorCategoria.allCases.count)
    }

    // MARK: - Calculator Links

    @Test func indicatorsHaveCalculatorIds() {
        let uvt = IndicadoresData.items.first { $0.id == "uvt" }!
        #expect(!uvt.calculatorIds.isEmpty)
    }

    // MARK: - Metadata

    @Test func lastUpdateIsSet() {
        #expect(!IndicadoresData.lastUpdate.isEmpty)
    }
}
