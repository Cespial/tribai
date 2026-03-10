import Testing
import Foundation
@testable import SuperAppTributaria

struct AnalyticsServiceTests {

    // MARK: - clearAll

    @Test @MainActor func clearAllRemovesAllEvents() {
        let service = AnalyticsService()

        // Directly append events on the main actor
        service.track(event: "test_event_1")
        service.track(event: "test_event_2")

        // clearAll should empty everything
        service.clearAll()
        #expect(service.events.isEmpty)
        #expect(service.totalEventsTracked == 0)
    }

    @Test @MainActor func clearAllOnEmptyServiceIsNoOp() {
        let service = AnalyticsService()

        // Should not crash on empty
        service.clearAll()
        #expect(service.events.isEmpty)
        #expect(service.totalEventsTracked == 0)
    }

    @Test @MainActor func clearAllResetsCounter() {
        let service = AnalyticsService()
        service.clearAll()

        // After clearing, totalEventsTracked should be 0
        #expect(service.totalEventsTracked == 0)
    }
}
