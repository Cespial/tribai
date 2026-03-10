import Foundation

/// Centralized dependency injection container.
@MainActor
@Observable
final class AppEnvironment {
    let chatService: ChatServiceProtocol
    let healthService: HealthServiceProtocol
    let networkMonitor: NetworkMonitor
    let rateLimiter: RateLimiter
    let analyticsService: AnalyticsService

    var healthStatus: HealthStatus = .healthy

    private var healthCheckTask: Task<Void, Never>?

    init(
        chatService: ChatServiceProtocol? = nil,
        healthService: HealthServiceProtocol? = nil,
        networkMonitor: NetworkMonitor? = nil,
        rateLimiter: RateLimiter? = nil,
        analyticsService: AnalyticsService? = nil
    ) {
        let limiter = rateLimiter ?? RateLimiter()
        self.rateLimiter = limiter
        self.chatService = chatService ?? ChatService(rateLimiter: limiter)
        self.healthService = healthService ?? HealthService()
        self.networkMonitor = networkMonitor ?? NetworkMonitor()
        self.analyticsService = analyticsService ?? AnalyticsService()
    }

    func startHealthPolling() {
        healthCheckTask?.cancel()
        let healthService = self.healthService
        healthCheckTask = Task { [weak self] in
            while !Task.isCancelled {
                let status = await healthService.checkHealth()
                await MainActor.run { [weak self] in
                    self?.healthStatus = status
                }
                try? await Task.sleep(for: .seconds(AppConstants.Health.pollingInterval))
            }
        }
    }

    func stopHealthPolling() {
        healthCheckTask?.cancel()
        healthCheckTask = nil
    }
}
