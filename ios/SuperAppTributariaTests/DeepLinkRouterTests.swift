import Testing
import Foundation
@testable import SuperAppTributaria

struct DeepLinkRouterTests {

    // MARK: - Valid Routes

    @Test func parsesHomeURL() {
        let url = URL(string: "tribai://home")!
        #expect(DeepLinkRouter.parse(url) == .home)
    }

    @Test func parsesChatURL() {
        let url = URL(string: "tribai://chat")!
        #expect(DeepLinkRouter.parse(url) == .chat)
    }

    @Test func parsesCalculatorsURL() {
        let url = URL(string: "tribai://calculators")!
        #expect(DeepLinkRouter.parse(url) == .calculators)
    }

    @Test func parsesCalculadorasSpanishURL() {
        let url = URL(string: "tribai://calculadoras")!
        #expect(DeepLinkRouter.parse(url) == .calculators)
    }

    @Test func parsesCalculatorWithSlugURL() {
        let url = URL(string: "tribai://calculator/renta")!
        #expect(DeepLinkRouter.parse(url) == .calculator(slug: "renta"))
    }

    @Test func parsesCalculadoraSpanishWithSlugURL() {
        let url = URL(string: "tribai://calculadora/renta")!
        #expect(DeepLinkRouter.parse(url) == .calculator(slug: "renta"))
    }

    @Test func parsesCalculatorWithoutSlugFallsBackToCalculators() {
        let url = URL(string: "tribai://calculator")!
        #expect(DeepLinkRouter.parse(url) == .calculators)
    }

    @Test func parsesETURL() {
        let url = URL(string: "tribai://et")!
        #expect(DeepLinkRouter.parse(url) == .et)
    }

    @Test func parsesEstatutoURL() {
        let url = URL(string: "tribai://estatuto")!
        #expect(DeepLinkRouter.parse(url) == .et)
    }

    @Test func parsesArticleWithSlugURL() {
        let url = URL(string: "tribai://article/240")!
        #expect(DeepLinkRouter.parse(url) == .article(slug: "240"))
    }

    @Test func parsesArticuloSpanishURL() {
        let url = URL(string: "tribai://articulo/240")!
        #expect(DeepLinkRouter.parse(url) == .article(slug: "240"))
    }

    @Test func parsesArticleWithoutSlugFallsBackToET() {
        let url = URL(string: "tribai://article")!
        #expect(DeepLinkRouter.parse(url) == .et)
    }

    @Test func parsesCalendarURL() {
        let url = URL(string: "tribai://calendar")!
        #expect(DeepLinkRouter.parse(url) == .calendar)
    }

    @Test func parsesCalendarioSpanishURL() {
        let url = URL(string: "tribai://calendario")!
        #expect(DeepLinkRouter.parse(url) == .calendar)
    }

    @Test func parsesMoreURL() {
        let url = URL(string: "tribai://more")!
        #expect(DeepLinkRouter.parse(url) == .more)
    }

    @Test func parsesMasSpanishURL() {
        let url = URL(string: "tribai://mas")!
        #expect(DeepLinkRouter.parse(url) == .more)
    }

    // MARK: - Invalid Routes

    @Test func returnsNilForWrongScheme() {
        let url = URL(string: "https://tribai.co/home")!
        #expect(DeepLinkRouter.parse(url) == nil)
    }

    @Test func returnsNilForUnknownHost() {
        let url = URL(string: "tribai://settings")!
        #expect(DeepLinkRouter.parse(url) == nil)
    }

    @Test func returnsNilForEmptyHost() {
        let url = URL(string: "tribai://")!
        #expect(DeepLinkRouter.parse(url) == nil)
    }
}
