import Testing
import Foundation
@testable import SuperAppTributaria

struct DeepLinkRouterEdgeCaseTests {

    // MARK: - Malformed URLs

    @Test func uppercaseHostReturnsNil() {
        // Custom URL scheme hosts are case-sensitive
        let url = URL(string: "tribai://HOME")!
        // "HOME" != "home", so parse returns nil
        let parsed = DeepLinkRouter.parse(url)
        #expect(parsed == nil)
    }

    @Test func urlWithTrailingSlash() {
        let url = URL(string: "tribai://chat/")!
        #expect(DeepLinkRouter.parse(url) == .chat)
    }

    @Test func calculatorWithMultiplePathComponents() {
        let url = URL(string: "tribai://calculator/renta/extra")!
        let result = DeepLinkRouter.parse(url)
        #expect(result == .calculator(slug: "renta"))
    }

    @Test func articleWithNumericSlug() {
        let url = URL(string: "tribai://article/240-1")!
        #expect(DeepLinkRouter.parse(url) == .article(slug: "240-1"))
    }

    @Test func articleWithLongSlug() {
        let url = URL(string: "tribai://article/impuesto-sobre-la-renta-personas-naturales")!
        #expect(DeepLinkRouter.parse(url) == .article(slug: "impuesto-sobre-la-renta-personas-naturales"))
    }

    @Test func calculadoraWithoutSlugFallsBack() {
        let url = URL(string: "tribai://calculadora")!
        #expect(DeepLinkRouter.parse(url) == .calculators)
    }

    @Test func articuloWithoutSlugFallsBack() {
        let url = URL(string: "tribai://articulo")!
        #expect(DeepLinkRouter.parse(url) == .et)
    }

    @Test func urlWithQueryParametersIgnored() {
        let url = URL(string: "tribai://chat?ref=push")!
        #expect(DeepLinkRouter.parse(url) == .chat)
    }

    @Test func urlWithFragmentIgnored() {
        let url = URL(string: "tribai://home#section")!
        #expect(DeepLinkRouter.parse(url) == .home)
    }

    @Test func differentSchemeReturnsNil() {
        let url = URL(string: "myapp://home")!
        #expect(DeepLinkRouter.parse(url) == nil)
    }

    @Test func httpSchemeReturnsNil() {
        let url = URL(string: "http://tribai.co/home")!
        #expect(DeepLinkRouter.parse(url) == nil)
    }

    // MARK: - Destination Equatable

    @Test func destinationsAreEquatable() {
        #expect(DeepLinkRouter.Destination.home == DeepLinkRouter.Destination.home)
        #expect(DeepLinkRouter.Destination.chat == DeepLinkRouter.Destination.chat)
        #expect(DeepLinkRouter.Destination.calculators == DeepLinkRouter.Destination.calculators)
        #expect(DeepLinkRouter.Destination.et == DeepLinkRouter.Destination.et)
        #expect(DeepLinkRouter.Destination.calendar == DeepLinkRouter.Destination.calendar)
        #expect(DeepLinkRouter.Destination.more == DeepLinkRouter.Destination.more)
    }

    @Test func calculatorSlugsAreCompared() {
        #expect(DeepLinkRouter.Destination.calculator(slug: "renta") == DeepLinkRouter.Destination.calculator(slug: "renta"))
        #expect(DeepLinkRouter.Destination.calculator(slug: "renta") != DeepLinkRouter.Destination.calculator(slug: "iva"))
    }

    @Test func articleSlugsAreCompared() {
        #expect(DeepLinkRouter.Destination.article(slug: "240") == DeepLinkRouter.Destination.article(slug: "240"))
        #expect(DeepLinkRouter.Destination.article(slug: "240") != DeepLinkRouter.Destination.article(slug: "241"))
    }

    @Test func differentDestinationsAreNotEqual() {
        #expect(DeepLinkRouter.Destination.home != DeepLinkRouter.Destination.chat)
        #expect(DeepLinkRouter.Destination.et != DeepLinkRouter.Destination.more)
    }

    @Test func unknownRouteVariants() {
        let urls = ["tribai://profile", "tribai://login", "tribai://search", "tribai://favorites"]
        for urlStr in urls {
            let url = URL(string: urlStr)!
            #expect(DeepLinkRouter.parse(url) == nil)
        }
    }

    @Test func calculatorSlugWithSpecialCharacters() {
        let url = URL(string: "tribai://calculator/renta%20pn")!
        let result = DeepLinkRouter.parse(url)
        #expect(result == .calculator(slug: "renta pn"))
    }
}
