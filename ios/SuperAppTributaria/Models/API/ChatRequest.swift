import Foundation

struct ChatRequest: Encodable {
    let messages: [RequestMessage]
    let conversationId: String?
    let filters: ChatFilters?
    let pageContext: PageContext?
}

struct RequestMessage: Encodable {
    let id: String
    let role: String
    let parts: [MessagePart]
}

struct MessagePart: Encodable {
    let type: String
    let text: String

    init(text: String) {
        self.type = "text"
        self.text = text
    }
}

struct ChatFilters: Encodable {
    let libro: String?
}

struct PageContext: Encodable {
    let pathname: String
    let module: String

    init(pathname: String = "/", module: String = "home") {
        self.pathname = pathname
        self.module = module
    }
}
