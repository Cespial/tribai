import Foundation

struct ArticleIndexItem: Codable, Identifiable, Equatable {
    let id: String
    let slug: String
    let titulo: String
    let libro: String
    let libroFull: String
    let estado: String
    let totalMods: Int
    let totalRefs: Int
    let totalReferencedBy: Int
    let complexity: Int
    let hasNormas: Bool
    let url: String
    let tituloCorto: String
    let previewSnippet: String
    let ultimaModificacionYear: Int?
    let leyesModificatorias: [String]
    let leyesModificatoriasNormalized: [String]
    let totalNormas: Int
    let textoDerogadoCount: Int
    let hasDerogadoText: Bool
    let crossReferencesValidCount: Int
    let crossReferencesInvalidCount: Int
    let referencedByValidCount: Int

    enum CodingKeys: String, CodingKey {
        case id, slug, titulo, libro, estado, complexity, url
        case libroFull = "libro_full"
        case totalMods = "total_mods"
        case totalRefs = "total_refs"
        case totalReferencedBy = "total_referenced_by"
        case hasNormas = "has_normas"
        case tituloCorto = "titulo_corto"
        case previewSnippet = "preview_snippet"
        case ultimaModificacionYear = "ultima_modificacion_year"
        case leyesModificatorias = "leyes_modificatorias"
        case leyesModificatoriasNormalized = "leyes_modificatorias_normalized"
        case totalNormas = "total_normas"
        case textoDerogadoCount = "texto_derogado_count"
        case hasDerogadoText = "has_derogado_text"
        case crossReferencesValidCount = "cross_references_valid_count"
        case crossReferencesInvalidCount = "cross_references_invalid_count"
        case referencedByValidCount = "referenced_by_valid_count"
    }
}
