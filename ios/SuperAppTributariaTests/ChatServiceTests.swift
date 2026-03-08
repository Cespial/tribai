import Testing
import Foundation
@testable import SuperAppTributaria

struct ChatServiceTests {
    @Test func chatRequestEncodesCorrectly() throws {
        let request = ChatRequest(
            messages: [
                RequestMessage(
                    id: "msg-1",
                    role: "user",
                    parts: [MessagePart(text: "¿Debo declarar renta?")]
                )
            ],
            conversationId: "conv-abc123",
            filters: nil,
            pageContext: PageContext(pathname: "/", module: .home)
        )

        let data = try JSONEncoder().encode(request)
        let json = try JSONSerialization.jsonObject(with: data) as? [String: Any]

        #expect(json?["conversationId"] as? String == "conv-abc123")

        let messages = json?["messages"] as? [[String: Any]]
        #expect(messages?.count == 1)
        #expect(messages?.first?["role"] as? String == "user")
        #expect(messages?.first?["id"] as? String == "msg-1")

        let parts = messages?.first?["parts"] as? [[String: Any]]
        #expect(parts?.first?["type"] as? String == "text")
        #expect(parts?.first?["text"] as? String == "¿Debo declarar renta?")

        let context = json?["pageContext"] as? [String: Any]
        #expect(context?["pathname"] as? String == "/")
        #expect(context?["module"] as? String == "home")
    }

    @Test func chatRequestEncodesWithFilters() throws {
        let request = ChatRequest(
            messages: [
                RequestMessage(
                    id: "msg-1",
                    role: "user",
                    parts: [MessagePart(text: "test")]
                )
            ],
            conversationId: nil,
            filters: ChatFilters(libro: "libro-renta"),
            pageContext: nil
        )

        let data = try JSONEncoder().encode(request)
        let json = try JSONSerialization.jsonObject(with: data) as? [String: Any]

        let filters = json?["filters"] as? [String: Any]
        #expect(filters?["libro"] as? String == "libro-renta")
    }

    @Test func multipleMessagesEncodeInOrder() throws {
        let messages = [
            RequestMessage(id: "1", role: "user", parts: [MessagePart(text: "Primera pregunta")]),
            RequestMessage(id: "2", role: "assistant", parts: [MessagePart(text: "Respuesta")]),
            RequestMessage(id: "3", role: "user", parts: [MessagePart(text: "Segunda pregunta")]),
        ]

        let request = ChatRequest(
            messages: messages,
            conversationId: "conv-test",
            filters: nil,
            pageContext: nil
        )

        let data = try JSONEncoder().encode(request)
        let json = try JSONSerialization.jsonObject(with: data) as? [String: Any]
        let decodedMessages = json?["messages"] as? [[String: Any]]

        #expect(decodedMessages?.count == 3)
        #expect(decodedMessages?[0]["role"] as? String == "user")
        #expect(decodedMessages?[1]["role"] as? String == "assistant")
        #expect(decodedMessages?[2]["role"] as? String == "user")
    }
}
