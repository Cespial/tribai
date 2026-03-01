import Foundation

@MainActor
@Observable
final class NovedadesViewModel {

    var searchText: String = ""
    var selectedTipo: NovedadTipo?
    var selectedImpacto: NovedadImpacto?

    var filteredNovedades: [NovedadNormativa] {
        NovedadesData.items
            .filter { novedad in
                if let tipo = selectedTipo, novedad.tipo != tipo { return false }
                if let impacto = selectedImpacto, novedad.impacto != impacto { return false }
                if !searchText.isEmpty {
                    let query = searchText.lowercased()
                    let matchesTitulo = novedad.titulo.lowercased().contains(query)
                    let matchesResumen = novedad.resumen.lowercased().contains(query)
                    let matchesTags = novedad.tags.contains { $0.lowercased().contains(query) }
                    if !matchesTitulo && !matchesResumen && !matchesTags { return false }
                }
                return true
            }
            .sorted { $0.fecha > $1.fecha }
    }

    var count: Int { filteredNovedades.count }
}
