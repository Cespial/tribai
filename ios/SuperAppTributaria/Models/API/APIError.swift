import Foundation

struct APIErrorResponse: Decodable {
    let error: String
    let details: [String]?
}

enum APIError: LocalizedError {
    case invalidRequest(message: String, details: [String]?)
    case rateLimited(retryAfter: TimeInterval?)
    case serverError(message: String)
    case networkError(underlying: Error)
    case decodingError(underlying: Error)
    case streamingError(message: String)
    case timeout
    case noConnection

    var errorDescription: String? {
        switch self {
        case .invalidRequest(let message, _):
            return message
        case .rateLimited(let retryAfter):
            if let seconds = retryAfter {
                return "Demasiadas solicitudes. Intenta de nuevo en \(Int(seconds)) segundos."
            }
            return "Demasiadas solicitudes. Intenta de nuevo en unos segundos."
        case .serverError(let message):
            return message
        case .networkError:
            return "Error de conexión. Verifica tu conexión a internet."
        case .decodingError:
            return "Error al procesar la respuesta del servidor."
        case .streamingError(let message):
            return message
        case .timeout:
            return "La solicitud tardó demasiado. Intenta de nuevo."
        case .noConnection:
            return "Sin conexión a internet."
        }
    }
}
