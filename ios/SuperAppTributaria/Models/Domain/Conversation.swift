import Foundation

struct Conversation: Identifiable, Equatable {
    let id: String
    var title: String
    var messages: [ChatMessage]
    let createdAt: Date
    var updatedAt: Date

    init(
        id: String = Self.generateId(),
        title: String = "Nueva conversación",
        messages: [ChatMessage] = [],
        createdAt: Date = .now,
        updatedAt: Date = .now
    ) {
        self.id = id
        self.title = title
        self.messages = messages
        self.createdAt = createdAt
        self.updatedAt = updatedAt
    }

    static func generateId() -> String {
        "conv-\(String((0..<11).compactMap { _ in "abcdefghijklmnopqrstuvwxyz0123456789".randomElement() }))"
    }

    mutating func updateTitle() {
        guard let firstUserMessage = messages.first(where: { $0.role == .user }) else { return }
        let text = firstUserMessage.text.trimmingCharacters(in: .whitespacesAndNewlines)
        title = text.isEmpty ? "Nueva conversación" : String(text.prefix(AppConstants.Chat.conversationTitleMaxLength))
    }
}
