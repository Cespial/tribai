import Foundation
import SwiftData

protocol ConversationRepositoryProtocol: Sendable {
    func fetchAll() async throws -> [Conversation]
    func fetch(id: String) async throws -> Conversation?
    func save(_ conversation: Conversation) async throws
    func delete(id: String) async throws
    func deleteAll() async throws
}

@ModelActor
actor SwiftDataConversationRepository: ConversationRepositoryProtocol {

    func fetchAll() throws -> [Conversation] {
        let descriptor = FetchDescriptor<ConversationEntity>(
            sortBy: [SortDescriptor(\.updatedAt, order: .reverse)]
        )
        let entities = try modelContext.fetch(descriptor)
        return entities.map { $0.toConversation() }
    }

    func fetch(id: String) throws -> Conversation? {
        let descriptor = FetchDescriptor<ConversationEntity>(
            predicate: #Predicate { $0.id == id }
        )
        return try modelContext.fetch(descriptor).first?.toConversation()
    }

    func save(_ conversation: Conversation) throws {
        // Check if it already exists
        let conversationId = conversation.id
        let descriptor = FetchDescriptor<ConversationEntity>(
            predicate: #Predicate { $0.id == conversationId }
        )

        if let existing = try modelContext.fetch(descriptor).first {
            // Update
            existing.title = conversation.title
            existing.messagesData = encodedMessages(conversation.messages)
            existing.updatedAt = conversation.updatedAt
        } else {
            // Insert new
            let entity = ConversationEntity(from: conversation)
            modelContext.insert(entity)
        }

        // Enforce max conversations limit
        try enforceConversationLimit()

        try modelContext.save()
    }

    func delete(id: String) throws {
        let descriptor = FetchDescriptor<ConversationEntity>(
            predicate: #Predicate { $0.id == id }
        )
        if let entity = try modelContext.fetch(descriptor).first {
            modelContext.delete(entity)
            try modelContext.save()
        }
    }

    func deleteAll() throws {
        let descriptor = FetchDescriptor<ConversationEntity>()
        let entities = try modelContext.fetch(descriptor)
        for entity in entities {
            modelContext.delete(entity)
        }
        try modelContext.save()
    }

    // MARK: - Private

    private func enforceConversationLimit() throws {
        let descriptor = FetchDescriptor<ConversationEntity>(
            sortBy: [SortDescriptor(\.updatedAt, order: .reverse)]
        )
        let allEntities = try modelContext.fetch(descriptor)

        if allEntities.count > AppConstants.Chat.maxConversations {
            for entity in allEntities.dropFirst(AppConstants.Chat.maxConversations) {
                modelContext.delete(entity)
            }
        }
    }

    private func encodedMessages(_ messages: [ChatMessage]) -> Data {
        let encoder = JSONEncoder()
        return (try? encoder.encode(messages.map(PersistableMessage.init))) ?? Data()
    }
}
