import Testing
import Foundation
@testable import SuperAppTributaria

struct SpotlightIndexServiceTests {

    // MARK: - Destination Parsing

    @Test func parsesArticleIdentifier() {
        let dest = SpotlightIndexService.destination(for: "article:art-240")
        #expect(dest == .article(slug: "art-240"))
    }

    @Test func parsesCalculatorIdentifier() {
        let dest = SpotlightIndexService.destination(for: "calculator:renta")
        #expect(dest == .calculator(slug: "renta"))
    }

    @Test func returnsNilForUnknownPrefix() {
        #expect(SpotlightIndexService.destination(for: "unknown:test") == nil)
    }

    @Test func returnsNilForEmptyString() {
        #expect(SpotlightIndexService.destination(for: "") == nil)
    }

    @Test func parsesArticleWithComplexSlug() {
        let dest = SpotlightIndexService.destination(for: "article:art-292-2")
        #expect(dest == .article(slug: "art-292-2"))
    }

    // MARK: - Domain Identifiers

    @Test func articleDomainIsCorrect() {
        #expect(SpotlightIndexService.articleDomainIdentifier == "co.tribai.app.articles")
    }

    @Test func calculatorDomainIsCorrect() {
        #expect(SpotlightIndexService.calculatorDomainIdentifier == "co.tribai.app.calculators")
    }
}
