import Testing
import Foundation
@testable import SuperAppTributaria

struct HealthResponseTests {

    // MARK: - HealthStatus

    @Test func healthStatusRawValues() {
        #expect(HealthStatus.healthy.rawValue == "healthy")
        #expect(HealthStatus.degraded.rawValue == "degraded")
        #expect(HealthStatus.unhealthy.rawValue == "unhealthy")
    }

    // MARK: - Decoding

    @Test func decodesHealthyResponse() throws {
        let json = """
        {
            "status": "healthy",
            "timestamp": "2026-03-08T12:00:00Z",
            "version": "1.2.0"
        }
        """
        let data = json.data(using: .utf8)!
        let response = try JSONDecoder().decode(HealthResponse.self, from: data)

        #expect(response.status == .healthy)
        #expect(response.timestamp == "2026-03-08T12:00:00Z")
        #expect(response.version == "1.2.0")
    }

    @Test func decodesDegradedResponse() throws {
        let json = #"{"status": "degraded"}"#
        let data = json.data(using: .utf8)!
        let response = try JSONDecoder().decode(HealthResponse.self, from: data)

        #expect(response.status == .degraded)
        #expect(response.timestamp == nil)
        #expect(response.version == nil)
    }

    @Test func decodesUnhealthyResponse() throws {
        let json = #"{"status": "unhealthy"}"#
        let data = json.data(using: .utf8)!
        let response = try JSONDecoder().decode(HealthResponse.self, from: data)

        #expect(response.status == .unhealthy)
    }

    @Test func failsForInvalidStatus() {
        let json = #"{"status": "unknown"}"#
        let data = json.data(using: .utf8)!
        #expect(throws: DecodingError.self) {
            _ = try JSONDecoder().decode(HealthResponse.self, from: data)
        }
    }
}
