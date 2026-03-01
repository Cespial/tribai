import Foundation

@MainActor
@Observable
final class GlosarioViewModel {
    var searchText: String = ""
    var selectedLetter: String?

    var availableLetters: [String] { GlosarioData.availableLetters }

    var filteredTerms: [GlosarioTerm] {
        GlosarioData.terminos.filter { term in
            if let letter = selectedLetter {
                guard term.termino.uppercased().hasPrefix(letter) else { return false }
            }
            if !searchText.isEmpty {
                let q = searchText.lowercased()
                return term.termino.lowercased().contains(q) || term.definicion.lowercased().contains(q)
            }
            return true
        }
        .sorted { $0.termino.localizedCaseInsensitiveCompare($1.termino) == .orderedAscending }
    }

    var termCount: Int { filteredTerms.count }
}
