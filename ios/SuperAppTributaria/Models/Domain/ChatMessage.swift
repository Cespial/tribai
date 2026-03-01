import Foundation

struct ChatMessage: Identifiable, Equatable {
    let id: String
    let role: MessageRole
    var text: String
    let createdAt: Date
    var sources: [SourceCitation]
    var ragMetadata: RAGMetadata?
    var suggestedCalculators: [SuggestedCalculator]

    init(
        id: String = UUID().uuidString,
        role: MessageRole,
        text: String,
        createdAt: Date = .now,
        sources: [SourceCitation] = [],
        ragMetadata: RAGMetadata? = nil,
        suggestedCalculators: [SuggestedCalculator] = []
    ) {
        self.id = id
        self.role = role
        self.text = text
        self.createdAt = createdAt
        self.sources = sources
        self.ragMetadata = ragMetadata
        self.suggestedCalculators = suggestedCalculators
    }

    static func == (lhs: ChatMessage, rhs: ChatMessage) -> Bool {
        lhs.id == rhs.id && lhs.text == rhs.text && lhs.sources == rhs.sources
    }
}

enum MessageRole: String, Codable {
    case user
    case assistant
    case system
}
