import Foundation

struct HealthResponse: Decodable {
    let status: HealthStatus
    let timestamp: String?
    let version: String?
}

enum HealthStatus: String, Decodable {
    case healthy
    case degraded
    case unhealthy
}
