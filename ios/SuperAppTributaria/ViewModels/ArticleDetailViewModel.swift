import Foundation

@MainActor @Observable
final class ArticleDetailViewModel {
    enum Tab: String, CaseIterable {
        case contenido = "Contenido"
        case modificaciones = "Modificaciones"
        case referencias = "Referencias"
        case doctrina = "Doctrina"
    }

    // MARK: - State

    var article: ArticleDetail?
    var isLoading = true
    var error: String?
    var selectedTab: Tab = .contenido

    // MARK: - Actions

    func loadArticle(slug: String) async {
        guard !isLoading || article == nil else { return }
        isLoading = true
        error = nil

        do {
            let service = ArticleDetailService()
            let result = try await service.fetchArticle(slug: slug)
            article = result
        } catch {
            self.error = error.localizedDescription
        }

        isLoading = false
    }
}
