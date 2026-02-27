import Foundation

@MainActor
@Observable
final class HomeViewModel {

    private let recentsKey = "recentCalculators"
    private let maxRecents = 6

    var recentCalculatorIds: [String] = []

    init() {
        loadRecents()
    }

    // MARK: - Features Grid

    struct FeatureItem: Identifiable {
        let id: String
        let title: String
        let description: String
        let sfSymbol: String
        let destination: FeatureDestination
    }

    enum FeatureDestination {
        case tab(ContentView.AppTab)
        case calculators
        case graph
    }

    var features: [FeatureItem] {
        [
            FeatureItem(id: "calculadoras", title: "Calculadoras", description: "35 herramientas tributarias", sfSymbol: "function", destination: .calculators),
            FeatureItem(id: "asistente", title: "Asistente IA", description: "Consultas sobre el ET", sfSymbol: "bubble.left.and.text.bubble.right", destination: .tab(.chat)),
            FeatureItem(id: "estatuto", title: "Estatuto Tributario", description: "1,294 articulos navegables", sfSymbol: "book", destination: .tab(.et)),
            FeatureItem(id: "calendario", title: "Calendario Fiscal", description: "Fechas y plazos 2026", sfSymbol: "calendar", destination: .tab(.more)),
            FeatureItem(id: "indicadores", title: "Indicadores", description: "UVT, SMLMV, tasas", sfSymbol: "chart.bar", destination: .tab(.more)),
            FeatureItem(id: "glosario", title: "Glosario", description: "Terminos tributarios", sfSymbol: "character.book.closed", destination: .tab(.more)),
            FeatureItem(id: "doctrina", title: "Doctrina DIAN", description: "Conceptos y oficios", sfSymbol: "doc.text.magnifyingglass", destination: .tab(.more)),
            FeatureItem(id: "guias", title: "Guias", description: "Paso a paso interactivas", sfSymbol: "list.bullet.clipboard", destination: .tab(.more)),
            FeatureItem(id: "noticias", title: "Novedades", description: "Reformas y cambios", sfSymbol: "newspaper", destination: .tab(.more)),
            FeatureItem(id: "grafo", title: "Grafo de Relaciones", description: "Mapa visual del ET", sfSymbol: "point.3.connected.trianglepath.dotted", destination: .graph),
        ]
    }

    // MARK: - Quick Access (Top calculators)

    var quickAccessCalculators: [CalculatorCatalogItem] {
        if recentCalculatorIds.isEmpty {
            return CalculatorCatalog.top5
        }
        return recentCalculatorIds.compactMap { CalculatorCatalog.item(byId: $0) }
    }

    // MARK: - Recents

    func trackCalculatorUsage(_ id: String) {
        recentCalculatorIds.removeAll { $0 == id }
        recentCalculatorIds.insert(id, at: 0)
        if recentCalculatorIds.count > maxRecents {
            recentCalculatorIds = Array(recentCalculatorIds.prefix(maxRecents))
        }
        saveRecents()
    }

    private func loadRecents() {
        recentCalculatorIds = UserDefaults.standard.stringArray(forKey: recentsKey) ?? []
    }

    private func saveRecents() {
        UserDefaults.standard.set(recentCalculatorIds, forKey: recentsKey)
    }
}
