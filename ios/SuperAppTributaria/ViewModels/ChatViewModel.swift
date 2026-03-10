import Foundation
import SwiftUI

@MainActor
@Observable
final class ChatViewModel {
    // MARK: - State

    var messages: [ChatMessage] = []
    var inputText: String = ""
    var isStreaming: Bool = false
    var streamingText: String = ""
    var currentSources: [SourceCitation] = []
    var currentRAGMetadata: RAGMetadata?
    var error: APIError?
    var showError: Bool = false
    var typingLabel: String = AppConstants.TypingLabels.searching
    var conversationId: String

    var characterCount: Int { inputText.count }
    var isOverCharacterLimit: Bool { characterCount > AppConstants.Chat.maxMessageLength }
    var canSend: Bool {
        !inputText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
        && !isStreaming
        && !isOverCharacterLimit
        && messages.count < AppConstants.Chat.maxMessages
    }

    // MARK: - Dependencies

    private let chatService: ChatServiceProtocol
    private var streamTask: Task<Void, Never>?
    private var typingLabelTask: Task<Void, Never>?

    // Callback for persistence
    var onConversationUpdated: ((Conversation) -> Void)?

    init(
        chatService: ChatServiceProtocol,
        conversationId: String = Conversation.generateId()
    ) {
        self.chatService = chatService
        self.conversationId = conversationId
    }

    // MARK: - Actions

    @MainActor
    func sendMessage() {
        let text = inputText.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !text.isEmpty, canSend else { return }

        Haptics.impact()

        let userMessage = ChatMessage(role: .user, text: text)
        messages.append(userMessage)
        inputText = ""
        error = nil
        showError = false

        startStreaming()
    }

    @MainActor
    func sendSuggestedQuestion(_ question: String) {
        inputText = question
        sendMessage()
    }

    @MainActor
    func retry() {
        guard let lastUserMessage = messages.last(where: { $0.role == .user }) else { return }

        // Remove last assistant message if it exists and was incomplete
        if let lastMessage = messages.last, lastMessage.role == .assistant {
            messages.removeLast()
        }

        error = nil
        showError = false
        inputText = lastUserMessage.text

        // Remove the user message too, sendMessage will re-add it
        if messages.last?.role == .user {
            messages.removeLast()
        }

        sendMessage()
    }

    func cancelStreaming() {
        streamTask?.cancel()
        streamTask = nil
        typingLabelTask?.cancel()
        typingLabelTask = nil
        isStreaming = false
    }

    // MARK: - Private

    @MainActor
    private func startStreaming() {
        isStreaming = true
        streamingText = ""
        currentSources = []
        currentRAGMetadata = nil
        typingLabel = AppConstants.TypingLabels.searching

        // Start typing label rotation
        startTypingLabelRotation()

        // Create assistant placeholder
        let assistantMessage = ChatMessage(role: .assistant, text: "")
        messages.append(assistantMessage)
        let assistantIndex = messages.count - 1

        streamTask = Task { [weak self] in
            guard let self else { return }

            let stream = chatService.sendMessage(
                messages: Array(messages.dropLast()), // Don't send the empty assistant placeholder
                conversationId: conversationId,
                filters: nil,
                pageContext: nil
            )

            do {
                for try await event in stream {
                    if Task.isCancelled { break }

                    await MainActor.run {
                        self.handleStreamEvent(event, assistantIndex: assistantIndex)
                    }
                }

                await MainActor.run {
                    self.finishStreaming(assistantIndex: assistantIndex)
                }
            } catch let apiError as APIError {
                await MainActor.run {
                    self.handleStreamError(apiError, assistantIndex: assistantIndex)
                }
            } catch {
                await MainActor.run {
                    self.handleStreamError(
                        .networkError(underlying: error),
                        assistantIndex: assistantIndex
                    )
                }
            }
        }
    }

    @MainActor
    private func handleStreamEvent(_ event: StreamEvent, assistantIndex: Int) {
        switch event {
        case .textDelta(_, let delta):
            streamingText += delta
            if assistantIndex < messages.count {
                messages[assistantIndex].text = streamingText
            }

        case .finished(_, let metadata):
            if let metadata {
                currentSources = metadata.sources ?? []
                currentRAGMetadata = metadata.ragMetadata
                if assistantIndex < messages.count {
                    messages[assistantIndex].sources = currentSources
                    messages[assistantIndex].ragMetadata = currentRAGMetadata
                    messages[assistantIndex].suggestedCalculators = metadata.suggestedCalculators ?? []
                }
            }

        case .started, .textStarted, .textEnded, .stepStarted, .stepFinished, .unknown:
            break

        case .done:
            break

        case .error(let apiError):
            handleStreamError(apiError, assistantIndex: assistantIndex)
        }
    }

    @MainActor
    private func finishStreaming(assistantIndex: Int) {
        isStreaming = false
        typingLabelTask?.cancel()

        if assistantIndex < messages.count && messages[assistantIndex].text.isEmpty {
            // No content received — remove empty message
            messages.remove(at: assistantIndex)
        }

        Haptics.success()
        notifyConversationUpdated()
    }

    @MainActor
    private func handleStreamError(_ apiError: APIError, assistantIndex: Int) {
        isStreaming = false
        typingLabelTask?.cancel()
        error = apiError
        showError = true

        if assistantIndex < messages.count {
            if messages[assistantIndex].text.isEmpty {
                // No content received — remove empty placeholder
                messages.remove(at: assistantIndex)
            } else {
                // Partial content received — append error indicator so user sees what arrived
                messages[assistantIndex].text += "\n\n⚠️ _Respuesta incompleta — ocurrió un error._"
            }
        }

        Haptics.error()
    }

    private func startTypingLabelRotation() {
        typingLabelTask?.cancel()
        typingLabelTask = Task { @MainActor [weak self] in
            guard let self else { return }
            self.typingLabel = AppConstants.TypingLabels.searching

            try? await Task.sleep(for: .seconds(AppConstants.TypingLabels.analyzeDelay))
            guard !Task.isCancelled else { return }
            self.typingLabel = AppConstants.TypingLabels.analyzing

            try? await Task.sleep(for: .seconds(
                AppConstants.TypingLabels.draftDelay - AppConstants.TypingLabels.analyzeDelay
            ))
            guard !Task.isCancelled else { return }
            self.typingLabel = AppConstants.TypingLabels.drafting
        }
    }

    private func notifyConversationUpdated() {
        var conversation = Conversation(
            id: conversationId,
            messages: messages,
            updatedAt: .now
        )
        conversation.updateTitle()
        onConversationUpdated?(conversation)
    }

    // MARK: - Load from existing conversation

    @MainActor
    func loadConversation(_ conversation: Conversation) {
        self.conversationId = conversation.id
        self.messages = conversation.messages
    }
}
