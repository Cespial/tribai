import Foundation

@MainActor @Observable
final class GlobalSearchViewModel {

    var query = ""
    var isSearching = false

    struct SearchResult: Identifiable {
        let id = UUID()
        let title: String
        let subtitle: String
        let category: ResultCategory
        let destination: SearchDestination
    }

    enum ResultCategory: String {
        case calculadora = "Calculadoras"
        case articulo = "Articulos ET"
        case calendario = "Calendario"
        case glosario = "Glosario"
    }

    enum SearchDestination {
        case calculator(String)
        case article(String)
        case calendar
        case glossary(String)
    }

    var results: [SearchResult] = []

    var groupedResults: [(category: ResultCategory, items: [SearchResult])] {
        let grouped = Dictionary(grouping: results) { $0.category }
        let order: [ResultCategory] = [.calculadora, .articulo, .calendario, .glosario]
        return order.compactMap { cat in
            guard let items = grouped[cat], !items.isEmpty else { return nil }
            return (cat, items)
        }
    }

    func search() {
        guard query.count >= 2 else {
            results = []
            return
        }
        isSearching = true

        let q = query.lowercased()
        var found: [SearchResult] = []

        // Search calculators
        let calculatorNames: [(name: String, id: String)] = [
            ("Renta Personas Naturales", "renta"), ("IVA", "iva"),
            ("Retencion en la Fuente", "retencion"), ("Nomina y Laboral", "laboral"),
            ("Patrimonio", "patrimonio"), ("Regimen SIMPLE", "simple"),
            ("Sanciones Tributarias", "sanciones"), ("GMF 4x1000", "gmf"),
            ("ICA", "ica"), ("Dividendos PJ", "dividendos-pj"),
            ("Descuentos Tributarios", "descuentos"), ("Comparador Contratacion", "comparador"),
            ("Conversor UVT", "uvt"), ("Debo Declarar Renta", "debo-declarar"),
            ("Ganancias Ocasionales", "ganancias"), ("Herencias", "herencias"),
            ("Timbre", "timbre"), ("Anticipo Renta", "anticipo"),
            ("Depreciacion Fiscal", "depreciacion"), ("Impuesto al Consumo", "consumo"),
            ("Renta PJ", "renta-pj"), ("Beneficio Auditoria", "auditoria"),
            ("Dividendos PN", "dividendos-pn"), ("Pension", "pension"),
        ]

        for calc in calculatorNames {
            if calc.name.lowercased().contains(q) || calc.id.contains(q) {
                found.append(SearchResult(
                    title: calc.name,
                    subtitle: "Calculadora fiscal",
                    category: .calculadora,
                    destination: .calculator(calc.id)
                ))
            }
        }

        // Search glossary
        let glossaryTerms = GlosarioData.terminos
        for term in glossaryTerms {
            if term.termino.lowercased().contains(q) {
                found.append(SearchResult(
                    title: term.termino,
                    subtitle: String(term.definicion.prefix(80)),
                    category: .glosario,
                    destination: .glossary(term.termino)
                ))
            }
        }

        // Search calendario
        let deadlines = CalendarioData.obligaciones
        for deadline in deadlines {
            if deadline.obligacion.lowercased().contains(q) {
                found.append(SearchResult(
                    title: deadline.obligacion,
                    subtitle: "Calendario Fiscal",
                    category: .calendario,
                    destination: .calendar
                ))
            }
        }

        results = found
        isSearching = false
    }
}
