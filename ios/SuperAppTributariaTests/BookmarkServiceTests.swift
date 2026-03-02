import Testing
import Foundation
@testable import SuperAppTributaria

struct BookmarkServiceTests {
    // Note: BookmarkService uses singleton + UserDefaults, so tests check the API contract

    @Test @MainActor func articleBookmarkToggle() {
        let service = BookmarkService.shared
        let slug = "test-article-\(UUID().uuidString)"

        #expect(service.isArticleBookmarked(slug) == false)
        service.toggleArticleBookmark(slug)
        #expect(service.isArticleBookmarked(slug) == true)
        service.toggleArticleBookmark(slug)
        #expect(service.isArticleBookmarked(slug) == false)
    }

    @Test @MainActor func calculatorBookmarkToggle() {
        let service = BookmarkService.shared
        let id = "test-calc-\(UUID().uuidString)"

        #expect(service.isCalculatorBookmarked(id) == false)
        service.toggleCalculatorBookmark(id)
        #expect(service.isCalculatorBookmarked(id) == true)
        service.toggleCalculatorBookmark(id)
        #expect(service.isCalculatorBookmarked(id) == false)
    }

    @Test @MainActor func multipleBookmarks() {
        let service = BookmarkService.shared
        let slug1 = "multi-test-\(UUID().uuidString)"
        let slug2 = "multi-test-\(UUID().uuidString)"

        service.toggleArticleBookmark(slug1)
        service.toggleArticleBookmark(slug2)

        #expect(service.isArticleBookmarked(slug1) == true)
        #expect(service.isArticleBookmarked(slug2) == true)

        // Clean up
        service.toggleArticleBookmark(slug1)
        service.toggleArticleBookmark(slug2)
    }

    @Test @MainActor func bookmarkSetsAccessible() {
        let service = BookmarkService.shared
        // Just verify the sets are accessible
        _ = service.bookmarkedArticleSlugs
        _ = service.bookmarkedCalculatorIds
    }
}
