import Foundation
import SwiftData

@MainActor
final class ArticleCacheService {

    private let modelContext: ModelContext

    init(modelContext: ModelContext) {
        self.modelContext = modelContext
    }

    func getCached(slug: String) -> ArticleDetail? {
        let descriptor = FetchDescriptor<CachedArticleEntity>(
            predicate: #Predicate { $0.slug == slug }
        )
        guard let entity = try? modelContext.fetch(descriptor).first,
              !entity.isExpired else {
            return nil
        }
        return try? JSONDecoder().decode(ArticleDetail.self, from: entity.jsonData)
    }

    func cache(article: ArticleDetail, slug: String) {
        guard let jsonData = try? JSONEncoder().encode(article) else { return }

        let descriptor = FetchDescriptor<CachedArticleEntity>(
            predicate: #Predicate { $0.slug == slug }
        )

        if let existing = try? modelContext.fetch(descriptor).first {
            existing.jsonData = jsonData
            existing.cachedAt = Date()
        } else {
            let entity = CachedArticleEntity(slug: slug, jsonData: jsonData)
            modelContext.insert(entity)
        }

        try? modelContext.save()
    }

    func purgeExpired() {
        let descriptor = FetchDescriptor<CachedArticleEntity>()
        guard let all = try? modelContext.fetch(descriptor) else { return }
        for entity in all where entity.isExpired {
            modelContext.delete(entity)
        }
        try? modelContext.save()
    }
}
