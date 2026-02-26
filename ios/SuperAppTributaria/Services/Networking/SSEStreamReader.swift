import Foundation

/// Reads an SSE stream from URLSession bytes and emits parsed `StreamEvent`s.
final class SSEStreamReader: Sendable {
    private let session: URLSession

    init(session: URLSession = .shared) {
        self.session = session
    }

    /// Opens an SSE stream and returns an `AsyncThrowingStream` of `StreamEvent`s.
    func stream(for request: URLRequest) -> AsyncThrowingStream<StreamEvent, Error> {
        let session = self.session
        return AsyncThrowingStream { continuation in
            let task = Task {
                do {
                    let (bytes, response) = try await session.bytes(for: request)

                    guard let httpResponse = response as? HTTPURLResponse else {
                        continuation.finish(throwing: APIError.networkError(
                            underlying: URLError(.badServerResponse)
                        ))
                        return
                    }

                    if httpResponse.statusCode != 200 {
                        let error = try await Self.handleErrorResponse(
                            bytes: bytes,
                            statusCode: httpResponse.statusCode,
                            headers: httpResponse
                        )
                        continuation.finish(throwing: error)
                        return
                    }

                    for try await line in bytes.lines {
                        if Task.isCancelled { break }

                        guard let event = SSEParser.parse(line: line) else { continue }

                        switch event {
                        case .done:
                            continuation.finish()
                            return
                        case .error(let apiError):
                            continuation.finish(throwing: apiError)
                            return
                        default:
                            continuation.yield(event)
                        }
                    }

                    continuation.finish()
                } catch is CancellationError {
                    continuation.finish()
                } catch let urlError as URLError where urlError.code == .timedOut {
                    continuation.finish(throwing: APIError.timeout)
                } catch let urlError as URLError where urlError.code == .notConnectedToInternet {
                    continuation.finish(throwing: APIError.noConnection)
                } catch {
                    continuation.finish(throwing: APIError.networkError(underlying: error))
                }
            }

            continuation.onTermination = { _ in
                task.cancel()
            }
        }
    }

    private static func handleErrorResponse(
        bytes: URLSession.AsyncBytes,
        statusCode: Int,
        headers: HTTPURLResponse
    ) async throws -> APIError {
        var bodyData = Data()
        for try await byte in bytes {
            bodyData.append(byte)
            if bodyData.count > 10_000 { break }
        }

        switch statusCode {
        case 429:
            let retryAfter = headers.value(forHTTPHeaderField: APIConfig.Headers.retryAfter)
                .flatMap(TimeInterval.init)
            return .rateLimited(retryAfter: retryAfter)

        case 400:
            if let errorResponse = try? JSONDecoder().decode(APIErrorResponse.self, from: bodyData) {
                return .invalidRequest(message: errorResponse.error, details: errorResponse.details)
            }
            return .invalidRequest(message: "Solicitud inválida.", details: nil)

        default:
            if let errorResponse = try? JSONDecoder().decode(APIErrorResponse.self, from: bodyData) {
                return .serverError(message: errorResponse.error)
            }
            return .serverError(message: "Error del servidor (\(statusCode)).")
        }
    }
}
