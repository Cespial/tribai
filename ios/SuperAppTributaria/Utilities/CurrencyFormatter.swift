import Foundation

/// Formats values in Colombian Peso (COP) style: dot for thousands, no decimals for whole numbers.
/// Examples: "$52.374", "$1.750.905", "$80.000.000"
enum CurrencyFormatter {

    private static let copFormatter: NumberFormatter = {
        let f = NumberFormatter()
        f.numberStyle = .decimal
        f.groupingSeparator = "."
        f.decimalSeparator = ","
        f.maximumFractionDigits = 0
        f.minimumFractionDigits = 0
        return f
    }()

    private static let copFormatterDecimals: NumberFormatter = {
        let f = NumberFormatter()
        f.numberStyle = .decimal
        f.groupingSeparator = "."
        f.decimalSeparator = ","
        f.maximumFractionDigits = 2
        f.minimumFractionDigits = 2
        return f
    }()

    private static let percentFormatter: NumberFormatter = {
        let f = NumberFormatter()
        f.numberStyle = .decimal
        f.maximumFractionDigits = 2
        f.minimumFractionDigits = 0
        f.decimalSeparator = ","
        return f
    }()

    /// Format as COP: "$1.750.905"
    static func cop(_ value: Decimal) -> String {
        let nsNumber = NSDecimalNumber(decimal: value)
        let formatted = copFormatter.string(from: nsNumber) ?? "\(value)"
        return "$\(formatted)"
    }

    /// Format as COP with decimals: "$1.750.905,50"
    static func copWithDecimals(_ value: Decimal) -> String {
        let nsNumber = NSDecimalNumber(decimal: value)
        let formatted = copFormatterDecimals.string(from: nsNumber) ?? "\(value)"
        return "$\(formatted)"
    }

    /// Format number without currency symbol: "1.750.905"
    static func number(_ value: Decimal) -> String {
        let nsNumber = NSDecimalNumber(decimal: value)
        return copFormatter.string(from: nsNumber) ?? "\(value)"
    }

    /// Format as percentage: "35%", "19,5%"
    static func percent(_ value: Decimal) -> String {
        let pct = value * 100
        let nsNumber = NSDecimalNumber(decimal: pct)
        let formatted = percentFormatter.string(from: nsNumber) ?? "\(pct)"
        return "\(formatted)%"
    }

    /// Format UVT value with COP equivalent: "1.090 UVT ($57.087.660)"
    static func uvtWithCOP(_ uvtValue: Decimal, uvtRate: Decimal = TaxData.uvt2026) -> String {
        let cop = uvtValue * uvtRate
        return "\(number(uvtValue)) UVT (\(self.cop(cop)))"
    }
}
