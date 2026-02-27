import Foundation

@MainActor
@Observable
final class CalculatorListViewModel {

    var searchText: String = ""
    var selectedCategory: CalculatorCategory = .todas

    private let recentsKey = "recentCalculators"

    var filteredCalculators: [CalculatorCatalogItem] {
        var items: [CalculatorCatalogItem]

        if !searchText.isEmpty {
            items = CalculatorCatalog.search(searchText)
        } else {
            items = CalculatorCatalog.items(for: selectedCategory)
        }

        return items
    }

    var categories: [CalculatorCategory] {
        CalculatorCategory.allCases
    }

    func trackUsage(_ calculatorId: String) {
        var recents = UserDefaults.standard.stringArray(forKey: recentsKey) ?? []
        recents.removeAll { $0 == calculatorId }
        recents.insert(calculatorId, at: 0)
        if recents.count > 6 {
            recents = Array(recents.prefix(6))
        }
        UserDefaults.standard.set(recents, forKey: recentsKey)
    }
}
