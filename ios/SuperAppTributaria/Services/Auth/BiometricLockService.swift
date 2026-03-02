import Foundation
import LocalAuthentication

@MainActor @Observable
final class BiometricLockService {

    static let shared = BiometricLockService()

    private(set) var isLocked = false
    private(set) var biometricType: LABiometryType = .none

    private let enabledKey = "biometricLockEnabled"

    var isEnabled: Bool {
        get { UserDefaults.standard.bool(forKey: enabledKey) }
        set {
            UserDefaults.standard.set(newValue, forKey: enabledKey)
            if newValue {
                isLocked = true
            } else {
                isLocked = false
            }
        }
    }

    private init() {
        checkBiometricType()
        if isEnabled {
            isLocked = true
        }
    }

    var biometricName: String {
        switch biometricType {
        case .faceID: return "Face ID"
        case .touchID: return "Touch ID"
        case .opticID: return "Optic ID"
        case .none: return "Biometrico"
        @unknown default: return "Biometrico"
        }
    }

    var biometricIcon: String {
        switch biometricType {
        case .faceID: return "faceid"
        case .touchID: return "touchid"
        default: return "lock.shield"
        }
    }

    var isBiometricAvailable: Bool {
        biometricType != .none
    }

    func authenticate() async -> Bool {
        let context = LAContext()
        var error: NSError?

        guard context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) else {
            isLocked = false
            return true
        }

        do {
            let success = try await context.evaluatePolicy(
                .deviceOwnerAuthenticationWithBiometrics,
                localizedReason: "Desbloquear SuperApp Tributaria"
            )
            if success {
                isLocked = false
            }
            return success
        } catch {
            return false
        }
    }

    func lockIfEnabled() {
        if isEnabled {
            isLocked = true
        }
    }

    private func checkBiometricType() {
        let context = LAContext()
        var error: NSError?
        if context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) {
            biometricType = context.biometryType
        } else {
            biometricType = .none
        }
    }
}
