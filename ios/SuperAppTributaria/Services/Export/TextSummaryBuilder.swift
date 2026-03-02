import Foundation

enum TextSummaryBuilder {

    static func buildSummary(
        title: String,
        mainLabel: String,
        mainValue: String,
        rows: [(label: String, value: String)],
        disclaimer: String? = nil
    ) -> String {
        var lines: [String] = []
        lines.append("=== \(title) ===")
        lines.append("")
        lines.append("\(mainLabel): \(mainValue)")
        lines.append(String(repeating: "-", count: 40))

        for row in rows {
            let padding = max(0, 30 - row.label.count)
            lines.append("\(row.label)\(String(repeating: " ", count: padding))\(row.value)")
        }

        if let disclaimer {
            lines.append("")
            lines.append("Nota: \(disclaimer)")
        }

        lines.append("")
        lines.append("Generado con SuperApp Tributaria Colombia")

        return lines.joined(separator: "\n")
    }
}
