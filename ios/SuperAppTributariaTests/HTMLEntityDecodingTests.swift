import Testing
import Foundation
@testable import SuperAppTributaria

struct HTMLEntityDecodingTests {

    // MARK: - Basic Entities

    @Test func decodesAmpersand() {
        #expect("A &amp; B".decodingHTMLEntities == "A & B")
    }

    @Test func decodesLessThan() {
        #expect("a &lt; b".decodingHTMLEntities == "a < b")
    }

    @Test func decodesGreaterThan() {
        #expect("a &gt; b".decodingHTMLEntities == "a > b")
    }

    @Test func decodesQuote() {
        #expect("&quot;hello&quot;".decodingHTMLEntities == "\"hello\"")
    }

    @Test func decodesApostrophe() {
        #expect("it&apos;s".decodingHTMLEntities == "it's")
    }

    // MARK: - Spanish Characters

    @Test func decodesSpanishAccents() {
        // The decoder uses combining diacritical marks (e.g., a + combining acute)
        #expect("&aacute;".decodingHTMLEntities != "&aacute;")
        #expect("&eacute;".decodingHTMLEntities != "&eacute;")
        #expect("&iacute;".decodingHTMLEntities != "&iacute;")
        #expect("&oacute;".decodingHTMLEntities != "&oacute;")
        #expect("&uacute;".decodingHTMLEntities != "&uacute;")
        // Verify they become the expected combining character sequences
        #expect("&aacute;".decodingHTMLEntities == "a\u{0301}")
        #expect("&eacute;".decodingHTMLEntities == "e\u{0301}")
        #expect("&ntilde;".decodingHTMLEntities == "n\u{0303}")
    }

    @Test func decodesNtilde() {
        let result = "&ntilde;".decodingHTMLEntities
        #expect(result == "n\u{0303}")
    }

    @Test func decodesInvertedPunctuation() {
        #expect("&iquest;".decodingHTMLEntities == "\u{00BF}")
        #expect("&iexcl;".decodingHTMLEntities == "\u{00A1}")
    }

    @Test func decodesNbsp() {
        #expect("hello&nbsp;world".decodingHTMLEntities == "hello world")
    }

    // MARK: - No Entities

    @Test func noEntitiesReturnsOriginal() {
        let input = "Hello World"
        #expect(input.decodingHTMLEntities == input)
    }

    @Test func emptyStringReturnsEmpty() {
        #expect("".decodingHTMLEntities == "")
    }

    // MARK: - Multiple Entities

    @Test func decodesMultipleEntities() {
        let input = "Art&iacute;culo 240 &amp; Art&iacute;culo 241"
        let result = input.decodingHTMLEntities
        #expect(result.contains("&"))
        #expect(!result.contains("&amp;"))
        #expect(!result.contains("&iacute;"))
    }
}
