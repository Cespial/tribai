import Foundation

struct ArticleIndexItem: Codable, Identifiable, Equatable, Sendable {
    let id: String
    let slug: String
    let titulo: String
    let libro: String
    let libroFull: String
    let estado: ArticleStatus
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

    /// Pre-computed normalized search text for diacritic-insensitive search
    let searchableText: String

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

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decode(String.self, forKey: .id)
        slug = try container.decode(String.self, forKey: .slug)
        titulo = try container.decode(String.self, forKey: .titulo)
        libro = try container.decode(String.self, forKey: .libro)
        libroFull = try container.decode(String.self, forKey: .libroFull)
        estado = try container.decode(ArticleStatus.self, forKey: .estado)
        totalMods = try container.decode(Int.self, forKey: .totalMods)
        totalRefs = try container.decode(Int.self, forKey: .totalRefs)
        totalReferencedBy = try container.decode(Int.self, forKey: .totalReferencedBy)
        complexity = try container.decode(Int.self, forKey: .complexity)
        hasNormas = try container.decode(Bool.self, forKey: .hasNormas)
        url = try container.decode(String.self, forKey: .url)
        tituloCorto = try container.decode(String.self, forKey: .tituloCorto)
        previewSnippet = try container.decode(String.self, forKey: .previewSnippet)
        ultimaModificacionYear = try container.decodeIfPresent(Int.self, forKey: .ultimaModificacionYear)
        leyesModificatorias = try container.decode([String].self, forKey: .leyesModificatorias)
        leyesModificatoriasNormalized = try container.decode([String].self, forKey: .leyesModificatoriasNormalized)
        totalNormas = try container.decode(Int.self, forKey: .totalNormas)
        textoDerogadoCount = try container.decode(Int.self, forKey: .textoDerogadoCount)
        hasDerogadoText = try container.decode(Bool.self, forKey: .hasDerogadoText)
        crossReferencesValidCount = try container.decode(Int.self, forKey: .crossReferencesValidCount)
        crossReferencesInvalidCount = try container.decode(Int.self, forKey: .crossReferencesInvalidCount)
        referencedByValidCount = try container.decode(Int.self, forKey: .referencedByValidCount)

        // Pre-compute normalized search text once at decode time
        searchableText = [id, titulo, tituloCorto, previewSnippet, slug]
            .joined(separator: " ")
            .folding(options: [.diacriticInsensitive, .caseInsensitive], locale: .current)
    }
}
