import AppIntents
import Foundation

struct ConvertUVTIntent: AppIntent {
    static let title: LocalizedStringResource = "Convertir UVT a pesos"
    static let description = IntentDescription("Convierte un valor en UVT a pesos colombianos")

    @Parameter(title: "Cantidad de UVT")
    var uvtAmount: Double

    static var parameterSummary: some ParameterSummary {
        Summary("Convertir \(\.$uvtAmount) UVT a pesos colombianos")
    }

    func perform() async throws -> some IntentResult & ProvidesDialog {
        let uvtRate: Decimal = 52_374 // TaxData.uvt2026
        let amount = Decimal(uvtAmount)
        let cop = amount * uvtRate

        let formatter = NumberFormatter()
        formatter.numberStyle = .decimal
        formatter.groupingSeparator = "."
        formatter.decimalSeparator = ","
        formatter.maximumFractionDigits = 0

        let formatted = formatter.string(from: NSDecimalNumber(decimal: cop)) ?? "\(cop)"

        return .result(
            dialog: "\(uvtAmount.formatted(.number.precision(.fractionLength(0)))) UVT equivale a $\(formatted) pesos colombianos (UVT 2026: $52.374)"
        )
    }
}
