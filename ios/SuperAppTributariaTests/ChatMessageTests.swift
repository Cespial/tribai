import Testing
import Foundation
@testable import SuperAppTributaria

struct ChatMessageTests {

    // MARK: - Init

    @Test func defaultInitSetsFields() {
        let msg = ChatMessage(role: .user, text: "Hola")
        #expect(!msg.id.isEmpty)
        #expect(msg.role == .user)
        #expect(msg.text == "Hola")
        #expect(msg.sources.isEmpty)
        #expect(msg.ragMetadata == nil)
        #expect(msg.suggestedCalculators.isEmpty)
    }

    // MARK: - Equality

    @Test func equalityComparesByIdAndTextAndSources() {
        let msg1 = ChatMessage(id: "1", role: .user, text: "Hello")
        let msg2 = ChatMessage(id: "1", role: .user, text: "Hello")
        #expect(msg1 == msg2)
    }

    @Test func inequalityOnDifferentText() {
        let msg1 = ChatMessage(id: "1", role: .user, text: "Hello")
        let msg2 = ChatMessage(id: "1", role: .user, text: "Bye")
        #expect(msg1 != msg2)
    }

    @Test func inequalityOnDifferentId() {
        let msg1 = ChatMessage(id: "1", role: .user, text: "Hello")
        let msg2 = ChatMessage(id: "2", role: .user, text: "Hello")
        #expect(msg1 != msg2)
    }

    // MARK: - MessageRole

    @Test func messageRoleRawValues() {
        #expect(MessageRole.user.rawValue == "user")
        #expect(MessageRole.assistant.rawValue == "assistant")
        #expect(MessageRole.system.rawValue == "system")
    }

    @Test func messageRoleDecodesFromJSON() throws {
        let json = "\"user\""
        let role = try JSONDecoder().decode(MessageRole.self, from: Data(json.utf8))
        #expect(role == .user)
    }

    // MARK: - SourceCitation

    @Test func sourceCitationIdCombinesFields() {
        let source = SourceCitation(idArticulo: "Art. 240", titulo: "Tarifa", slug: "art-240")
        #expect(source.id == "Art. 240art-240")
    }

    @Test func sourceCitationLibroFallsBackToEmpty() {
        let source = SourceCitation(idArticulo: "Art. 1", titulo: "T")
        #expect(source.libro == "")
    }

    @Test func sourceCitationLibroReturnsCategoriaLibro() {
        let source = SourceCitation(idArticulo: "Art. 1", titulo: "T", categoriaLibro: "Libro I")
        #expect(source.libro == "Libro I")
    }

    // MARK: - ArticleStatus

    @Test func articleStatusRawValues() {
        #expect(ArticleStatus.vigente.rawValue == "vigente")
        #expect(ArticleStatus.modificado.rawValue == "modificado")
        #expect(ArticleStatus.derogado.rawValue == "derogado")
    }

    @Test func articleStatusDecodesFromJSON() throws {
        let json = "\"vigente\""
        let status = try JSONDecoder().decode(ArticleStatus.self, from: Data(json.utf8))
        #expect(status == .vigente)
    }

    // MARK: - SuggestedCalculator

    @Test func suggestedCalculatorIdIsSlug() {
        let calc = SuggestedCalculator(slug: "renta", title: "Renta", description: nil)
        #expect(calc.id == "renta")
    }

    @Test func suggestedCalculatorDecodesFromJSON() throws {
        let json = """
        {"href":"renta","name":"Renta PN","description":"Impuesto de renta"}
        """
        let calc = try JSONDecoder().decode(SuggestedCalculator.self, from: Data(json.utf8))
        #expect(calc.slug == "renta")
        #expect(calc.title == "Renta PN")
        #expect(calc.description == "Impuesto de renta")
    }

    // MARK: - RAGMetadata

    @Test func ragMetadataDecodesFromJSON() throws {
        let json = """
        {"confidenceLevel":"high","evidenceQuality":0.85,"pipelineMs":1094,"uniqueArticles":3,"contradictionFlags":false}
        """
        let meta = try JSONDecoder().decode(RAGMetadata.self, from: Data(json.utf8))
        #expect(meta.confidenceLevel == .high)
        #expect(meta.evidenceQuality == 0.85)
        #expect(meta.pipelineMs == 1094)
        #expect(meta.uniqueArticles == 3)
        #expect(meta.contradictionFlags == false)
    }

    @Test func confidenceLevelRawValues() {
        #expect(ConfidenceLevel.high.rawValue == "high")
        #expect(ConfidenceLevel.medium.rawValue == "medium")
        #expect(ConfidenceLevel.low.rawValue == "low")
    }

    @Test func pipelineTimingsDecodesFromJSON() throws {
        let json = """
        {"queryEnhancement":120,"retrieval":450,"reranking":50,"contextAssembly":30,"promptBuilding":10,"totalPipeline":660}
        """
        let timings = try JSONDecoder().decode(PipelineTimings.self, from: Data(json.utf8))
        #expect(timings.totalPipeline == 660)
        #expect(timings.retrieval == 450)
    }
}
