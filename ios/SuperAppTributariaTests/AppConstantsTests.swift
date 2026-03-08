import Testing
import Foundation
@testable import SuperAppTributaria

struct AppConstantsTests {

    // MARK: - Chat Constants

    @Test func chatMaxMessages() {
        #expect(AppConstants.Chat.maxMessages == 50)
    }

    @Test func chatMaxMessageLength() {
        #expect(AppConstants.Chat.maxMessageLength == 5000)
    }

    @Test func chatMaxConversations() {
        #expect(AppConstants.Chat.maxConversations == 30)
    }

    @Test func chatMaxMessagesPerConversation() {
        #expect(AppConstants.Chat.maxMessagesPerConversation == 80)
    }

    @Test func chatConversationTitleMaxLength() {
        #expect(AppConstants.Chat.conversationTitleMaxLength == 72)
    }

    // MARK: - Rate Limit Constants

    @Test func rateLimitMaxRequests() {
        #expect(AppConstants.RateLimit.maxRequests == 20)
    }

    @Test func rateLimitWindowSeconds() {
        #expect(AppConstants.RateLimit.windowSeconds == 60)
    }

    @Test func rateLimitBaseBackoff() {
        #expect(AppConstants.RateLimit.baseBackoffSeconds == 2)
    }

    @Test func rateLimitMaxBackoff() {
        #expect(AppConstants.RateLimit.maxBackoffSeconds == 60)
    }

    // MARK: - Health

    @Test func healthPollingInterval() {
        #expect(AppConstants.Health.pollingInterval == 300)
    }

    // MARK: - Suggested Questions

    @Test func suggestedQuestionsNotEmpty() {
        #expect(!AppConstants.suggestedQuestions.isEmpty)
    }

    @Test func suggestedQuestionsHas4Items() {
        #expect(AppConstants.suggestedQuestions.count == 4)
    }

    @Test func suggestedQuestionsAllNonEmpty() {
        for q in AppConstants.suggestedQuestions {
            #expect(!q.isEmpty)
        }
    }

    // MARK: - Typing Labels

    @Test func typingLabelsAreSpanish() {
        #expect(AppConstants.TypingLabels.searching.contains("Buscando"))
        #expect(AppConstants.TypingLabels.analyzing.contains("Analizando"))
        #expect(AppConstants.TypingLabels.drafting.contains("Redactando"))
    }

    @Test func typingDelaysAreProgressive() {
        #expect(AppConstants.TypingLabels.searchDelay < AppConstants.TypingLabels.analyzeDelay)
        #expect(AppConstants.TypingLabels.analyzeDelay < AppConstants.TypingLabels.draftDelay)
    }
}
