import Foundation

@MainActor
@Observable
final class DashboardViewModel {

    // MARK: - State

    var stats: DashboardStats?

    // MARK: - Init

    init() {
        loadStats()
    }

    // MARK: - Data Loading

    func loadStats() {
        guard let url = Bundle.main.url(forResource: "dashboard-stats", withExtension: "json") else {
            return
        }
        do {
            let data = try Data(contentsOf: url)
            let decoder = JSONDecoder()
            stats = try decoder.decode(DashboardStats.self, from: data)
        } catch {
            #if DEBUG
            print("DashboardViewModel: Failed to load stats — \(error)")
            #endif
        }
    }
}
