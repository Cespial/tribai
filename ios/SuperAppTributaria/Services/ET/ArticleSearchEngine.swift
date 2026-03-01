import Foundation

enum ArticleSearchEngine {
    static func search(articles: [ArticleIndexItem], query: String) -> [ArticleIndexItem] {
        let trimmed = query.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return articles }

        let normalized = trimmed.folding(
            options: [.diacriticInsensitive, .caseInsensitive],
            locale: .current
        )

        return articles.filter { item in
            item.searchableText.contains(normalized)
        }
    }

    static func filter(
        articles: [ArticleIndexItem],
        libro: String?,
        estado: String?,
        ley: String?
    ) -> [ArticleIndexItem] {
        articles.filter { item in
            if let libro, !libro.isEmpty, item.libro != libro {
                return false
            }
            if let estado, !estado.isEmpty, item.estado.rawValue != estado {
                return false
            }
            if let ley, !ley.isEmpty {
                let match = item.leyesModificatoriasNormalized.contains(ley)
                    || item.leyesModificatorias.contains { $0.localizedCaseInsensitiveContains(ley) }
                if !match { return false }
            }
            return true
        }
    }
}
