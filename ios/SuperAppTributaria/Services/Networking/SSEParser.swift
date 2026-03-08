import Foundation

/// Stateless parser for Server-Sent Events from the Vercel AI SDK wire format.
/// Each SSE line has the format: `data: <JSON>\n\n` or `data: [DONE]\n\n`
enum SSEParser {
    /// Parses a single SSE data line into a stream event.
    /// - Parameter line: Raw line from the SSE stream (may or may not include "data: " prefix)
    /// - Returns: A `StreamEvent` if the line is valid, `nil` if the line should be skipped.
    static func parse(line: String) -> StreamEvent? {
        let trimmed = line.trimmingCharacters(in: .whitespacesAndNewlines)

        guard !trimmed.isEmpty else { return nil }

        // Strip "data: " prefix if present
        let jsonString: String
        if trimmed.hasPrefix("data: ") {
            jsonString = String(trimmed.dropFirst(6))
        } else if trimmed.hasPrefix("data:") {
            jsonString = String(trimmed.dropFirst(5)).trimmingCharacters(in: .whitespaces)
        } else {
            // Skip non-data lines (comments, event types, etc.)
            return nil
        }

        // Check for stream termination
        if jsonString == "[DONE]" {
            return .done
        }

        // Parse JSON
        guard let data = jsonString.data(using: .utf8) else { return nil }

        do {
            let chunk = try JSONDecoder().decode(SSEChunkDTO.self, from: data)
            return mapChunk(chunk)
        } catch {
            // Skip unparseable events instead of killing the stream.
            // The finish event metadata may contain new fields from the server.
            #if DEBUG
            print("[SSEParser] Skipping unparseable event: \(error.localizedDescription)")
            #endif
            return nil
        }
    }

    private static func mapChunk(_ chunk: SSEChunkDTO) -> StreamEvent {
        switch chunk.type {
        case "start":
            return .started(messageId: chunk.messageId)

        case "text-start":
            return .textStarted(id: chunk.id)

        case "text-delta":
            return .textDelta(id: chunk.id, delta: chunk.delta ?? "")

        case "text-end":
            return .textEnded(id: chunk.id)

        case "finish":
            return .finished(
                finishReason: chunk.finishReason,
                metadata: chunk.messageMetadata
            )

        case "error":
            return .error(.streamingError(message: chunk.errorText ?? "Error desconocido del servidor"))

        case "abort":
            return .error(.streamingError(message: chunk.reason ?? "Solicitud cancelada"))

        case "start-step":
            return .stepStarted

        case "finish-step":
            return .stepFinished

        default:
            // Ignore unknown chunk types (tool calls, reasoning, etc.)
            #if DEBUG
            print("[SSEParser] Unknown event type: \(chunk.type)")
            #endif
            return .unknown(type: chunk.type)
        }
    }
}

/// Events emitted by the SSE stream parser.
enum StreamEvent {
    case started(messageId: String?)
    case textStarted(id: String?)
    case textDelta(id: String?, delta: String)
    case textEnded(id: String?)
    case finished(finishReason: String?, metadata: MessageMetadataDTO?)
    case stepStarted
    case stepFinished
    case done
    case error(APIError)
    case unknown(type: String)
}
