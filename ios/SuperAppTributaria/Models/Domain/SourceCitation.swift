import Foundation

struct SourceCitation: Codable, Identifiable, Equatable, Hashable {
    var id: String { idArticulo + slug }

    let idArticulo: String
    let titulo: String
    let slug: String
    let contenidoTexto: String
    let libro: String
    let estado: ArticleStatus

    enum CodingKeys: String, CodingKey {
        case idArticulo
        case titulo
        case slug
        case contenidoTexto = "contenido_texto"
        case libro
        case estado
    }
}

enum ArticleStatus: String, Codable {
    case vigente
    case modificado
    case derogado
}
