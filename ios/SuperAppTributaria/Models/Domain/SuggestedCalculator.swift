import Foundation

struct SuggestedCalculator: Codable, Equatable, Identifiable {
    var id: String { slug }

    let slug: String
    let title: String?
    let description: String?

    enum CodingKeys: String, CodingKey {
        case slug = "href"
        case title = "name"
        case description
    }
}
