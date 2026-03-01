import Foundation

@MainActor
@Observable
final class RetencionTablaViewModel {

    // MARK: - State

    var searchText: String = ""
    var selectedCategory: String?
    var expandedConceptId: String?

    // MARK: - UVT 2026

    private static let uvt2026: Decimal = TaxData.uvt2026

    // MARK: - Number Formatters

    private static let currencyFormatter: NumberFormatter = {
        let f = NumberFormatter()
        f.numberStyle = .currency
        f.locale = Locale(identifier: "es_CO")
        f.currencyCode = "COP"
        f.currencySymbol = "$"
        f.maximumFractionDigits = 0
        f.minimumFractionDigits = 0
        return f
    }()

    private static let percentFormatter: NumberFormatter = {
        let f = NumberFormatter()
        f.numberStyle = .decimal
        f.maximumFractionDigits = 2
        f.minimumFractionDigits = 0
        return f
    }()

    // MARK: - Computed Properties

    var categories: [String] {
        RetencionTablaData.categories
    }

    var filteredConceptos: [RetencionConceptoCompleto] {
        RetencionTablaData.conceptos.filter { concepto in
            // Category filter
            if let category = selectedCategory, concepto.categoria != category {
                return false
            }

            // Search filter
            if !searchText.isEmpty {
                let query = searchText.lowercased()
                let matchesConcepto = concepto.concepto.lowercased().contains(query)
                let matchesArticulo = concepto.articulo.lowercased().contains(query)
                let matchesKeywords = concepto.keywords.contains { $0.lowercased().contains(query) }
                let matchesCategoria = concepto.categoria.lowercased().contains(query)
                let matchesNotas = concepto.notas?.lowercased().contains(query) ?? false
                return matchesConcepto || matchesArticulo || matchesKeywords || matchesCategoria || matchesNotas
            }

            return true
        }
    }

    // MARK: - Methods

    func toggleExpanded(id: String) {
        if expandedConceptId == id {
            expandedConceptId = nil
        } else {
            expandedConceptId = id
        }
    }

    func formattedTarifa(_ decimal: Decimal) -> String {
        let percentage = decimal * 100
        let nsNumber = NSDecimalNumber(decimal: percentage)
        guard let formatted = Self.percentFormatter.string(from: nsNumber) else {
            return "\(percentage)%"
        }
        return "\(formatted)%"
    }

    func baseMinCOP(_ uvt: Decimal) -> String {
        let cop = uvt * Self.uvt2026
        let nsNumber = NSDecimalNumber(decimal: cop)
        guard let formatted = Self.currencyFormatter.string(from: nsNumber) else {
            return "$ \(cop)"
        }
        return formatted
    }
}
