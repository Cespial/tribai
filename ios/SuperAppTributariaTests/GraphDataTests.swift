import Testing
import Foundation
@testable import SuperAppTributaria

struct GraphDataTests {

    // MARK: - GraphNode

    @Test func graphNodeDegreeIsSumOfRefs() {
        let node = GraphNode(id: "art-240", label: "240", titulo: "Tarifa", libro: "Libro I - Renta", estado: "vigente", complexity: 8, refsOut: 5, refsIn: 12)
        #expect(node.degree == 17)
    }

    @Test func graphNodeDegreeZeroWhenNoRefs() {
        let node = GraphNode(id: "art-1", label: "1", titulo: "Obj", libro: "Titulo Preliminar", estado: "vigente", complexity: 1, refsOut: 0, refsIn: 0)
        #expect(node.degree == 0)
    }

    // MARK: - LibroColor

    @Test func libroColorReturnsBlueForLibroI() {
        let color = LibroColor.color(for: "Libro I - Renta")
        #expect(color != LibroColor.color(for: "unknown"))
    }

    @Test func libroColorReturnsDefaultForUnknown() {
        // Default is gray 0x6B7280
        let unknown = LibroColor.color(for: "Libro Unknown")
        let prelim = LibroColor.color(for: "Título Preliminar")
        // Both should get the same gray fallback
        #expect(unknown == prelim)
    }

    @Test func allLibrosHas6Entries() {
        #expect(LibroColor.allLibros.count == 6)
    }

    @Test func shortNameForLibroI() {
        #expect(LibroColor.shortName(for: "Libro I - Renta") == "Renta")
    }

    @Test func shortNameForLibroII() {
        #expect(LibroColor.shortName(for: "Libro II - Retención") == "Retención")
    }

    @Test func shortNameForPreliminar() {
        #expect(LibroColor.shortName(for: "Título Preliminar") == "Prelim.")
    }

    @Test func shortNameForUnknownReturnsOriginal() {
        #expect(LibroColor.shortName(for: "Random") == "Random")
    }

    // MARK: - GraphNode Decoding

    @Test func graphNodeDecodesFromJSON() throws {
        let json = """
        {"id":"art-240","label":"240","titulo":"Tarifa general","libro":"Libro I - Renta","estado":"vigente","complexity":8,"refs_out":5,"refs_in":12}
        """
        let node = try JSONDecoder().decode(GraphNode.self, from: Data(json.utf8))
        #expect(node.id == "art-240")
        #expect(node.refsOut == 5)
        #expect(node.refsIn == 12)
        #expect(node.degree == 17)
    }

    @Test func graphEdgeDecodesFromJSON() throws {
        let json = """
        {"source":"art-240","target":"art-241"}
        """
        let edge = try JSONDecoder().decode(GraphEdge.self, from: Data(json.utf8))
        #expect(edge.source == "art-240")
        #expect(edge.target == "art-241")
    }
}
