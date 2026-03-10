import Testing
import Foundation
@testable import SuperAppTributaria

struct ConversationModelTests {

    // MARK: - Init

    @Test func defaultInitSetsDefaultTitle() {
        let conv = Conversation()
        #expect(conv.title == "Nueva conversación")
    }

    @Test func defaultInitGeneratesId() {
        let conv = Conversation()
        #expect(conv.id.hasPrefix("conv-"))
    }

    @Test func defaultInitHasEmptyMessages() {
        let conv = Conversation()
        #expect(conv.messages.isEmpty)
    }

    // MARK: - Generate ID

    @Test func generateIdHasConvPrefix() {
        let id = Conversation.generateId()
        #expect(id.hasPrefix("conv-"))
    }

    @Test func generateIdHasCorrectLength() {
        let id = Conversation.generateId()
        // "conv-" (5) + 11 random chars = 16
        #expect(id.count == 16)
    }

    @Test func generateIdIsUnique() {
        let id1 = Conversation.generateId()
        let id2 = Conversation.generateId()
        #expect(id1 != id2)
    }

    // MARK: - Update Title

    @Test func updateTitleUsesFirstUserMessage() {
        var conv = Conversation()
        conv.messages = [
            ChatMessage(role: .user, text: "Debo declarar renta?")
        ]
        conv.updateTitle()
        #expect(conv.title == "Debo declarar renta?")
    }

    @Test func updateTitleSkipsAssistantMessages() {
        var conv = Conversation()
        conv.messages = [
            ChatMessage(role: .assistant, text: "Bienvenido"),
            ChatMessage(role: .user, text: "Pregunta real")
        ]
        conv.updateTitle()
        #expect(conv.title == "Pregunta real")
    }

    @Test func updateTitleTruncatesLongMessages() {
        var conv = Conversation()
        let longText = String(repeating: "a", count: 200)
        conv.messages = [ChatMessage(role: .user, text: longText)]
        conv.updateTitle()
        #expect(conv.title.count == AppConstants.Chat.conversationTitleMaxLength)
    }

    @Test func updateTitleKeepsDefaultForEmptyText() {
        var conv = Conversation()
        conv.messages = [ChatMessage(role: .user, text: "   ")]
        conv.updateTitle()
        #expect(conv.title == "Nueva conversación")
    }

    @Test func updateTitleKeepsDefaultForNoUserMessages() {
        var conv = Conversation()
        conv.messages = [ChatMessage(role: .assistant, text: "Hello")]
        conv.updateTitle()
        // No user message, so title shouldn't change from default
        #expect(conv.title == "Nueva conversación")
    }

    // MARK: - Equality

    @Test func conversationsEqualById() {
        let date = Date(timeIntervalSince1970: 1000)
        let conv1 = Conversation(id: "conv-abc", createdAt: date, updatedAt: date)
        let conv2 = Conversation(id: "conv-abc", createdAt: date, updatedAt: date)
        #expect(conv1 == conv2)
    }

    @Test func conversationsNotEqualByDifferentId() {
        let date = Date(timeIntervalSince1970: 1000)
        let conv1 = Conversation(id: "conv-abc", createdAt: date, updatedAt: date)
        let conv2 = Conversation(id: "conv-xyz", createdAt: date, updatedAt: date)
        #expect(conv1 != conv2)
    }
}
