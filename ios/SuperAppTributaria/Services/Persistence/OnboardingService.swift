import Foundation

enum OnboardingService {
    private static let key = "hasSeenOnboarding"

    static var hasSeenOnboarding: Bool {
        UserDefaults.standard.bool(forKey: key)
    }

    static func markOnboardingComplete() {
        UserDefaults.standard.set(true, forKey: key)
    }

    static func reset() {
        UserDefaults.standard.removeObject(forKey: key)
    }
}
