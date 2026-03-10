import Foundation

/// Protocol for the analytics service, enabling testability.
protocol AnalyticsServiceProtocol: Sendable {
    func track(event name: String, properties: [String: String])
    func trackScreenView(name: String)
    func trackCalculatorUsed(name: String)
    func trackChatMessageSent()
    func trackError(error: Error, context: String)
    func flush() async
}

/// A lightweight, privacy-respecting analytics service that stores events locally
/// and can batch-flush them to a remote endpoint when configured.
///
/// - Events are stored in a local JSON file (Documents/analytics_events.json).
/// - FIFO eviction keeps the store at a maximum of 1000 events.
/// - No PII is collected; only functional event names and properties.
@MainActor
@Observable
final class AnalyticsService: AnalyticsServiceProtocol {

    // MARK: - Configuration

    private enum Config {
        static let maxStoredEvents = 1000
        static let flushBatchSize = 100
        static let fileName = "analytics_events.json"
        /// Set to a real URL when the backend analytics endpoint is ready.
        static let endpointURL: URL? = nil
        // static let endpointURL: URL? = URL(string: "https://superapp-tributaria-colombia.vercel.app/api/analytics")
    }

    // MARK: - State

    private(set) var events: [AnalyticsEvent] = []
    private(set) var totalEventsTracked: Int = 0

    private let encoder: JSONEncoder = {
        let encoder = JSONEncoder()
        encoder.dateEncodingStrategy = .iso8601
        encoder.outputFormatting = .prettyPrinted
        return encoder
    }()

    private let decoder: JSONDecoder = {
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        return decoder
    }()

    // MARK: - Init

    init() {
        loadEvents()
    }

    // MARK: - Public API

    nonisolated func track(event name: String, properties: [String: String] = [:]) {
        let event = AnalyticsEvent(name: name, properties: properties)
        Task { @MainActor in
            appendEvent(event)
        }
    }

    nonisolated func trackScreenView(name: String) {
        track(
            event: AnalyticsEvent.Name.screenView,
            properties: [AnalyticsEvent.PropertyKey.screenName: name]
        )
    }

    nonisolated func trackCalculatorUsed(name: String) {
        track(
            event: AnalyticsEvent.Name.calculatorUsed,
            properties: [AnalyticsEvent.PropertyKey.calculatorName: name]
        )
    }

    nonisolated func trackChatMessageSent() {
        track(event: AnalyticsEvent.Name.chatMessageSent)
    }

    nonisolated func trackError(error: Error, context: String) {
        track(
            event: AnalyticsEvent.Name.appError,
            properties: [
                AnalyticsEvent.PropertyKey.errorDescription: error.localizedDescription,
                AnalyticsEvent.PropertyKey.errorContext: context,
            ]
        )
    }

    /// Flushes batched events to the analytics endpoint (when configured).
    /// If no endpoint is configured, this is a no-op and events remain stored locally.
    func flush() async {
        guard let endpointURL = Config.endpointURL else {
            // No endpoint configured yet — events stay local.
            return
        }

        guard !events.isEmpty else { return }

        // Take a batch from the front of the queue.
        let batch = Array(events.prefix(Config.flushBatchSize))

        do {
            var request = URLRequest(url: endpointURL)
            request.httpMethod = "POST"
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            request.timeoutInterval = 30
            request.httpBody = try encoder.encode(batch)

            let (_, response) = try await URLSession.shared.data(for: request)

            guard let httpResponse = response as? HTTPURLResponse,
                  (200...299).contains(httpResponse.statusCode) else {
                return
            }

            // Remove successfully flushed events.
            let flushedIDs = Set(batch.map(\.id))
            events.removeAll { flushedIDs.contains($0.id) }
            persistEvents()
        } catch {
            // Silently fail — events remain in the local store for the next flush.
        }
    }

    /// Removes all stored analytics events and deletes the local file.
    func clearAll() {
        events.removeAll()
        totalEventsTracked = 0
        try? FileManager.default.removeItem(at: storageURL)
    }

    // MARK: - Private Helpers

    private func appendEvent(_ event: AnalyticsEvent) {
        events.append(event)
        totalEventsTracked += 1

        // FIFO eviction: drop oldest events when over the limit.
        if events.count > Config.maxStoredEvents {
            let overflow = events.count - Config.maxStoredEvents
            events.removeFirst(overflow)
        }

        persistEvents()
    }

    // MARK: - Persistence

    private var storageURL: URL {
        FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
            .appendingPathComponent(Config.fileName)
    }

    private func loadEvents() {
        guard FileManager.default.fileExists(atPath: storageURL.path) else { return }

        do {
            let data = try Data(contentsOf: storageURL)
            events = try decoder.decode([AnalyticsEvent].self, from: data)
        } catch {
            // Corrupted file — start fresh.
            events = []
        }
    }

    private func persistEvents() {
        do {
            let data = try encoder.encode(events)
            try data.write(to: storageURL, options: .atomic)
        } catch {
            // Persistence failure is non-fatal.
        }
    }
}
