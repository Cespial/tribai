import Foundation
import SwiftData

@Model
final class CachedArticleEntity {
    @Attribute(.unique) var slug: String
    var jsonData: Data
    var cachedAt: Date
    var ttlDays: Int

    init(slug: String, jsonData: Data, cachedAt: Date = Date(), ttlDays: Int = 7) {
        self.slug = slug
        self.jsonData = jsonData
        self.cachedAt = cachedAt
        self.ttlDays = ttlDays
    }

    var isExpired: Bool {
        let expiry = Calendar.current.date(byAdding: .day, value: ttlDays, to: cachedAt) ?? cachedAt
        return Date() > expiry
    }
}
