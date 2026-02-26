import Foundation

enum APIConfig {
    static let baseURL = URL(string: "https://superapp-tributaria-colombia.vercel.app")!

    enum Endpoints {
        static let chat = "/api/chat"
        static let health = "/api/health"
    }

    static var chatURL: URL {
        baseURL.appendingPathComponent(Endpoints.chat)
    }

    static var healthURL: URL {
        baseURL.appendingPathComponent(Endpoints.health)
    }

    enum Headers {
        static let contentType = "Content-Type"
        static let contentTypeJSON = "application/json"
        static let retryAfter = "Retry-After"
    }

    enum Timeouts {
        static let request: TimeInterval = 60
        static let resource: TimeInterval = 120
        static let healthCheck: TimeInterval = 10
    }
}
