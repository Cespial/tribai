import Foundation

/// Protocol for the chat service, enabling testability.
protocol ChatServiceProtocol: Sendable {
    func sendMessage(
        messages: [ChatMessage],
        conversationId: String?,
        filters: ChatFilters?,
        pageContext: PageContext?
    ) -> AsyncThrowingStream<StreamEvent, Error>
}

/// Builds and sends chat requests to the API, returning an SSE event stream.
final class ChatService: ChatServiceProtocol {
    private let streamReader: SSEStreamReader
    private let rateLimiter: RateLimiter
    private let encoder: JSONEncoder

    init(
        streamReader: SSEStreamReader = SSEStreamReader(),
        rateLimiter: RateLimiter = RateLimiter()
    ) {
        self.streamReader = streamReader
        self.rateLimiter = rateLimiter
        self.encoder = JSONEncoder()
    }

    func sendMessage(
        messages: [ChatMessage],
        conversationId: String?,
        filters: ChatFilters? = nil,
        pageContext: PageContext? = PageContext()
    ) -> AsyncThrowingStream<StreamEvent, Error> {
        AsyncThrowingStream { continuation in
            let task = Task {
                do {
                    // Check rate limit
                    let result = await rateLimiter.canProceed()
                    if case .waitRequired(let seconds) = result {
                        continuation.finish(throwing: APIError.rateLimited(retryAfter: seconds))
                        return
                    }

                    // Build request
                    let request = try buildRequest(
                        messages: messages,
                        conversationId: conversationId,
                        filters: filters,
                        pageContext: pageContext
                    )

                    // Record request
                    await rateLimiter.recordRequest()

                    // Stream events
                    for try await event in streamReader.stream(for: request) {
                        if Task.isCancelled { break }
                        continuation.yield(event)
                    }

                    continuation.finish()
                } catch let error as APIError {
                    if case .rateLimited(let retryAfter) = error, let seconds = retryAfter {
                        await rateLimiter.setBackoff(seconds: seconds)
                    }
                    continuation.finish(throwing: error)
                } catch {
                    continuation.finish(throwing: error)
                }
            }

            continuation.onTermination = { _ in
                task.cancel()
            }
        }
    }

    private func buildRequest(
        messages: [ChatMessage],
        conversationId: String?,
        filters: ChatFilters?,
        pageContext: PageContext?
    ) throws -> URLRequest {
        let requestMessages = messages.map { msg in
            RequestMessage(
                id: msg.id,
                role: msg.role.rawValue,
                parts: [MessagePart(text: msg.text)]
            )
        }

        let chatRequest = ChatRequest(
            messages: requestMessages,
            conversationId: conversationId,
            filters: filters,
            pageContext: pageContext
        )

        var urlRequest = URLRequest(url: APIConfig.chatURL)
        urlRequest.httpMethod = "POST"
        urlRequest.setValue(
            APIConfig.Headers.contentTypeJSON,
            forHTTPHeaderField: APIConfig.Headers.contentType
        )
        urlRequest.timeoutInterval = APIConfig.Timeouts.request
        urlRequest.httpBody = try encoder.encode(chatRequest)

        return urlRequest
    }
}
