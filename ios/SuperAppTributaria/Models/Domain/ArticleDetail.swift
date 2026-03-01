import Foundation

struct ArticleDetail: Codable, Identifiable, Sendable {
    let idArticulo: String
    let titulo: String
    let tituloCorto: String
    let slug: String
    let urlOrigen: String
    let libro: String
    let libroFull: String
    let estado: ArticleStatus
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

    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        idArticulo = try c.decode(String.self, forKey: .idArticulo)
        titulo = try c.decode(String.self, forKey: .titulo)
        tituloCorto = try c.decode(String.self, forKey: .tituloCorto)
        slug = try c.decode(String.self, forKey: .slug)
        urlOrigen = try c.decode(String.self, forKey: .urlOrigen)
        libro = try c.decode(String.self, forKey: .libro)
        libroFull = try c.decode(String.self, forKey: .libroFull)
        estado = try c.decode(ArticleStatus.self, forKey: .estado)
        complexityScore = try c.decode(Int.self, forKey: .complexityScore)
        contenidoTexto = try c.decode(String.self, forKey: .contenidoTexto)
        contenidoHtml = try c.decode(String.self, forKey: .contenidoHtml)
        modificacionesRaw = try c.decode(String.self, forKey: .modificacionesRaw)
        modificacionesParsed = try c.decode([Modificacion].self, forKey: .modificacionesParsed)
        totalModificaciones = try c.decode(Int.self, forKey: .totalModificaciones)
        ultimaModificacionYear = try c.decodeIfPresent(Int.self, forKey: .ultimaModificacionYear)
        leyesModificatorias = try c.decode([String].self, forKey: .leyesModificatorias)
        textoDerogado = try c.decode([String].self, forKey: .textoDerogado)
        textoDerogadoParsed = try c.decodeIfPresent([TextoDerogadoParsed].self, forKey: .textoDerogadoParsed) ?? []
        normasParsed = try c.decode(NormasParsed.self, forKey: .normasParsed)
        totalNormas = try c.decode(Int.self, forKey: .totalNormas)
        crossReferences = try c.decode([String].self, forKey: .crossReferences)
        referencedBy = try c.decode([String].self, forKey: .referencedBy)
        totalCrossReferences = try c.decode(Int.self, forKey: .totalCrossReferences)
        concordancias = try c.decode(String.self, forKey: .concordancias)
        doctrinaDianScrape = try c.decode(String.self, forKey: .doctrinaDianScrape)
        notasEditoriales = try c.decode(String.self, forKey: .notasEditoriales)
        // These fields may not exist in all article JSONs
        doctrinaVinculada = try c.decodeIfPresent([DoctrinaItem].self, forKey: .doctrinaVinculada) ?? []
        jurisprudenciaVinculada = try c.decodeIfPresent([JurisprudenciaItem].self, forKey: .jurisprudenciaVinculada) ?? []
    }
}

struct Modificacion: Codable, Identifiable, Sendable {
    let tipo: String
    let normaTipo: String?
    let normaNumero: String?
    let normaYear: Int?
    let normaArticulo: String?

    var id: String { "\(tipo)-\(normaTipo ?? "")-\(normaNumero ?? "")-\(normaYear ?? 0)-\(normaArticulo ?? "")" }

    enum CodingKeys: String, CodingKey {
        case tipo
        case normaTipo = "norma_tipo"
        case normaNumero = "norma_numero"
        case normaYear = "norma_year"
        case normaArticulo = "norma_articulo"
    }
}

struct TextoDerogadoParsed: Codable, Identifiable, Sendable {
    let index: Int
    let snippet: String
    let fullLength: Int

    var id: Int { index }

    enum CodingKeys: String, CodingKey {
        case index, snippet
        case fullLength = "full_length"
    }
}

struct NormasParsed: Codable, Sendable {
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

struct DoctrinaItem: Codable, Identifiable, Sendable {
    let id: String
    let tipo: String
    let numero: String
    let fecha: String
    let tema: String
    let vigente: Bool?
}

struct JurisprudenciaItem: Codable, Identifiable, Sendable {
    let id: String
    let corte: String
    let tipo: String
    let numero: String
    let year: Int
    let decision: String?
}

// MARK: - HTML Entity Decoding

extension String {
    var decodingHTMLEntities: String {
        guard contains("&") else { return self }
        var result = self
        let entities: [(String, String)] = [
            ("&amp;", "&"), ("&lt;", "<"), ("&gt;", ">"),
            ("&quot;", "\""), ("&apos;", "'"),
            ("&aacute;", "a\u{0301}"), ("&eacute;", "e\u{0301}"),
            ("&iacute;", "i\u{0301}"), ("&oacute;", "o\u{0301}"),
            ("&uacute;", "u\u{0301}"), ("&ntilde;", "n\u{0303}"),
            ("&Aacute;", "A\u{0301}"), ("&Eacute;", "E\u{0301}"),
            ("&Iacute;", "I\u{0301}"), ("&Oacute;", "O\u{0301}"),
            ("&Uacute;", "U\u{0301}"), ("&Ntilde;", "N\u{0303}"),
            ("&iquest;", "\u{00BF}"), ("&iexcl;", "\u{00A1}"),
            ("&uuml;", "u\u{0308}"), ("&Uuml;", "U\u{0308}"),
            ("&nbsp;", " "),
        ]
        for (entity, replacement) in entities {
            result = result.replacingOccurrences(of: entity, with: replacement)
        }
        return result
    }
}
