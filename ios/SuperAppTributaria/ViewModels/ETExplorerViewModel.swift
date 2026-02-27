import Foundation

@MainActor @Observable
final class ETExplorerViewModel {
    // MARK: - State

    var searchText = ""
    var selectedLibro: String?
    var selectedEstado: String?
    var selectedLey: String?
    var displayedCount = 60
    var showingFilterSheet = false

    private(set) var allArticles: [ArticleIndexItem] = []
    private(set) var facets: ExplorerFacets?

    // MARK: - Computed

    var filteredArticles: [ArticleIndexItem] {
        let filtered = ArticleSearchEngine.filter(
            articles: allArticles,
            libro: selectedLibro,
            estado: selectedEstado,
            ley: selectedLey
        )
        return ArticleSearchEngine.search(articles: filtered, query: searchText)
    }

    var displayedArticles: [ArticleIndexItem] {
        Array(filteredArticles.prefix(displayedCount))
    }

    var hasMore: Bool {
        displayedCount < filteredArticles.count
    }

    var activeFilterCount: Int {
        var count = 0
        if selectedLibro != nil { count += 1 }
        if selectedEstado != nil { count += 1 }
        if selectedLey != nil { count += 1 }
        return count
    }

    var totalFilteredCount: Int {
        filteredArticles.count
    }

    // MARK: - Actions

    func loadData() {
        allArticles = ArticleIndexService.loadIndex()
        facets = ArticleIndexService.loadFacets()
    }

    func loadMore() {
        displayedCount += 60
    }

    func clearFilters() {
        selectedLibro = nil
        selectedEstado = nil
        selectedLey = nil
        searchText = ""
        displayedCount = 60
    }

    func setLibro(_ libro: String?) {
        selectedLibro = selectedLibro == libro ? nil : libro
        displayedCount = 60
    }

    func setEstado(_ estado: String?) {
        selectedEstado = selectedEstado == estado ? nil : estado
        displayedCount = 60
    }

    func setLey(_ ley: String?) {
        selectedLey = selectedLey == ley ? nil : ley
        displayedCount = 60
    }
}
