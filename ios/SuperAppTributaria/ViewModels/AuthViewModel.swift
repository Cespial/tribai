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
        Task {
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

    @MainActor
    func signInWithGoogle(presenting: Any) {
        isLoading = true
        Task {
            do {
                try await authService.signInWithGoogle(presenting: presenting)
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
}
