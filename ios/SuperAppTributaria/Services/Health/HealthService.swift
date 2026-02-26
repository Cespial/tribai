import Foundation

protocol HealthServiceProtocol: Sendable {
    func checkHealth() async -> HealthStatus
}

final class HealthService: HealthServiceProtocol {
    private let session: URLSession

    init(session: URLSession = .shared) {
        self.session = session
    }

    func checkHealth() async -> HealthStatus {
        var request = URLRequest(url: APIConfig.healthURL)
        request.timeoutInterval = APIConfig.Timeouts.healthCheck

        do {
            let (data, response) = try await session.data(for: request)

            guard let httpResponse = response as? HTTPURLResponse,
                  httpResponse.statusCode == 200 else {
                return .unhealthy
            }

            let healthResponse = try JSONDecoder().decode(HealthResponse.self, from: data)
            return healthResponse.status
        } catch {
            return .unhealthy
        }
    }
}
