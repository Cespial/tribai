import Foundation

@MainActor
@Observable
final class DashboardViewModel {

    // MARK: - State

    var stats: DashboardStats?
    var loadError: String?

    // MARK: - Init

    init() {
        loadStats()
    }

    // MARK: - Data Loading

    func loadStats() {
        loadError = nil
        guard let url = Bundle.main.url(forResource: "dashboard-stats", withExtension: "json") else {
            loadError = "No se encontro el archivo de estadisticas."
            return
        }
        do {
            let data = try Data(contentsOf: url)
            let decoder = JSONDecoder()
            stats = try decoder.decode(DashboardStats.self, from: data)
        } catch {
            loadError = "Error al cargar estadisticas: \(error.localizedDescription)"
            #if DEBUG
            print("DashboardViewModel: Failed to load stats — \(error)")
            #endif
        }
    }
}
