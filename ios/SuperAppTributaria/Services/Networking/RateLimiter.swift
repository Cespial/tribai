import Foundation

/// Client-side sliding window rate limiter.
/// Tracks request timestamps and enforces max requests per window.
actor RateLimiter {
    private let maxRequests: Int
    private let windowSeconds: TimeInterval
    private var timestamps: [Date] = []
    private var backoffUntil: Date?

    init(
        maxRequests: Int = AppConstants.RateLimit.maxRequests,
        windowSeconds: TimeInterval = AppConstants.RateLimit.windowSeconds
    ) {
        self.maxRequests = maxRequests
        self.windowSeconds = windowSeconds
    }

    /// Checks if a request can proceed. If not, returns the wait time.
    func canProceed() -> RateLimitResult {
        let now = Date()

        // Check server-imposed backoff
        if let backoff = backoffUntil, now < backoff {
            return .waitRequired(seconds: backoff.timeIntervalSince(now))
        }

        // Prune expired timestamps
        timestamps = timestamps.filter { now.timeIntervalSince($0) < windowSeconds }

        if timestamps.count < maxRequests {
            return .allowed
        }

        // Calculate wait time based on oldest timestamp in window
        guard let oldest = timestamps.first else { return .allowed }
        let waitTime = windowSeconds - now.timeIntervalSince(oldest) + 0.1
        return .waitRequired(seconds: max(0, waitTime))
    }

    /// Records a successful request.
    func recordRequest() {
        timestamps.append(Date())
    }

    /// Sets a server-imposed backoff (from Retry-After header or 429 response).
    func setBackoff(seconds: TimeInterval) {
        backoffUntil = Date().addingTimeInterval(seconds)
    }

    /// Calculates exponential backoff for retry attempt.
    func backoffInterval(attempt: Int) -> TimeInterval {
        let base = AppConstants.RateLimit.baseBackoffSeconds
        let maxBackoff = AppConstants.RateLimit.maxBackoffSeconds
        let delay = base * pow(2, Double(attempt - 1))
        let jitter = Double.random(in: 0...1)
        return min(delay + jitter, maxBackoff)
    }

    /// Resets the rate limiter state.
    func reset() {
        timestamps = []
        backoffUntil = nil
    }
}

enum RateLimitResult {
    case allowed
    case waitRequired(seconds: TimeInterval)
}
