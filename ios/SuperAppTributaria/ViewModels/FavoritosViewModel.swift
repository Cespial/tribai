import Foundation

@MainActor @Observable
final class FavoritosViewModel {

    enum Tab: String, CaseIterable, Identifiable {
        case articulos = "Articulos"
        case calculadoras = "Calculadoras"

        var id: String { rawValue }
    }

    var selectedTab: Tab = .articulos

    private let bookmarks = BookmarkService.shared

    var articleSlugs: [String] {
        Array(bookmarks.bookmarkedArticleSlugs).sorted()
    }

    var calculatorIds: [String] {
        Array(bookmarks.bookmarkedCalculatorIds).sorted()
    }

    var articleCount: Int { bookmarks.bookmarkedArticleSlugs.count }
    var calculatorCount: Int { bookmarks.bookmarkedCalculatorIds.count }
    var isEmpty: Bool { articleCount == 0 && calculatorCount == 0 }
}
