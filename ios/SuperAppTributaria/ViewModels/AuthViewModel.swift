import Foundation
import AuthenticationServices

@Observable
final class AuthViewModel {
    var isAuthenticated = false
    var currentUser: AuthUser?
    var isLoading = false
    var error: String?
    var showError = false

    private let authService: AuthService

    init(authService: AuthService = AuthService()) {
        self.authService = authService
        self.currentUser = authService.currentUser
        self.isAuthenticated = authService.isAuthenticated
    }

    @MainActor
    func signInWithApple(credential: ASAuthorizationAppleIDCredential) {
        isLoading = true
        Task { [weak self] in
            guard let self else { return }
            do {
                try await authService.signInWithApple(credential: credential)
                currentUser = authService.currentUser
                isAuthenticated = true
                isLoading = false
            } catch {
                self.error = error.localizedDescription
                showError = true
                isLoading = false
            }
        }
    }

    func continueWithoutAccount() {
        authService.continueWithoutAccount()
        currentUser = authService.currentUser
        isAuthenticated = true
    }

    func signOut() {
        authService.signOut()
        currentUser = nil
        isAuthenticated = false
    }

    /// Permanently deletes the user account and all associated data.
    /// Clears keychain, UserDefaults, bookmarks, biometric preferences, and onboarding state.
    /// SwiftData (conversations) and analytics must be cleared by the caller
    /// since those services require external dependencies (ModelContext, AnalyticsService).
    @MainActor
    func deleteAccount() {
        // Clear MainActor-isolated services
        BookmarkService.shared.clearAll()
        BiometricLockService.shared.isEnabled = false

        // Clear non-isolated data (keychain, UserDefaults, onboarding)
        authService.deleteAccount()

        currentUser = nil
        isAuthenticated = false
    }
}
