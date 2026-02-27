import Foundation

struct ArticleDetail: Codable, Identifiable {
    let idArticulo: String
    let titulo: String
    let tituloCorto: String
    let slug: String
    let urlOrigen: String
    let libro: String
    let libroFull: String
    let estado: String
    let complexityScore: Int
    let contenidoTexto: String
    let contenidoHtml: String
    let modificacionesRaw: String
    let modificacionesParsed: [Modificacion]
    let totalModificaciones: Int
    let ultimaModificacionYear: Int?
    let leyesModificatorias: [String]
    let textoDerogado: [String]
    let textoDerogadoParsed: [TextoDerogadoParsed]
    let normasParsed: NormasParsed
    let totalNormas: Int
    let crossReferences: [String]
    let referencedBy: [String]
    let totalCrossReferences: Int
    let concordancias: String
    let doctrinaDianScrape: String
    let notasEditoriales: String
    let doctrinaVinculada: [DoctrinaItem]
    let jurisprudenciaVinculada: [JurisprudenciaItem]

    var id: String { idArticulo }

    enum CodingKeys: String, CodingKey {
        case titulo, slug, libro, estado, concordancias
        case idArticulo = "id_articulo"
        case tituloCorto = "titulo_corto"
        case urlOrigen = "url_origen"
        case libroFull = "libro_full"
        case complexityScore = "complexity_score"
        case contenidoTexto = "contenido_texto"
        case contenidoHtml = "contenido_html"
        case modificacionesRaw = "modificaciones_raw"
        case modificacionesParsed = "modificaciones_parsed"
        case totalModificaciones = "total_modificaciones"
        case ultimaModificacionYear = "ultima_modificacion_year"
        case leyesModificatorias = "leyes_modificatorias"
        case textoDerogado = "texto_derogado"
        case textoDerogadoParsed = "texto_derogado_parsed"
        case normasParsed = "normas_parsed"
        case totalNormas = "total_normas"
        case crossReferences = "cross_references"
        case referencedBy = "referenced_by"
        case totalCrossReferences = "total_cross_references"
        case doctrinaDianScrape = "doctrina_dian_scrape"
        case notasEditoriales = "notas_editoriales"
        case doctrinaVinculada = "doctrina_vinculada"
        case jurisprudenciaVinculada = "jurisprudencia_vinculada"
    }
}

struct Modificacion: Codable, Identifiable {
    let tipo: String
    let normaTipo: String?
    let normaNumero: String?
    let normaYear: Int?
    let normaArticulo: String?

    var id: String { "\(tipo)-\(normaTipo ?? "")-\(normaNumero ?? "")-\(normaYear ?? 0)" }

    enum CodingKeys: String, CodingKey {
        case tipo
        case normaTipo = "norma_tipo"
        case normaNumero = "norma_numero"
        case normaYear = "norma_year"
        case normaArticulo = "norma_articulo"
    }
}

struct TextoDerogadoParsed: Codable, Identifiable {
    let tipo: String?
    let norma: String?
    let texto: String?

    var id: String { "\(tipo ?? "")-\(norma ?? "")" }
}

struct NormasParsed: Codable {
    let jurisprudencia: [String]
    let decretos: [String]
    let doctrinaDian: [String]
    let notas: [String]
    let otros: [String]

    enum CodingKeys: String, CodingKey {
        case jurisprudencia, decretos, notas, otros
        case doctrinaDian = "doctrina_dian"
    }
}

struct DoctrinaItem: Codable, Identifiable {
    let id: String
    let tipo: String
    let numero: String
    let fecha: String
    let tema: String
    let vigente: Bool?
}

struct JurisprudenciaItem: Codable, Identifiable {
    let id: String
    let corte: String
    let tipo: String
    let numero: String
    let year: Int
    let decision: String?
}
