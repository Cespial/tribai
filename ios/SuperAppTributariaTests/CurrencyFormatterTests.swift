import Testing
import Foundation
@testable import SuperAppTributaria

struct CurrencyFormatterTests {
    @Test func copFormatWithDollarSign() {
        let result = CurrencyFormatter.cop(1_750_905)
        #expect(result.hasPrefix("$"))
        #expect(result.contains("1.750.905"))
    }

    @Test func copZero() {
        let result = CurrencyFormatter.cop(0)
        #expect(result == "$0")
    }

    @Test func copWithDecimalsFormat() {
        let result = CurrencyFormatter.copWithDecimals(1_000.50)
        #expect(result.contains(",50"))
    }

    @Test func numberFormatNoSymbol() {
        let result = CurrencyFormatter.number(52_374)
        #expect(!result.contains("$"))
        #expect(result.contains("52.374"))
    }

    @Test func percentFormat() {
        let result = CurrencyFormatter.percent(Decimal(string: "0.35")!)
        #expect(result == "35%")
    }

    @Test func percentWithDecimals() {
        let result = CurrencyFormatter.percent(Decimal(string: "0.195")!)
        #expect(result == "19,5%")
    }

    @Test func uvtWithCOPFormat() {
        let result = CurrencyFormatter.uvtWithCOP(1_090)
        #expect(result.contains("UVT"))
        #expect(result.contains("$"))
    }

    @Test func largeNumberFormat() {
        let result = CurrencyFormatter.cop(1_000_000_000)
        #expect(result.contains("1.000.000.000"))
    }
}
