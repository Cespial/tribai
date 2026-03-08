import Foundation
import AuthenticationServices

enum AuthProvider: String, Codable {
    case apple
    case google
    case anonymous
}

struct AuthUser: Equatable {
    let id: String
    let email: String?
    let displayName: String?
    let provider: AuthProvider
}

protocol AuthServiceProtocol {
    var currentUser: AuthUser? { get }
    var isAuthenticated: Bool { get }
    func signInWithApple(credential: ASAuthorizationAppleIDCredential) async throws
    func signOut()
    func continueWithoutAccount()
}

final class AuthService: AuthServiceProtocol {
    private(set) var currentUser: AuthUser?
    private let keychainService = "com.superapp-tributaria.auth"

    var isAuthenticated: Bool { currentUser != nil }

    init() {
        loadStoredUser()
    }

    func signInWithApple(credential: ASAuthorizationAppleIDCredential) async throws {
        let userId = credential.user
        let email = credential.email
        let fullName = [credential.fullName?.givenName, credential.fullName?.familyName]
            .compactMap { $0 }
            .joined(separator: " ")

        let user = AuthUser(
            id: userId,
            email: email,
            displayName: fullName.isEmpty ? nil : fullName,
            provider: .apple
        )

        try saveUser(user)
        currentUser = user
    }

    func signOut() {
        currentUser = nil
        try? KeychainManager.delete(service: keychainService, account: "user")
    }

    func continueWithoutAccount() {
        let user = AuthUser(
            id: UUID().uuidString,
            email: nil,
            displayName: nil,
            provider: .anonymous
        )
        try? saveUser(user)
        currentUser = user
    }

    // MARK: - Persistence

    private func saveUser(_ user: AuthUser) throws {
        let data = try JSONEncoder().encode(StoredUser(from: user))
        try KeychainManager.save(data: data, service: keychainService, account: "user")
    }

    private func loadStoredUser() {
        guard let data = try? KeychainManager.read(service: keychainService, account: "user"),
              let stored = try? JSONDecoder().decode(StoredUser.self, from: data) else {
            return
        }
        currentUser = stored.toAuthUser()
    }
}

private struct StoredUser: Codable {
    let id: String
    let email: String?
    let displayName: String?
    let provider: AuthProvider

    init(from user: AuthUser) {
        self.id = user.id
        self.email = user.email
        self.displayName = user.displayName
        self.provider = user.provider
    }

    func toAuthUser() -> AuthUser {
        AuthUser(id: id, email: email, displayName: displayName, provider: provider)
    }
}

enum AuthError: LocalizedError {
    case notConfigured
    case cancelled
    case failed(String)

    var errorDescription: String? {
        switch self {
        case .notConfigured: return "Autenticación no configurada."
        case .cancelled: return "Inicio de sesión cancelado."
        case .failed(let message): return message
        }
    }
}
