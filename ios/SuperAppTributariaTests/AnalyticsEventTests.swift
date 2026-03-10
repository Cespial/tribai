import Testing
import Foundation
@testable import SuperAppTributaria

struct AnalyticsEventTests {

    // MARK: - Initialization

    @Test func defaultInit() {
        let event = AnalyticsEvent(name: "test_event")
        #expect(event.name == "test_event")
        #expect(event.properties.isEmpty)
        #expect(!event.id.isEmpty)
    }

    @Test func initWithProperties() {
        let event = AnalyticsEvent(
            name: "screen_view",
            properties: ["screen_name": "home"]
        )
        #expect(event.name == "screen_view")
        #expect(event.properties["screen_name"] == "home")
    }

    @Test func initWithCustomId() {
        let event = AnalyticsEvent(id: "custom-id", name: "test")
        #expect(event.id == "custom-id")
    }

    @Test func initWithTimestamp() {
        let now = Date()
        let event = AnalyticsEvent(name: "test", timestamp: now)
        #expect(event.timestamp == now)
    }

    // MARK: - Predefined Names

    @Test func predefinedNamesExist() {
        #expect(AnalyticsEvent.Name.screenView == "screen_view")
        #expect(AnalyticsEvent.Name.calculatorUsed == "calculator_used")
        #expect(AnalyticsEvent.Name.chatMessageSent == "chat_message_sent")
        #expect(AnalyticsEvent.Name.appError == "app_error")
        #expect(AnalyticsEvent.Name.appLaunched == "app_launched")
        #expect(AnalyticsEvent.Name.tabChanged == "tab_changed")
        #expect(AnalyticsEvent.Name.searchPerformed == "search_performed")
        #expect(AnalyticsEvent.Name.articleViewed == "article_viewed")
    }

    // MARK: - Property Keys

    @Test func propertyKeysExist() {
        #expect(AnalyticsEvent.PropertyKey.screenName == "screen_name")
        #expect(AnalyticsEvent.PropertyKey.calculatorName == "calculator_name")
        #expect(AnalyticsEvent.PropertyKey.errorDescription == "error_description")
        #expect(AnalyticsEvent.PropertyKey.errorContext == "error_context")
        #expect(AnalyticsEvent.PropertyKey.tabName == "tab_name")
        #expect(AnalyticsEvent.PropertyKey.searchQuery == "search_query")
        #expect(AnalyticsEvent.PropertyKey.articleSlug == "article_slug")
    }

    // MARK: - Codable

    @Test func encodesAndDecodes() throws {
        let original = AnalyticsEvent(
            id: "test-123",
            name: "calculator_used",
            properties: ["calculator_name": "renta"],
            timestamp: Date(timeIntervalSince1970: 1700000000)
        )
        let encoder = JSONEncoder()
        encoder.dateEncodingStrategy = .iso8601
        let data = try encoder.encode(original)

        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        let decoded = try decoder.decode(AnalyticsEvent.self, from: data)

        #expect(decoded.id == original.id)
        #expect(decoded.name == original.name)
        #expect(decoded.properties == original.properties)
    }
}
