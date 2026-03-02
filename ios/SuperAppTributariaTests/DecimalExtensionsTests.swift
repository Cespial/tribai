import Testing
import Foundation
@testable import SuperAppTributaria

struct DecimalExtensionsTests {
    @Test func roundedToInteger() {
        let value: Decimal = Decimal(string: "123.7")!
        #expect(value.rounded == 124)
    }

    @Test func flooredValue() {
        let value: Decimal = Decimal(string: "123.9")!
        #expect(value.floored == 123)
    }

    @Test func ceiledValue() {
        let value: Decimal = Decimal(string: "123.1")!
        #expect(value.ceiled == 124)
    }

    @Test func roundedToPlaces() {
        let value: Decimal = Decimal(string: "123.456789")!
        #expect(value.rounded(to: 2) == Decimal(string: "123.46")!)
    }

    @Test func copToUVT() {
        let cop = TaxData.uvt2026 * 100
        let uvt = cop.copToUVT()
        #expect(uvt == 100)
    }

    @Test func uvtToCOP() {
        let uvtValue: Decimal = 100
        let cop = uvtValue.uvtToCOP()
        #expect(cop == 100 * TaxData.uvt2026)
    }

    @Test func applyRate() {
        let base: Decimal = 1_000_000
        #expect(base.applyRate(Decimal(string: "0.19")!) == 190_000)
    }

    @Test func asPercentageOf() {
        let part: Decimal = 25
        let total: Decimal = 100
        #expect(part.asPercentageOf(total) == Decimal(string: "0.25")!)
    }

    @Test func clampedValue() {
        let value: Decimal = 150
        #expect(value.clamped(min: 0, max: 100) == 100)
        #expect(value.clamped(min: 200, max: 300) == 200)
    }

    @Test func atLeast() {
        let value: Decimal = 5
        #expect(value.atLeast(10) == 10)
        #expect(value.atLeast(3) == 5)
    }

    @Test func atMost() {
        let value: Decimal = 50
        #expect(value.atMost(30) == 30)
        #expect(value.atMost(100) == 50)
    }

    @Test func doubleValue() {
        let value: Decimal = Decimal(string: "123.45")!
        let d = value.doubleValue
        #expect(abs(d - 123.45) < 0.01)
    }
}
