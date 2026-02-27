import Foundation

/// Generic ViewModel for calculator detail views.
/// Individual calculator views manage their own input state; this provides shared functionality.
@MainActor
@Observable
final class CalculatorDetailViewModel {

    let calculatorId: String
    var hasCalculated: Bool = false
    var showResult: Bool = false

    init(calculatorId: String) {
        self.calculatorId = calculatorId
    }

    var catalogItem: CalculatorCatalogItem? {
        CalculatorCatalog.item(byId: calculatorId)
    }

    /// Build a chat prompt from calculator results for "Consultar al asistente"
    func buildChatPrompt(summary: String) -> String {
        let title = catalogItem?.title ?? "calculadora"
        return "Acabo de usar la calculadora de \(title). \(summary) Que optimizaciones o recomendaciones me puedes dar?"
    }

    func markCalculated() {
        hasCalculated = true
        showResult = true
        Haptics.success()
    }
}
