import Testing
import Foundation
@testable import SuperAppTributaria

struct DecimalExtensionsEdgeCaseTests {

    // MARK: - Rounding boundary values

    @Test func roundedExactlyHalf() {
        let value: Decimal = Decimal(string: "0.5")!
        #expect(value.rounded == 0 || value.rounded == 1) // Banker's rounding
    }

    @Test func roundedNegativeValue() {
        let value: Decimal = Decimal(string: "-3.7")!
        #expect(value.rounded == -4)
    }

    @Test func flooredNegativeValue() {
        let value: Decimal = Decimal(string: "-3.1")!
        #expect(value.floored == -4)
    }

    @Test func ceiledNegativeValue() {
        let value: Decimal = Decimal(string: "-3.9")!
        #expect(value.ceiled == -3)
    }

    @Test func roundedToZeroPlaces() {
        let value: Decimal = Decimal(string: "123.456")!
        #expect(value.rounded(to: 0) == 123)
    }

    @Test func roundedToManyPlaces() {
        let value: Decimal = Decimal(string: "1.123456789")!
        let result = value.rounded(to: 6)
        #expect(result == Decimal(string: "1.123457")!)
    }

    @Test func flooredZero() {
        let value: Decimal = 0
        #expect(value.floored == 0)
    }

    @Test func ceiledZero() {
        let value: Decimal = 0
        #expect(value.ceiled == 0)
    }

    // MARK: - UVT conversion edge cases

    @Test func copToUVTZero() {
        let result: Decimal = 0
        #expect(result.copToUVT() == 0)
    }

    @Test func copToUVTWithZeroRate() {
        let result: Decimal = 1_000_000
        #expect(result.copToUVT(uvtRate: 0) == 0)
    }

    @Test func uvtToCOPZero() {
        let result: Decimal = 0
        #expect(result.uvtToCOP() == 0)
    }

    @Test func copToUVTRoundTrip() {
        let original: Decimal = 100
        let cop = original.uvtToCOP()
        let backToUVT = cop.copToUVT()
        #expect(backToUVT == original)
    }

    // MARK: - Percentage edge cases

    @Test func applyRateZero() {
        let base: Decimal = 1_000_000
        #expect(base.applyRate(0) == 0)
    }

    @Test func applyRateOne() {
        let base: Decimal = 1_000_000
        #expect(base.applyRate(1) == 1_000_000)
    }

    @Test func asPercentageOfZeroTotal() {
        let part: Decimal = 50
        #expect(part.asPercentageOf(0) == 0)
    }

    @Test func asPercentageOfItself() {
        let value: Decimal = 100
        #expect(value.asPercentageOf(100) == 1)
    }

    // MARK: - Clamped edge cases

    @Test func clampedWithinRange() {
        let value: Decimal = 50
        #expect(value.clamped(min: 0, max: 100) == 50)
    }

    @Test func clampedAtExactMin() {
        let value: Decimal = 0
        #expect(value.clamped(min: 0, max: 100) == 0)
    }

    @Test func clampedAtExactMax() {
        let value: Decimal = 100
        #expect(value.clamped(min: 0, max: 100) == 100)
    }

    @Test func clampedNegativeRange() {
        let value: Decimal = -50
        #expect(value.clamped(min: -100, max: -10) == -50)
    }

    // MARK: - atLeast / atMost edge cases

    @Test func atLeastSameValue() {
        let value: Decimal = 10
        #expect(value.atLeast(10) == 10)
    }

    @Test func atMostSameValue() {
        let value: Decimal = 30
        #expect(value.atMost(30) == 30)
    }

    @Test func atLeastNegative() {
        let value: Decimal = -5
        #expect(value.atLeast(-10) == -5)
    }

    @Test func atMostNegative() {
        let value: Decimal = -5
        #expect(value.atMost(-1) == -5)
    }

    // MARK: - doubleValue

    @Test func doubleValueZero() {
        let value: Decimal = 0
        #expect(value.doubleValue == 0.0)
    }

    @Test func doubleValueLargeNumber() {
        let value: Decimal = 1_000_000_000
        #expect(abs(value.doubleValue - 1_000_000_000.0) < 1.0)
    }

    @Test func doubleValueNegative() {
        let value: Decimal = Decimal(string: "-42.5")!
        #expect(abs(value.doubleValue - (-42.5)) < 0.01)
    }
}
