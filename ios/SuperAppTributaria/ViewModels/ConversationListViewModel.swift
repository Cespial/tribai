import Foundation
import SwiftData

@MainActor
@Observable
final class ConversationListViewModel {
    var conversations: [Conversation] = []
    var searchText: String = ""
    var selectedConversationId: String?

    var filteredConversations: [Conversation] {
        if searchText.isEmpty {
            return conversations
        }
        return conversations.filter {
            $0.title.localizedCaseInsensitiveContains(searchText)
        }
    }

    private var repository: ConversationRepositoryProtocol?

    func setRepository(_ repository: ConversationRepositoryProtocol) {
        self.repository = repository
    }

    @MainActor
    func loadConversations() async {
        guard let repository else { return }
        do {
            conversations = try await repository.fetchAll()
        } catch {
            conversations = []
        }
    }

    @MainActor
    func saveConversation(_ conversation: Conversation) async {
        guard let repository else { return }
        do {
            try await repository.save(conversation)
            await loadConversations()
        } catch {
            // Silently fail — conversation list will refresh on next load
        }
    }

    @MainActor
    func deleteConversation(id: String) async {
        guard let repository else { return }
        do {
            try await repository.delete(id: id)
            conversations.removeAll { $0.id == id }
            if selectedConversationId == id {
                selectedConversationId = nil
            }
        } catch {
            // Reload to get accurate state
            await loadConversations()
        }
    }

    func selectConversation(_ id: String?) {
        selectedConversationId = id
    }

    func newConversation() -> Conversation {
        let conversation = Conversation()
        selectedConversationId = conversation.id
        return conversation
    }
}
