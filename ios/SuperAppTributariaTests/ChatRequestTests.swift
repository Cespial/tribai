import Testing
import Foundation
@testable import SuperAppTributaria

struct ChatRequestTests {

    // MARK: - MessagePart

    @Test func messagePartDefaultsToText() {
        let part = MessagePart(text: "Hello")
        #expect(part.type == "text")
        #expect(part.text == "Hello")
    }

    // MARK: - PageModule

    @Test func pageModuleRawValues() {
        #expect(PageModule.home.rawValue == "home")
        #expect(PageModule.comparar.rawValue == "comparar")
        #expect(PageModule.favoritos.rawValue == "favoritos")
        #expect(PageModule.tablasRetencion.rawValue == "tablas-retencion")
        #expect(PageModule.calculadora.rawValue == "calculadora")
        #expect(PageModule.articulo.rawValue == "articulo")
        #expect(PageModule.other.rawValue == "other")
    }

    // MARK: - PageContext

    @Test func pageContextDefaults() {
        let ctx = PageContext()
        #expect(ctx.pathname == "/")
        #expect(ctx.module == .home)
        #expect(ctx.calculatorSlug == nil)
        #expect(ctx.articleSlug == nil)
        #expect(ctx.workspaceId == nil)
    }

    @Test func pageContextCustom() {
        let ctx = PageContext(
            pathname: "/calculadoras/renta",
            module: .calculadora,
            calculatorSlug: "renta"
        )
        #expect(ctx.pathname == "/calculadoras/renta")
        #expect(ctx.module == .calculadora)
        #expect(ctx.calculatorSlug == "renta")
    }

    // MARK: - ChatRequest Encoding

    @Test func chatRequestEncodesCorrectly() throws {
        let request = ChatRequest(
            messages: [
                RequestMessage(
                    id: "msg-1",
                    role: "user",
                    parts: [MessagePart(text: "Hola")]
                )
            ],
            conversationId: "conv-123",
            filters: ChatFilters(libro: "Libro I"),
            pageContext: PageContext(module: .home)
        )
        let data = try JSONEncoder().encode(request)
        let json = try JSONSerialization.jsonObject(with: data) as! [String: Any]

        #expect(json["conversationId"] as? String == "conv-123")
        let messages = json["messages"] as? [[String: Any]]
        #expect(messages?.count == 1)
        #expect(messages?[0]["role"] as? String == "user")
    }

    @Test func chatRequestWithNilOptionals() throws {
        let request = ChatRequest(
            messages: [],
            conversationId: nil,
            filters: nil,
            pageContext: nil
        )
        let data = try JSONEncoder().encode(request)
        let json = try JSONSerialization.jsonObject(with: data) as! [String: Any]

        #expect(json["messages"] as? [Any] != nil)
    }

    // MARK: - ChatFilters

    @Test func chatFiltersEncodes() throws {
        let filters = ChatFilters(libro: "Libro III")
        let data = try JSONEncoder().encode(filters)
        let json = try JSONSerialization.jsonObject(with: data) as! [String: Any]
        #expect(json["libro"] as? String == "Libro III")
    }

    @Test func chatFiltersNilLibro() throws {
        let filters = ChatFilters(libro: nil)
        let data = try JSONEncoder().encode(filters)
        let decoded = try JSONSerialization.jsonObject(with: data) as! [String: Any]
        // nil should still encode (as null or missing)
        #expect(decoded["libro"] == nil || decoded["libro"] is NSNull)
    }
}
