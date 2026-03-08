import Testing
import Foundation
@testable import SuperAppTributaria

struct OnboardingServiceTests {

    @Test func markCompleteAndCheckStatus() {
        // Reset first
        OnboardingService.reset()
        #expect(!OnboardingService.hasSeenOnboarding)

        OnboardingService.markOnboardingComplete()
        #expect(OnboardingService.hasSeenOnboarding)

        // Cleanup
        OnboardingService.reset()
    }

    @Test func resetClearsFlag() {
        OnboardingService.markOnboardingComplete()
        OnboardingService.reset()
        #expect(!OnboardingService.hasSeenOnboarding)
    }
}
