import Foundation

@MainActor
@Observable
final class DoctrinaViewModel {

    var searchText: String = ""
    var selectedTipo: DoctrinaTipoDoc?
    var showOnlyVigente: Bool = true

    // MARK: - Computed

    var filteredDoctrina: [DoctrinaCurada] {
        DoctrinaCuradaData.items.filter { doc in
            // Tipo filter
            if let tipo = selectedTipo, doc.tipoDocumento != tipo {
                return false
            }

            // Vigente filter
            if showOnlyVigente && !doc.vigente {
                return false
            }

            // Search filter
            if !searchText.isEmpty {
                let query = searchText.lowercased()
                let matchesTema = doc.tema.lowercased().contains(query)
                let matchesPregunta = doc.pregunta.lowercased().contains(query)
                let matchesDescriptores = doc.descriptores.contains { $0.lowercased().contains(query) }
                if !(matchesTema || matchesPregunta || matchesDescriptores) {
                    return false
                }
            }

            return true
        }
    }

    var count: Int { filteredDoctrina.count }
}
