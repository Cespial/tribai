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

enum PageModule: String, Encodable {
    case home
    case comparar
    case favoritos
    case tablasRetencion = "tablas-retencion"
    case calculadora
    case articulo
    case other
}

struct PageContext: Encodable {
    let pathname: String
    let module: PageModule
    let calculatorSlug: String?
    let articleSlug: String?
    let workspaceId: String?

    init(
        pathname: String = "/",
        module: PageModule = .home,
        calculatorSlug: String? = nil,
        articleSlug: String? = nil,
        workspaceId: String? = nil
    ) {
        self.pathname = pathname
        self.module = module
        self.calculatorSlug = calculatorSlug
        self.articleSlug = articleSlug
        self.workspaceId = workspaceId
    }
}
