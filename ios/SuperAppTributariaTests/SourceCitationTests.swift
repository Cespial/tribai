import Testing
import Foundation
@testable import SuperAppTributaria

struct SourceCitationTests {

    // MARK: - Initialization

    @Test func basicInit() {
        let citation = SourceCitation(
            idArticulo: "Art. 240",
            titulo: "Tarifa general"
        )
        #expect(citation.idArticulo == "Art. 240")
        #expect(citation.titulo == "Tarifa general")
        #expect(citation.url == nil)
        #expect(citation.categoriaLibro == nil)
        #expect(citation.relevanceScore == nil)
        #expect(citation.slug == nil)
        #expect(citation.estado == nil)
        #expect(citation.docType == nil)
        #expect(citation.namespace == nil)
    }

    @Test func fullInit() {
        let citation = SourceCitation(
            idArticulo: "Art. 241",
            titulo: "Tarifa para personas naturales",
            url: "https://example.com",
            categoriaLibro: "Libro I - Renta",
            relevanceScore: 0.95,
            slug: "art-241",
            estado: .vigente,
            totalModificaciones: 5,
            docType: "article",
            namespace: ""
        )
        #expect(citation.url == "https://example.com")
        #expect(citation.categoriaLibro == "Libro I - Renta")
        #expect(citation.relevanceScore == 0.95)
        #expect(citation.slug == "art-241")
        #expect(citation.estado == .vigente)
        #expect(citation.totalModificaciones == 5)
    }

    // MARK: - Computed Properties

    @Test func idCombinesArticuloAndSlug() {
        let citation = SourceCitation(
            idArticulo: "Art. 240",
            titulo: "Test",
            slug: "art-240"
        )
        #expect(citation.id == "Art. 240art-240")
    }

    @Test func idWithoutSlug() {
        let citation = SourceCitation(
            idArticulo: "Art. 240",
            titulo: "Test"
        )
        #expect(citation.id == "Art. 240")
    }

    @Test func libroReturnsCategoria() {
        let citation = SourceCitation(
            idArticulo: "Art. 240",
            titulo: "Test",
            categoriaLibro: "Libro I - Renta"
        )
        #expect(citation.libro == "Libro I - Renta")
    }

    @Test func libroReturnsEmptyWhenNoCategoria() {
        let citation = SourceCitation(
            idArticulo: "Art. 240",
            titulo: "Test"
        )
        #expect(citation.libro == "")
    }

    // MARK: - ArticleStatus

    @Test func articleStatusVigente() {
        #expect(ArticleStatus.vigente.rawValue == "vigente")
    }

    @Test func articleStatusModificado() {
        #expect(ArticleStatus.modificado.rawValue == "modificado")
    }

    @Test func articleStatusDerogado() {
        #expect(ArticleStatus.derogado.rawValue == "derogado")
    }

    // MARK: - Equatable

    @Test func equalCitations() {
        let a = SourceCitation(idArticulo: "Art. 240", titulo: "T", slug: "art-240")
        let b = SourceCitation(idArticulo: "Art. 240", titulo: "T", slug: "art-240")
        #expect(a == b)
    }

    @Test func differentCitations() {
        let a = SourceCitation(idArticulo: "Art. 240", titulo: "T")
        let b = SourceCitation(idArticulo: "Art. 241", titulo: "T")
        #expect(a != b)
    }

    // MARK: - Codable

    @Test func encodesAndDecodes() throws {
        let original = SourceCitation(
            idArticulo: "Art. 240",
            titulo: "Tarifa general",
            url: "https://example.com",
            categoriaLibro: "Libro I",
            relevanceScore: 0.85,
            slug: "art-240",
            estado: .vigente,
            totalModificaciones: 3,
            docType: "article",
            namespace: ""
        )
        let data = try JSONEncoder().encode(original)
        let decoded = try JSONDecoder().decode(SourceCitation.self, from: data)

        #expect(decoded.idArticulo == original.idArticulo)
        #expect(decoded.titulo == original.titulo)
        #expect(decoded.estado == original.estado)
        #expect(decoded.relevanceScore == original.relevanceScore)
    }
}
