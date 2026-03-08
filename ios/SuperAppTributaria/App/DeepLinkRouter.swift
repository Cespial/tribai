import Foundation

/// Handles deep link routing for the app.
/// Supports URL scheme: tribai://
/// Examples:
///   tribai://article/240
///   tribai://calculator/renta
///   tribai://chat
///   tribai://calendar
///   tribai://home
enum DeepLinkRouter {
    enum Destination: Equatable {
        case home
        case chat
        case calculators
        case calculator(slug: String)
        case et
        case article(slug: String)
        case calendar
        case more
    }

    static func parse(_ url: URL) -> Destination? {
        guard url.scheme == "tribai" else { return nil }

        let host = url.host ?? ""
        let pathComponents = url.pathComponents.filter { $0 != "/" }

        switch host {
        case "home":
            return .home
        case "chat":
            return .chat
        case "calculators", "calculadoras":
            return .calculators
        case "calculator", "calculadora":
            if let slug = pathComponents.first {
                return .calculator(slug: slug)
            }
            return .calculators
        case "et", "estatuto":
            return .et
        case "article", "articulo":
            if let slug = pathComponents.first {
                return .article(slug: slug)
            }
            return .et
        case "calendar", "calendario":
            return .calendar
        case "more", "mas":
            return .more
        default:
            return nil
        }
    }
}
