import Foundation
import SwiftData

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
    var isLoading = false
    var error: String?
    var selectedTab: Tab = .contenido
    var isFromCache = false

    private var cacheService: ArticleCacheService?

    func setCacheService(_ service: ArticleCacheService) {
        self.cacheService = service
    }

    // MARK: - Actions

    func loadArticle(slug: String) async {
        guard !isLoading, article == nil else { return }
        isLoading = true
        error = nil
        isFromCache = false

        // Try cache first
        if let cached = cacheService?.getCached(slug: slug) {
            article = cached
            isFromCache = true
            isLoading = false
            // Try to refresh in background
            Task {
                await refreshFromNetwork(slug: slug)
            }
            return
        }

        // Fetch from network
        do {
            let service = ArticleDetailService()
            let result = try await service.fetchArticle(slug: slug)
            article = result
            isFromCache = false
            // Save to cache
            cacheService?.cache(article: result, slug: slug)
        } catch {
            // If network failed, try cache even if expired
            if let cached = cacheService?.getCached(slug: slug) {
                article = cached
                isFromCache = true
            } else {
                self.error = error.localizedDescription
            }
        }

        isLoading = false
    }

    private func refreshFromNetwork(slug: String) async {
        do {
            let service = ArticleDetailService()
            let result = try await service.fetchArticle(slug: slug)
            article = result
            isFromCache = false
            cacheService?.cache(article: result, slug: slug)
        } catch {
            // Keep cached version, silently fail
        }
    }
}
