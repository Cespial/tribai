import Foundation

struct SourceCitation: Codable, Identifiable, Equatable, Hashable {
    var id: String { idArticulo + (slug ?? "") }

    let idArticulo: String
    let titulo: String
    let url: String?
    let categoriaLibro: String?
    let relevanceScore: Double?
    let slug: String?
    let estado: ArticleStatus?
    let totalModificaciones: Int?
    let docType: String?
    let namespace: String?

    /// Convenience for views that need a libro display string.
    var libro: String { categoriaLibro ?? "" }

    init(
        idArticulo: String,
        titulo: String,
        url: String? = nil,
        categoriaLibro: String? = nil,
        relevanceScore: Double? = nil,
        slug: String? = nil,
        estado: ArticleStatus? = nil,
        totalModificaciones: Int? = nil,
        docType: String? = nil,
        namespace: String? = nil
    ) {
        self.idArticulo = idArticulo
        self.titulo = titulo
        self.url = url
        self.categoriaLibro = categoriaLibro
        self.relevanceScore = relevanceScore
        self.slug = slug
        self.estado = estado
        self.totalModificaciones = totalModificaciones
        self.docType = docType
        self.namespace = namespace
    }
}

enum ArticleStatus: String, Codable {
    case vigente
    case modificado
    case derogado
}
