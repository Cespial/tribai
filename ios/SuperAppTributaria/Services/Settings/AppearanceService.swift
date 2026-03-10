import SwiftUI

enum AppearanceMode: Int, CaseIterable {
    case system = 0
    case light = 1
    case dark = 2

    var label: String {
        switch self {
        case .system: return "Sistema"
        case .light: return "Claro"
        case .dark: return "Oscuro"
        }
    }
}

@MainActor @Observable
final class AppearanceService {

    static let shared = AppearanceService()

    private let key = "appearance_mode"

    var mode: AppearanceMode {
        didSet {
            UserDefaults.standard.set(mode.rawValue, forKey: key)
        }
    }

    var colorScheme: ColorScheme? {
        switch mode {
        case .system: return nil
        case .light: return .light
        case .dark: return .dark
        }
    }

    private init() {
        let stored = UserDefaults.standard.integer(forKey: key)
        mode = AppearanceMode(rawValue: stored) ?? .system
    }

    func setMode(_ mode: AppearanceMode) {
        self.mode = mode
    }
}
