import Testing
@testable import SuperAppTributaria

struct RateLimiterTests {
    @Test func allowsRequestsUnderLimit() async {
        let limiter = RateLimiter(maxRequests: 5, windowSeconds: 60)

        for _ in 0..<5 {
            let result = await limiter.canProceed()
            guard case .allowed = result else {
                Issue.record("Expected .allowed")
                return
            }
            await limiter.recordRequest()
        }
    }

    @Test func blocksRequestsAtLimit() async {
        let limiter = RateLimiter(maxRequests: 3, windowSeconds: 60)

        for _ in 0..<3 {
            await limiter.recordRequest()
        }

        let result = await limiter.canProceed()
        guard case .waitRequired(let seconds) = result else {
            Issue.record("Expected .waitRequired, got \(result)")
            return
        }
        #expect(seconds > 0)
    }

    @Test func respectsServerBackoff() async {
        let limiter = RateLimiter(maxRequests: 20, windowSeconds: 60)
        await limiter.setBackoff(seconds: 10)

        let result = await limiter.canProceed()
        guard case .waitRequired(let seconds) = result else {
            Issue.record("Expected .waitRequired due to backoff")
            return
        }
        #expect(seconds > 0)
        #expect(seconds <= 10)
    }

    @Test func calculatesExponentialBackoff() async {
        let limiter = RateLimiter()

        let first = await limiter.backoffInterval(attempt: 1)
        let second = await limiter.backoffInterval(attempt: 2)
        let third = await limiter.backoffInterval(attempt: 3)

        // Exponential growth (with jitter, so approximate)
        #expect(first >= 2 && first <= 4)
        #expect(second >= 4 && second <= 6)
        #expect(third >= 8 && third <= 10)
    }

    @Test func capsBackoffAtMaximum() async {
        let limiter = RateLimiter()

        let backoff = await limiter.backoffInterval(attempt: 20)
        #expect(backoff <= 61) // maxBackoff (60) + max jitter (1)
    }

    @Test func resetClearsState() async {
        let limiter = RateLimiter(maxRequests: 1, windowSeconds: 60)
        await limiter.recordRequest()

        let beforeReset = await limiter.canProceed()
        guard case .waitRequired = beforeReset else {
            Issue.record("Expected .waitRequired before reset")
            return
        }

        await limiter.reset()

        let afterReset = await limiter.canProceed()
        guard case .allowed = afterReset else {
            Issue.record("Expected .allowed after reset")
            return
        }
    }
}
