import CoreSpotlight
import MobileCoreServices

enum SpotlightIndexService {

    static let articleDomainIdentifier = "co.tribai.app.articles"
    static let calculatorDomainIdentifier = "co.tribai.app.calculators"

    // MARK: - Index All

    static func indexAll() {
        Task.detached(priority: .utility) {
            await indexArticles()
            await indexCalculators()
        }
    }

    // MARK: - Articles

    static func indexArticles() async {
        let articles = await ArticleIndexService.loadIndex()
        guard !articles.isEmpty else { return }

        let items = articles.map { article -> CSSearchableItem in
            let attributes = CSSearchableItemAttributeSet(contentType: .text)
            attributes.title = "\(article.id) — \(article.titulo)"
            attributes.contentDescription = article.previewSnippet
            attributes.keywords = [article.id, article.titulo, article.tituloCorto, article.libro]

            return CSSearchableItem(
                uniqueIdentifier: "article:\(article.slug)",
                domainIdentifier: articleDomainIdentifier,
                attributeSet: attributes
            )
        }

        do {
            try await CSSearchableIndex.default().indexSearchableItems(items)
        } catch {
            // Spotlight indexing is best-effort
        }
    }

    // MARK: - Calculators

    static func indexCalculators() async {
        let items = CalculatorCatalog.all.map { calc -> CSSearchableItem in
            let attributes = CSSearchableItemAttributeSet(contentType: .text)
            attributes.title = calc.title
            attributes.contentDescription = calc.description
            attributes.keywords = calc.tags + [calc.category.displayName]

            return CSSearchableItem(
                uniqueIdentifier: "calculator:\(calc.id)",
                domainIdentifier: calculatorDomainIdentifier,
                attributeSet: attributes
            )
        }

        do {
            try await CSSearchableIndex.default().indexSearchableItems(items)
        } catch {
            // Spotlight indexing is best-effort
        }
    }

    // MARK: - Parse Activity

    static func destination(for uniqueIdentifier: String) -> DeepLinkRouter.Destination? {
        if uniqueIdentifier.hasPrefix("article:") {
            let slug = String(uniqueIdentifier.dropFirst("article:".count))
            return .article(slug: slug)
        }
        if uniqueIdentifier.hasPrefix("calculator:") {
            let slug = String(uniqueIdentifier.dropFirst("calculator:".count))
            return .calculator(slug: slug)
        }
        return nil
    }
}
