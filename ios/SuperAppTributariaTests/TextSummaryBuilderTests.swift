import Testing
import Foundation
@testable import SuperAppTributaria

struct TextSummaryBuilderTests {

    // MARK: - Basic Output

    @Test func buildsBasicSummary() {
        let result = TextSummaryBuilder.buildSummary(
            title: "Test Calculator",
            mainLabel: "Total",
            mainValue: "$1,000,000",
            rows: [("Item A", "$500,000"), ("Item B", "$500,000")]
        )
        #expect(result.contains("=== Test Calculator ==="))
        #expect(result.contains("Total: $1,000,000"))
        #expect(result.contains("Item A"))
        #expect(result.contains("$500,000"))
        #expect(result.contains("Generado con TribAI — tribai.co"))
    }

    @Test func includesDisclaimer() {
        let result = TextSummaryBuilder.buildSummary(
            title: "Title",
            mainLabel: "Result",
            mainValue: "100",
            rows: [],
            disclaimer: "Valores informativos"
        )
        #expect(result.contains("Nota: Valores informativos"))
    }

    @Test func omitsDisclaimerWhenNil() {
        let result = TextSummaryBuilder.buildSummary(
            title: "Title",
            mainLabel: "Result",
            mainValue: "100",
            rows: [],
            disclaimer: nil
        )
        #expect(!result.contains("Nota:"))
    }

    @Test func includesSeparatorLine() {
        let result = TextSummaryBuilder.buildSummary(
            title: "T",
            mainLabel: "L",
            mainValue: "V",
            rows: []
        )
        #expect(result.contains(String(repeating: "-", count: 40)))
    }

    @Test func handlesEmptyRows() {
        let result = TextSummaryBuilder.buildSummary(
            title: "Title",
            mainLabel: "Label",
            mainValue: "Value",
            rows: []
        )
        // Should still produce valid output without crashing
        #expect(result.contains("=== Title ==="))
        #expect(result.contains("Label: Value"))
    }

    @Test func handlesLongLabels() {
        let longLabel = String(repeating: "A", count: 50)
        let result = TextSummaryBuilder.buildSummary(
            title: "T",
            mainLabel: "L",
            mainValue: "V",
            rows: [(longLabel, "100")]
        )
        #expect(result.contains(longLabel))
        #expect(result.contains("100"))
    }

    @Test func multipleRowsAllPresent() {
        let rows: [(String, String)] = [
            ("Salud", "$150,000"),
            ("Pension", "$200,000"),
            ("ARL", "$10,000"),
        ]
        let result = TextSummaryBuilder.buildSummary(
            title: "Nomina",
            mainLabel: "Total costo",
            mainValue: "$2,500,000",
            rows: rows
        )
        for row in rows {
            #expect(result.contains(row.0))
            #expect(result.contains(row.1))
        }
    }
}
