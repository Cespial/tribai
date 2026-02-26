import Testing
import Foundation
@testable import SuperAppTributaria

struct ConversationTests {
    @Test func generateIdHasCorrectFormat() {
        let id = Conversation.generateId()
        #expect(id.hasPrefix("conv-"))
        #expect(id.count == 16) // "conv-" (5) + 11 random chars
    }

    @Test func updateTitleUsesFirstUserMessage() {
        var conversation = Conversation()
        conversation.messages = [
            ChatMessage(role: .user, text: "¿Debo declarar renta por ingresos de 2025?"),
            ChatMessage(role: .assistant, text: "Según el artículo 592..."),
        ]

        conversation.updateTitle()
        #expect(conversation.title == "¿Debo declarar renta por ingresos de 2025?")
    }

    @Test func updateTitleTruncatesAt72Chars() {
        var conversation = Conversation()
        let longText = String(repeating: "a", count: 100)
        conversation.messages = [
            ChatMessage(role: .user, text: longText),
        ]

        conversation.updateTitle()
        #expect(conversation.title.count == 72)
    }

    @Test func updateTitleKeepsFallbackWhenNoUserMessage() {
        var conversation = Conversation(title: "Nueva conversación")
        conversation.messages = [
            ChatMessage(role: .assistant, text: "Hola"),
        ]

        conversation.updateTitle()
        #expect(conversation.title == "Nueva conversación")
    }

    @Test func persistableMessageRoundTrip() throws {
        let original = ChatMessage(
            role: .assistant,
            text: "Según el **artículo 240**...",
            sources: [
                SourceCitation(
                    idArticulo: "Art. 240",
                    titulo: "Tarifa general",
                    slug: "art-240",
                    contenidoTexto: "La tarifa general del impuesto...",
                    libro: "Libro I",
                    estado: .vigente
                )
            ],
            ragMetadata: RAGMetadata(
                chunksRetrieved: 20,
                chunksAfterReranking: 10,
                uniqueArticles: 3,
                tokensUsed: 8000,
                tokensBudget: 12000,
                queryEnhanced: true,
                hydeGenerated: true,
                subQueriesCount: 2,
                topScore: 0.85,
                medianScore: 0.65,
                dynamicThreshold: 0.28,
                queryType: "specific-article",
                namespacesSearched: ["ET", "doctrina"],
                siblingChunksAdded: true,
                embeddingCacheHitRate: 0.5,
                confidenceLevel: .high,
                evidenceQuality: 0.9,
                namespaceContribution: ["ET": 0.7, "doctrina": 0.3],
                contradictionFlags: [],
                pipelineMs: 1094,
                timings: PipelineTimings(
                    queryEnhancement: 200,
                    retrieval: 400,
                    reranking: 200,
                    contextAssembly: 150,
                    promptBuilding: 144
                ),
                degradedMode: false,
                degradedReason: nil
            )
        )

        let persisted = PersistableMessage(from: original)
        let encoder = JSONEncoder()
        let data = try encoder.encode(persisted)
        let decoder = JSONDecoder()
        let decoded = try decoder.decode(PersistableMessage.self, from: data)
        let restored = decoded.toChatMessage

        #expect(restored.text == original.text)
        #expect(restored.role == original.role)
        #expect(restored.sources.count == 1)
        #expect(restored.sources.first?.idArticulo == "Art. 240")
        #expect(restored.sources.first?.estado == .vigente)
        #expect(restored.ragMetadata?.confidenceLevel == .high)
        #expect(restored.ragMetadata?.pipelineMs == 1094)
        #expect(restored.ragMetadata?.timings?.retrieval == 400)
    }
}
