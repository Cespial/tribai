import SwiftUI
import SwiftData
import CoreSpotlight

@main
struct SuperAppTributariaApp: App {
    @UIApplicationDelegateAdaptor(AppDelegate.self) var appDelegate
    @State private var environment = AppEnvironment()
    @State private var authViewModel: AuthViewModel
    @State private var biometricService = BiometricLockService.shared
    @State private var appearanceService = AppearanceService.shared
    @State private var showOnboarding: Bool

    @State private var deepLinkDestination: DeepLinkRouter.Destination?

    private static var isUITesting: Bool {
        CommandLine.arguments.contains("--uitesting")
    }

    init() {
        let authVM = AuthViewModel()
        if Self.isUITesting {
            authVM.continueWithoutAccount()
        }
        _authViewModel = State(initialValue: authVM)
        _showOnboarding = State(initialValue: Self.isUITesting ? false : !OnboardingService.hasSeenOnboarding)
    }

    var body: some Scene {
        WindowGroup {
            Group {
                if authViewModel.isAuthenticated {
                    ContentView(deepLinkDestination: $deepLinkDestination)
                        .environment(environment)
                } else {
                    SignInView(viewModel: authViewModel)
                }
            }
            .overlay {
                if biometricService.isLocked {
                    LockScreenView {
                        // Already unlocked via service
                    }
                    .transition(.opacity)
                }
            }
            .onReceive(NotificationCenter.default.publisher(for: UIApplication.willResignActiveNotification)) { _ in
                biometricService.lockIfEnabled()
            }
            .onAppear {
                environment.startHealthPolling()
            }
            .fullScreenCover(isPresented: $showOnboarding) {
                OnboardingView {
                    OnboardingService.markOnboardingComplete()
                    showOnboarding = false
                }
            }
            .onOpenURL { url in
                if let destination = DeepLinkRouter.parse(url) {
                    handleDeepLink(destination)
                }
            }
            .onAppear {
                SharedDataService.syncDeadlineData(from: CalendarioData.obligaciones)
                SpotlightIndexService.indexAll()
            }
            .onContinueUserActivity(CSSearchableItemActionType) { activity in
                if let identifier = activity.userInfo?[CSSearchableItemActivityIdentifier] as? String,
                   let destination = SpotlightIndexService.destination(for: identifier) {
                    handleDeepLink(destination)
                }
            }
            .preferredColorScheme(appearanceService.colorScheme)
        }
        .modelContainer(for: [ConversationEntity.self, CachedArticleEntity.self])
    }

    private func handleDeepLink(_ destination: DeepLinkRouter.Destination) {
        deepLinkDestination = destination
    }
}
