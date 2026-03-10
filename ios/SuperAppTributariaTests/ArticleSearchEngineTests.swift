import Testing
import Foundation
@testable import SuperAppTributaria

struct ArticleSearchEngineTests {

    // MARK: - Helpers

    /// Creates a minimal ArticleIndexItem from JSON for testing.
    private func makeItem(
        id: String,
        titulo: String,
        libro: String = "Libro I",
        estado: ArticleStatus = .vigente,
        leyesModificatorias: [String] = []
    ) -> ArticleIndexItem {
        let json: [String: Any] = [
            "id": id,
            "slug": "art-\(id)",
            "titulo": titulo,
            "libro": libro,
            "libro_full": libro,
            "estado": estado.rawValue,
            "total_mods": 0,
            "total_refs": 0,
            "total_referenced_by": 0,
            "complexity": 1,
            "has_normas": false,
            "url": "/articulo/art-\(id)",
            "titulo_corto": titulo,
            "preview_snippet": titulo,
            "ultima_modificacion_year": 2022,
            "leyes_modificatorias": leyesModificatorias,
            "leyes_modificatorias_normalized": leyesModificatorias.map { $0.lowercased() },
            "total_normas": 0,
            "texto_derogado_count": 0,
            "has_derogado_text": false,
            "cross_references_valid_count": 0,
            "cross_references_invalid_count": 0,
            "referenced_by_valid_count": 0,
        ]
        let data = try! JSONSerialization.data(withJSONObject: json)
        return try! JSONDecoder().decode(ArticleIndexItem.self, from: data)
    }

    private var sampleItems: [ArticleIndexItem] {
        [
            makeItem(id: "240", titulo: "Tarifa general para personas juridicas"),
            makeItem(id: "241", titulo: "Tarifa para personas naturales residentes"),
            makeItem(id: "868", titulo: "Unidad de valor tributario UVT"),
            makeItem(id: "641", titulo: "Extemporaneidad en la presentacion", estado: .modificado),
            makeItem(id: "424", titulo: "Bienes excluidos del impuesto sobre ventas", libro: "Libro III"),
        ]
    }

    // MARK: - Search Tests

    @Test func emptyQueryReturnsAll() {
        let results = ArticleSearchEngine.search(articles: sampleItems, query: "")
        #expect(results.count == sampleItems.count)
    }

    @Test func whitespaceOnlyQueryReturnsAll() {
        let results = ArticleSearchEngine.search(articles: sampleItems, query: "   ")
        #expect(results.count == sampleItems.count)
    }

    @Test func searchByTitle() {
        let results = ArticleSearchEngine.search(articles: sampleItems, query: "UVT")
        #expect(results.count == 1)
        #expect(results[0].id == "868")
    }

    @Test func searchIsCaseInsensitive() {
        let results = ArticleSearchEngine.search(articles: sampleItems, query: "uvt")
        #expect(results.count == 1)
        #expect(results[0].id == "868")
    }

    @Test func searchIsDiacriticInsensitive() {
        let results = ArticleSearchEngine.search(articles: sampleItems, query: "juridicas")
        #expect(results.count >= 1)
        #expect(results.contains { $0.id == "240" })
    }

    @Test func searchById() {
        let results = ArticleSearchEngine.search(articles: sampleItems, query: "240")
        #expect(results.contains { $0.id == "240" })
    }

    @Test func searchNoResults() {
        let results = ArticleSearchEngine.search(articles: sampleItems, query: "xyznonexistent")
        #expect(results.isEmpty)
    }

    // MARK: - Filter Tests

    @Test func filterByLibro() {
        let results = ArticleSearchEngine.filter(
            articles: sampleItems,
            libro: "Libro III",
            estado: nil,
            ley: nil
        )
        #expect(results.count == 1)
        #expect(results[0].id == "424")
    }

    @Test func filterByEstado() {
        let results = ArticleSearchEngine.filter(
            articles: sampleItems,
            libro: nil,
            estado: "modificado",
            ley: nil
        )
        #expect(results.count == 1)
        #expect(results[0].id == "641")
    }

    @Test func filterWithNilFiltersReturnsAll() {
        let results = ArticleSearchEngine.filter(
            articles: sampleItems,
            libro: nil,
            estado: nil,
            ley: nil
        )
        #expect(results.count == sampleItems.count)
    }

    @Test func filterWithEmptyStringFiltersReturnsAll() {
        let results = ArticleSearchEngine.filter(
            articles: sampleItems,
            libro: "",
            estado: "",
            ley: ""
        )
        #expect(results.count == sampleItems.count)
    }

    @Test func filterByLey() {
        let items = [
            makeItem(id: "1", titulo: "Test", leyesModificatorias: ["Ley 2277 de 2022"]),
            makeItem(id: "2", titulo: "Test2", leyesModificatorias: ["Ley 2010 de 2019"]),
        ]
        let results = ArticleSearchEngine.filter(
            articles: items,
            libro: nil,
            estado: nil,
            ley: "2277"
        )
        #expect(results.count == 1)
        #expect(results[0].id == "1")
    }
}
