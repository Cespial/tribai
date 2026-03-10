import Testing
import Foundation
@testable import SuperAppTributaria

struct RetencionTablaDataTests {

    // MARK: - Concept Count

    @Test func conceptosHas32Entries() {
        #expect(RetencionTablaData.conceptos.count == 32)
    }

    // MARK: - IDs Unique

    @Test func allIdsAreUnique() {
        let ids = RetencionTablaData.conceptos.map(\.id)
        #expect(ids.count == Set(ids).count)
    }

    // MARK: - Categories

    @Test func categoriesNotEmpty() {
        #expect(!RetencionTablaData.categories.isEmpty)
    }

    @Test func categoriesAreSorted() {
        let cats = RetencionTablaData.categories
        #expect(cats == cats.sorted())
    }

    @Test func categoriesContainCompras() {
        #expect(RetencionTablaData.categories.contains("Compras"))
    }

    @Test func categoriesContainServicios() {
        #expect(RetencionTablaData.categories.contains("Servicios"))
    }

    @Test func categoriesContainHonorarios() {
        #expect(RetencionTablaData.categories.contains("Honorarios"))
    }

    // MARK: - Known Concepts

    @Test func comprasGeneralDeclarantes() {
        let c = RetencionTablaData.conceptos.first { $0.id == "compras-general" }
        #expect(c != nil)
        #expect(c?.baseMinUVT == 27)
        #expect(c?.tarifa == Decimal(string: "0.025")!)
        #expect(c?.aplicaA == "declarante")
        #expect(c?.articulo == "401")
    }

    @Test func serviciosGeneralDeclarantes() {
        let c = RetencionTablaData.conceptos.first { $0.id == "servicios-general-d" }
        #expect(c != nil)
        #expect(c?.tarifa == Decimal(string: "0.04")!)
    }

    @Test func honorariosDeclarantes() {
        let c = RetencionTablaData.conceptos.first { $0.id == "honorarios-d" }
        #expect(c != nil)
        #expect(c?.tarifa == Decimal(string: "0.10")!)
    }

    @Test func dividendosPN() {
        let c = RetencionTablaData.conceptos.first { $0.id == "dividendos-pn" }
        #expect(c != nil)
        #expect(c?.tarifa == Decimal(string: "0.20")!)
    }

    // MARK: - Tarifa Validation

    @Test func allTarifasAreNonNegative() {
        for c in RetencionTablaData.conceptos {
            #expect(c.tarifa >= 0, "\(c.id) has negative tarifa")
        }
    }

    @Test func allTarifasAreLessThanOrEqualTo1() {
        for c in RetencionTablaData.conceptos {
            #expect(c.tarifa <= 1, "\(c.id) has tarifa > 1")
        }
    }

    @Test func allBaseMinUVTAreNonNegative() {
        for c in RetencionTablaData.conceptos {
            #expect(c.baseMinUVT >= 0, "\(c.id) has negative baseMinUVT")
        }
    }

    // MARK: - Computed Categoria

    @Test func computedCategoriaForCompras() {
        let c = RetencionTablaData.conceptos.first { $0.id == "compras-general" }!
        #expect(c.categoria == "Compras")
    }

    @Test func computedCategoriaForServicios() {
        let c = RetencionTablaData.conceptos.first { $0.id == "servicios-general-d" }!
        #expect(c.categoria == "Servicios")
    }

    @Test func computedCategoriaForArriendo() {
        let c = RetencionTablaData.conceptos.first { $0.id == "arriendo-inmuebles" }!
        #expect(c.categoria == "Arrendamientos")
    }

    @Test func computedCategoriaForOtros() {
        let c = RetencionTablaData.conceptos.first { $0.id == "pagos-exterior" }!
        #expect(c.categoria == "Otros")
    }

    // MARK: - Keywords

    @Test func allConceptosHaveKeywords() {
        for c in RetencionTablaData.conceptos {
            #expect(!c.keywords.isEmpty, "\(c.id) has no keywords")
        }
    }

    // MARK: - Metadata

    @Test func lastUpdateIsSet() {
        #expect(!RetencionTablaData.lastUpdate.isEmpty)
    }
}
