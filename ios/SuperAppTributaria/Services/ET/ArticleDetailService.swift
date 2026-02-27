import Foundation

final class ArticleDetailService: Sendable {
    func fetchArticle(slug: String) async throws -> ArticleDetail {
        let url = APIConfig.baseURL
            .appendingPathComponent("data/articles/\(slug).json")

        let (data, response) = try await URLSession.shared.data(from: url)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.networkError(underlying: URLError(.badServerResponse))
        }

        guard httpResponse.statusCode == 200 else {
            throw APIError.serverError(message: "Error al cargar el articulo (HTTP \(httpResponse.statusCode))")
        }

        do {
            return try JSONDecoder().decode(ArticleDetail.self, from: data)
        } catch {
            throw APIError.decodingError(underlying: error)
        }
    }
}
