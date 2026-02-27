import Foundation
import SwiftUI

struct GraphData: Decodable {
    let nodes: [GraphNode]
    let edges: [GraphEdge]

    static func load() -> GraphData? {
        guard let url = Bundle.main.url(forResource: "graph-data", withExtension: "json"),
              let data = try? Data(contentsOf: url),
              let graph = try? JSONDecoder().decode(GraphData.self, from: data)
        else { return nil }
        return graph
    }
}

struct GraphNode: Decodable, Identifiable, Equatable {
    let id: String
    let label: String
    let titulo: String
    let libro: String
    let estado: String
    let complexity: Int
    let refsOut: Int
    let refsIn: Int

    var degree: Int { refsOut + refsIn }

    enum CodingKeys: String, CodingKey {
        case id, label, titulo, libro, estado, complexity
        case refsOut = "refs_out"
        case refsIn = "refs_in"
    }
}

struct GraphEdge: Decodable, Equatable {
    let source: String
    let target: String
}

// MARK: - Libro Colors

enum LibroColor {
    static func color(for libro: String) -> Color {
        switch libro {
        case _ where libro.contains("Título Preliminar"):
            return Color(hex: 0x6B7280)
        case _ where libro.contains("Libro I"):
            return Color(hex: 0x1D4ED8)
        case _ where libro.contains("Libro II"):
            return Color(hex: 0xDC2626)
        case _ where libro.contains("Libro III"):
            return Color(hex: 0x16A34A)
        case _ where libro.contains("Libro IV"):
            return Color(hex: 0xA16207)
        case _ where libro.contains("Libro V"):
            return Color(hex: 0x7C3AED)
        case _ where libro.contains("Libro VI"):
            return Color(hex: 0x0E7490)
        default:
            return Color(hex: 0x6B7280)
        }
    }

    static let allLibros: [(name: String, shortName: String, color: Color)] = [
        ("Libro I - Renta", "Renta", Color(hex: 0x1D4ED8)),
        ("Libro II - Retención", "Retención", Color(hex: 0xDC2626)),
        ("Libro III - IVA", "IVA", Color(hex: 0x16A34A)),
        ("Libro IV - Timbre", "Timbre", Color(hex: 0xA16207)),
        ("Libro V - Procedimiento", "Procedim.", Color(hex: 0x7C3AED)),
        ("Libro VI - GMF", "GMF", Color(hex: 0x0E7490)),
    ]

    static func shortName(for libro: String) -> String {
        for item in allLibros where libro == item.name {
            return item.shortName
        }
        if libro.contains("Preliminar") { return "Prelim." }
        return libro
    }
}
