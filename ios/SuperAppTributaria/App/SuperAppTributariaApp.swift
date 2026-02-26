import SwiftUI
import SwiftData

@main
struct SuperAppTributariaApp: App {
    @UIApplicationDelegateAdaptor(AppDelegate.self) var appDelegate
    @State private var environment = AppEnvironment()
    @State private var authViewModel = AuthViewModel()

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
            .onAppear {
                environment.startHealthPolling()
            }
        }
        .modelContainer(for: ConversationEntity.self)
    }
}
