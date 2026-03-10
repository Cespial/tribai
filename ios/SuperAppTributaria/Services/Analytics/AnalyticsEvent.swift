import Foundation

/// A lightweight, privacy-respecting analytics event.
struct AnalyticsEvent: Codable, Sendable, Identifiable {
    let id: String
    let name: String
    let properties: [String: String]
    let timestamp: Date

    init(
        id: String = UUID().uuidString,
        name: String,
        properties: [String: String] = [:],
        timestamp: Date = .now
    ) {
        self.id = id
        self.name = name
        self.properties = properties
        self.timestamp = timestamp
    }
}

// MARK: - Predefined Event Names

extension AnalyticsEvent {
    enum Name {
        static let screenView = "screen_view"
        static let calculatorUsed = "calculator_used"
        static let chatMessageSent = "chat_message_sent"
        static let appError = "app_error"
        static let appLaunched = "app_launched"
        static let tabChanged = "tab_changed"
        static let searchPerformed = "search_performed"
        static let articleViewed = "article_viewed"
    }

    enum PropertyKey {
        static let screenName = "screen_name"
        static let calculatorName = "calculator_name"
        static let errorDescription = "error_description"
        static let errorContext = "error_context"
        static let tabName = "tab_name"
        static let searchQuery = "search_query"
        static let articleSlug = "article_slug"
    }
}
