import Foundation

/// Represents a single SSE chunk from the Vercel AI SDK wire format.
/// The `type` field determines which fields are populated.
struct SSEChunkDTO: Decodable {
    let type: String
    let id: String?
    let delta: String?
    let messageId: String?
    let finishReason: String?
    let messageMetadata: MessageMetadataDTO?
    let errorText: String?
    let reason: String?
}

struct MessageMetadataDTO: Decodable {
    let sources: [SourceCitation]?
    let suggestedCalculators: [SuggestedCalculator]?
    let ragMetadata: RAGMetadata?
    let timestamp: String?
    let conversationId: String?
}
