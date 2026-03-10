import Testing
import SwiftUI
@testable import SuperAppTributaria

struct AppearanceServiceTests {

    // MARK: - Default State

    @Test @MainActor func defaultModeIsSystem() {
        // Reset to default before testing
        let service = AppearanceService.shared
        service.setMode(.system)
        #expect(service.mode == .system)
    }

    // MARK: - ColorScheme Mapping

    @Test @MainActor func lightModeReturnsLightColorScheme() {
        let service = AppearanceService.shared
        service.setMode(.light)
        #expect(service.colorScheme == .light)
        // Cleanup
        service.setMode(.system)
    }

    @Test @MainActor func darkModeReturnsDarkColorScheme() {
        let service = AppearanceService.shared
        service.setMode(.dark)
        #expect(service.colorScheme == .dark)
        // Cleanup
        service.setMode(.system)
    }

    @Test @MainActor func systemModeReturnsNilColorScheme() {
        let service = AppearanceService.shared
        service.setMode(.system)
        #expect(service.colorScheme == nil)
    }

    // MARK: - Mode Labels

    @Test func allModesHaveLabels() {
        for mode in AppearanceMode.allCases {
            #expect(!mode.label.isEmpty, "Mode \(mode) should have a non-empty label")
        }
    }

    @Test func specificLabels() {
        #expect(AppearanceMode.system.label == "Sistema")
        #expect(AppearanceMode.light.label == "Claro")
        #expect(AppearanceMode.dark.label == "Oscuro")
    }

    // MARK: - CaseIterable

    @Test func allCasesContainsThreeModes() {
        #expect(AppearanceMode.allCases.count == 3)
        #expect(AppearanceMode.allCases.contains(.system))
        #expect(AppearanceMode.allCases.contains(.light))
        #expect(AppearanceMode.allCases.contains(.dark))
    }

    // MARK: - Persistence

    @Test @MainActor func modePersistsToUserDefaults() {
        let service = AppearanceService.shared

        service.setMode(.dark)
        let stored = UserDefaults.standard.integer(forKey: "appearance_mode")
        #expect(stored == AppearanceMode.dark.rawValue)

        service.setMode(.light)
        let stored2 = UserDefaults.standard.integer(forKey: "appearance_mode")
        #expect(stored2 == AppearanceMode.light.rawValue)

        // Cleanup
        service.setMode(.system)
    }

    @Test @MainActor func modePreservedAfterSettingViaProperty() {
        let service = AppearanceService.shared

        service.setMode(.dark)
        // Verify the mode is stored and readable
        let rawValue = UserDefaults.standard.integer(forKey: "appearance_mode")
        let restored = AppearanceMode(rawValue: rawValue)
        #expect(restored == .dark)

        // Cleanup
        service.setMode(.system)
    }

    // MARK: - Raw Values

    @Test func rawValuesAreCorrect() {
        #expect(AppearanceMode.system.rawValue == 0)
        #expect(AppearanceMode.light.rawValue == 1)
        #expect(AppearanceMode.dark.rawValue == 2)
    }

    @Test func invalidRawValueReturnsNil() {
        #expect(AppearanceMode(rawValue: 99) == nil)
        #expect(AppearanceMode(rawValue: -1) == nil)
    }
}
