import Foundation

enum ArticleIndexService {
    static func loadIndex() async -> [ArticleIndexItem] {
        await Task.detached {
            guard let url = Bundle.main.url(forResource: "articles-index.enriched", withExtension: "json"),
                  let data = try? Data(contentsOf: url),
                  let items = try? JSONDecoder().decode([ArticleIndexItem].self, from: data)
            else { return [] }
            return items
        }.value
    }

    static func loadFacets() -> ExplorerFacets? {
        guard let url = Bundle.main.url(forResource: "explorer-facets", withExtension: "json"),
              let data = try? Data(contentsOf: url),
              let facets = try? JSONDecoder().decode(ExplorerFacets.self, from: data)
        else { return nil }
        return facets
    }
}
