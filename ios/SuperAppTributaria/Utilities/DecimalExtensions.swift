import Foundation

extension Decimal {

    // MARK: - Rounding

    /// Round to the nearest integer (banker's rounding).
    var rounded: Decimal {
        var result = Decimal()
        var mutableSelf = self
        NSDecimalRound(&result, &mutableSelf, 0, .plain)
        return result
    }

    /// Round down (floor).
    var floored: Decimal {
        var result = Decimal()
        var mutableSelf = self
        NSDecimalRound(&result, &mutableSelf, 0, .down)
        return result
    }

    /// Round up (ceil).
    var ceiled: Decimal {
        var result = Decimal()
        var mutableSelf = self
        NSDecimalRound(&result, &mutableSelf, 0, .up)
        return result
    }

    /// Round to N decimal places.
    func rounded(to places: Int) -> Decimal {
        var result = Decimal()
        var mutableSelf = self
        NSDecimalRound(&result, &mutableSelf, places, .plain)
        return result
    }

    // MARK: - UVT Conversion

    /// Convert COP to UVT using the given UVT rate.
    func copToUVT(uvtRate: Decimal = TaxData.uvt2026) -> Decimal {
        guard uvtRate > 0 else { return 0 }
        return self / uvtRate
    }

    /// Convert UVT to COP using the given UVT rate.
    func uvtToCOP(uvtRate: Decimal = TaxData.uvt2026) -> Decimal {
        return self * uvtRate
    }

    // MARK: - Percentage

    /// Apply a percentage rate to this value.
    func applyRate(_ rate: Decimal) -> Decimal {
        return self * rate
    }

    /// Calculate what percentage this value represents of a total.
    func asPercentageOf(_ total: Decimal) -> Decimal {
        guard total > 0 else { return 0 }
        return (self / total)
    }

    // MARK: - Helpers

    /// Clamp value between min and max.
    func clamped(min: Decimal, max: Decimal) -> Decimal {
        if self < min { return min }
        if self > max { return max }
        return self
    }

    /// Return the greater of self and other.
    func atLeast(_ other: Decimal) -> Decimal {
        return Swift.max(self, other)
    }

    /// Return the lesser of self and other.
    func atMost(_ other: Decimal) -> Decimal {
        return Swift.min(self, other)
    }

    /// Convert Decimal to Double (for charts/UI that need Double).
    var doubleValue: Double {
        return NSDecimalNumber(decimal: self).doubleValue
    }
}
