import Foundation

struct ExplorerFacets: Codable, Sendable {
    let totalArticles: Int
    let libros: [FacetItem]
    let estados: [FacetItem]
    let modYears: [YearFacet]
    let laws: [FacetItem]
    let hasModsCount: Int
    let hasNormasCount: Int
    let hasDerogadoTextCount: Int

    enum CodingKeys: String, CodingKey {
        case libros, estados, laws
        case totalArticles = "total_articles"
        case modYears = "mod_years"
        case hasModsCount = "has_mods_count"
        case hasNormasCount = "has_normas_count"
        case hasDerogadoTextCount = "has_derogado_text_count"
    }
}

struct FacetItem: Codable, Identifiable, Sendable {
    let key: String
    let label: String
    let count: Int

    var id: String { key }
}

struct YearFacet: Codable, Identifiable, Sendable {
    let year: Int
    let count: Int

    var id: Int { year }
}
