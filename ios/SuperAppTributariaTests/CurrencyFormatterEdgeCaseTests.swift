import Testing
import Foundation
@testable import SuperAppTributaria

struct CurrencyFormatterEdgeCaseTests {

    // MARK: - COP format edge cases

    @Test func copNegativeValue() {
        let result = CurrencyFormatter.cop(-500_000)
        #expect(result.contains("500.000"))
        #expect(result.contains("-"))
    }

    @Test func copVeryLargeNumber() {
        let result = CurrencyFormatter.cop(999_999_999_999)
        #expect(result.hasPrefix("$"))
        #expect(result.contains("999"))
    }

    @Test func copSmallValue() {
        let result = CurrencyFormatter.cop(1)
        #expect(result == "$1")
    }

    @Test func copDecimalTruncated() {
        let result = CurrencyFormatter.cop(Decimal(string: "1000.99")!)
        // Should show no decimals
        #expect(result == "$1.001")
    }

    @Test func copUVTValue() {
        let result = CurrencyFormatter.cop(TaxData.uvt2026)
        #expect(result == "$52.374")
    }

    @Test func copSMLMVValue() {
        let result = CurrencyFormatter.cop(TaxData.smlmv2026)
        #expect(result == "$1.750.905")
    }

    // MARK: - COP with decimals

    @Test func copWithDecimalsZero() {
        let result = CurrencyFormatter.copWithDecimals(0)
        #expect(result == "$0,00")
    }

    @Test func copWithDecimalsExactCentavos() {
        let result = CurrencyFormatter.copWithDecimals(Decimal(string: "1000.25")!)
        #expect(result.contains(",25"))
    }

    @Test func copWithDecimalsNegative() {
        let result = CurrencyFormatter.copWithDecimals(-1_500_000)
        #expect(result.contains("1.500.000"))
        #expect(result.contains(",00"))
    }

    // MARK: - Number format

    @Test func numberZero() {
        let result = CurrencyFormatter.number(0)
        #expect(result == "0")
    }

    @Test func numberDoesNotContainDollarSign() {
        let result = CurrencyFormatter.number(1_000_000)
        #expect(!result.contains("$"))
        #expect(result == "1.000.000")
    }

    @Test func numberNegative() {
        let result = CurrencyFormatter.number(-42_000)
        #expect(result.contains("42.000"))
    }

    // MARK: - Percent format

    @Test func percentZero() {
        let result = CurrencyFormatter.percent(0)
        #expect(result == "0%")
    }

    @Test func percentOneHundred() {
        let result = CurrencyFormatter.percent(1)
        #expect(result == "100%")
    }

    @Test func percentSmallDecimal() {
        let result = CurrencyFormatter.percent(Decimal(string: "0.004")!)
        #expect(result == "0,4%")
    }

    @Test func percentOver100() {
        let result = CurrencyFormatter.percent(Decimal(string: "1.5")!)
        #expect(result == "150%")
    }

    // MARK: - UVT with COP

    @Test func uvtWithCOPZeroUVT() {
        let result = CurrencyFormatter.uvtWithCOP(0)
        #expect(result.contains("0 UVT"))
        #expect(result.contains("$0"))
    }

    @Test func uvtWithCOPCustomRate() {
        let result = CurrencyFormatter.uvtWithCOP(100, uvtRate: 50_000)
        #expect(result.contains("100 UVT"))
        #expect(result.contains("$5.000.000"))
    }

    @Test func uvtWithCOPLargeValue() {
        let result = CurrencyFormatter.uvtWithCOP(72_000)
        #expect(result.contains("72.000 UVT"))
        #expect(result.contains("$"))
    }
}
