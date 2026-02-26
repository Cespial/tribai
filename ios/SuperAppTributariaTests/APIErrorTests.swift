import Testing
import Foundation
@testable import SuperAppTributaria

struct APIErrorTests {
    @Test func rateLimitedErrorDescription() {
        let error = APIError.rateLimited(retryAfter: 30)
        #expect(error.errorDescription == "Demasiadas solicitudes. Intenta de nuevo en 30 segundos.")
    }

    @Test func rateLimitedWithoutRetryAfter() {
        let error = APIError.rateLimited(retryAfter: nil)
        #expect(error.errorDescription == "Demasiadas solicitudes. Intenta de nuevo en unos segundos.")
    }

    @Test func invalidRequestErrorDescription() {
        let error = APIError.invalidRequest(
            message: "Solicitud inválida.",
            details: ["Last message must have role 'user'"]
        )
        #expect(error.errorDescription == "Solicitud inválida.")
    }

    @Test func networkErrorDescription() {
        let error = APIError.networkError(underlying: URLError(.notConnectedToInternet))
        #expect(error.errorDescription == "Error de conexión. Verifica tu conexión a internet.")
    }

    @Test func timeoutErrorDescription() {
        let error = APIError.timeout
        #expect(error.errorDescription == "La solicitud tardó demasiado. Intenta de nuevo.")
    }

    @Test func apiErrorResponseDecodes() throws {
        let json = #"{"error":"Solicitud inválida.","details":["Array must contain at least 1 element"]}"#
        let data = json.data(using: .utf8)!
        let response = try JSONDecoder().decode(APIErrorResponse.self, from: data)

        #expect(response.error == "Solicitud inválida.")
        #expect(response.details?.count == 1)
        #expect(response.details?.first == "Array must contain at least 1 element")
    }

    @Test func apiErrorResponseDecodesWithoutDetails() throws {
        let json = #"{"error":"Error del servidor."}"#
        let data = json.data(using: .utf8)!
        let response = try JSONDecoder().decode(APIErrorResponse.self, from: data)

        #expect(response.error == "Error del servidor.")
        #expect(response.details == nil)
    }

    @Test func healthResponseDecodes() throws {
        let json = #"{"status":"healthy","timestamp":"2026-02-26T10:00:00Z","version":"1.0.0"}"#
        let data = json.data(using: .utf8)!
        let response = try JSONDecoder().decode(HealthResponse.self, from: data)

        #expect(response.status == .healthy)
    }

    @Test func healthResponseDecodesDegraded() throws {
        let json = #"{"status":"degraded"}"#
        let data = json.data(using: .utf8)!
        let response = try JSONDecoder().decode(HealthResponse.self, from: data)

        #expect(response.status == .degraded)
    }
}
