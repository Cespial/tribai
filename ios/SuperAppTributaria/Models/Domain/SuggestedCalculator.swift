import Foundation

struct SuggestedCalculator: Codable, Equatable, Identifiable {
    var id: String { slug }

    let slug: String
    let title: String?
    let description: String?
}
