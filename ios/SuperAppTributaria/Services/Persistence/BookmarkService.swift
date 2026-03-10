import Foundation

@MainActor @Observable
final class BookmarkService {

    static let shared = BookmarkService()

    private(set) var bookmarkedArticleSlugs: Set<String> = []
    private(set) var bookmarkedCalculatorIds: Set<String> = []

    private let articleKey = "bookmarked_article_slugs"
    private let calculatorKey = "bookmarked_calculator_ids"

    private init() {
        loadFromDefaults()
    }

    // MARK: - Articles

    func isArticleBookmarked(_ slug: String) -> Bool {
        bookmarkedArticleSlugs.contains(slug)
    }

    func toggleArticleBookmark(_ slug: String) {
        if bookmarkedArticleSlugs.contains(slug) {
            bookmarkedArticleSlugs.remove(slug)
        } else {
            bookmarkedArticleSlugs.insert(slug)
        }
        saveArticles()
    }

    // MARK: - Calculators

    func isCalculatorBookmarked(_ id: String) -> Bool {
        bookmarkedCalculatorIds.contains(id)
    }

    func toggleCalculatorBookmark(_ id: String) {
        if bookmarkedCalculatorIds.contains(id) {
            bookmarkedCalculatorIds.remove(id)
        } else {
            bookmarkedCalculatorIds.insert(id)
        }
        saveCalculators()
    }

    // MARK: - Persistence

    private func loadFromDefaults() {
        let defaults = UserDefaults.standard
        if let slugs = defaults.array(forKey: articleKey) as? [String] {
            bookmarkedArticleSlugs = Set(slugs)
        }
        if let ids = defaults.array(forKey: calculatorKey) as? [String] {
            bookmarkedCalculatorIds = Set(ids)
        }
    }

    func clearAll() {
        bookmarkedArticleSlugs.removeAll()
        bookmarkedCalculatorIds.removeAll()
        UserDefaults.standard.removeObject(forKey: articleKey)
        UserDefaults.standard.removeObject(forKey: calculatorKey)
    }

    private func saveArticles() {
        UserDefaults.standard.set(Array(bookmarkedArticleSlugs), forKey: articleKey)
    }

    private func saveCalculators() {
        UserDefaults.standard.set(Array(bookmarkedCalculatorIds), forKey: calculatorKey)
    }
}
