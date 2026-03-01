import Foundation

@MainActor
@Observable
final class IndicadoresViewModel {

    var selectedCategoria: IndicadorCategoria?

    var filteredIndicadores: [IndicadorItem] {
        if let categoria = selectedCategoria {
            return IndicadoresData.items.filter { $0.categoria == categoria }
        }
        return IndicadoresData.items
    }

    var count: Int { filteredIndicadores.count }
}
