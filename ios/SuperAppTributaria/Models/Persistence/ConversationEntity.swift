import Foundation
import SwiftData

@Model
final class ConversationEntity {
    @Attribute(.unique) var id: String
    var title: String
    var messagesData: Data
    var createdAt: Date
    var updatedAt: Date

    init(
        id: String,
        title: String,
        messagesData: Data,
        createdAt: Date,
        updatedAt: Date
    ) {
        self.id = id
        self.title = title
        self.messagesData = messagesData
        self.createdAt = createdAt
        self.updatedAt = updatedAt
    }
}

// MARK: - Conversion

extension ConversationEntity {
    convenience init(from conversation: Conversation) {
        let encoder = JSONEncoder()
        let data = (try? encoder.encode(conversation.messages.map(PersistableMessage.init))) ?? Data()
        self.init(
            id: conversation.id,
            title: conversation.title,
            messagesData: data,
            createdAt: conversation.createdAt,
            updatedAt: conversation.updatedAt
        )
    }

    func toConversation() -> Conversation {
        let decoder = JSONDecoder()
        let persistedMessages = (try? decoder.decode([PersistableMessage].self, from: messagesData)) ?? []
        return Conversation(
            id: id,
            title: title,
            messages: persistedMessages.map(\.toChatMessage),
            createdAt: createdAt,
            updatedAt: updatedAt
        )
    }
}

/// Codable wrapper for ChatMessage to store in SwiftData as JSON.
struct PersistableMessage: Codable {
    let id: String
    let role: String
    let text: String
    let createdAt: Date
    let sources: [SourceCitation]
    let ragMetadata: RAGMetadata?
    let suggestedCalculators: [SuggestedCalculator]

    init(from message: ChatMessage) {
        self.id = message.id
        self.role = message.role.rawValue
        self.text = message.text
        self.createdAt = message.createdAt
        self.sources = message.sources
        self.ragMetadata = message.ragMetadata
        self.suggestedCalculators = message.suggestedCalculators
    }

    var toChatMessage: ChatMessage {
        ChatMessage(
            id: id,
            role: MessageRole(rawValue: role) ?? .user,
            text: text,
            createdAt: createdAt,
            sources: sources,
            ragMetadata: ragMetadata,
            suggestedCalculators: suggestedCalculators
        )
    }
}
