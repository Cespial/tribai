import SwiftUI
import SwiftData

@main
struct SuperAppTributariaApp: App {
    @UIApplicationDelegateAdaptor(AppDelegate.self) var appDelegate
    @State private var environment = AppEnvironment()
    @State private var authViewModel = AuthViewModel()
    @State private var biometricService = BiometricLockService.shared
    @State private var showOnboarding = !OnboardingService.hasSeenOnboarding

    var body: some Scene {
        WindowGroup {
            Group {
                if authViewModel.isAuthenticated {
                    ContentView()
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
        }
        .modelContainer(for: [ConversationEntity.self, CachedArticleEntity.self])
    }
}
