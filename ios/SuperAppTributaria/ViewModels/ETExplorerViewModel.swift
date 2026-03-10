import Foundation

@MainActor @Observable
final class ETExplorerViewModel {
    // MARK: - State

    var searchText = "" { didSet { recomputeFiltered() } }
    var selectedLibro: String? { didSet { recomputeFiltered() } }
    var selectedEstado: String? { didSet { recomputeFiltered() } }
    var selectedLey: String? { didSet { recomputeFiltered() } }
    var displayedCount = 60
    var showingFilterSheet = false
    var isLoading = false
    var loadError: String?

    private(set) var allArticles: [ArticleIndexItem] = []
    private(set) var facets: ExplorerFacets?
    private(set) var filteredArticles: [ArticleIndexItem] = []

    // MARK: - Computed

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

    func loadData() async {
        isLoading = true
        loadError = nil

        let articles = await ArticleIndexService.loadIndex()
        let loadedFacets = ArticleIndexService.loadFacets()

        if articles.isEmpty && loadedFacets == nil {
            loadError = "No se pudo cargar el índice de artículos. Verifica que los datos estén incluidos en la app."
        } else {
            allArticles = articles
            facets = loadedFacets
            recomputeFiltered()
        }

        isLoading = false
    }

    func loadMore() {
        displayedCount += 60
    }

    func clearFilters() {
        selectedLibro = nil
        selectedEstado = nil
        selectedLey = nil
        displayedCount = 60
    }

    func clearAll() {
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

    // MARK: - Private

    private func recomputeFiltered() {
        let filtered = ArticleSearchEngine.filter(
            articles: allArticles,
            libro: selectedLibro,
            estado: selectedEstado,
            ley: selectedLey
        )
        filteredArticles = ArticleSearchEngine.search(articles: filtered, query: searchText)
        displayedCount = 60
    }
}
