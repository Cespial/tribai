import AuthenticationServices
import SwiftUI

struct AppleSignInHandler: Sendable {
    let onSuccess: @Sendable (ASAuthorizationAppleIDCredential) -> Void
    let onError: @Sendable (Error) -> Void

    func makeCoordinator() -> Coordinator {
        Coordinator(onSuccess: onSuccess, onError: onError)
    }

    class Coordinator: NSObject, ASAuthorizationControllerDelegate, ASAuthorizationControllerPresentationContextProviding {
        let onSuccess: @Sendable (ASAuthorizationAppleIDCredential) -> Void
        let onError: @Sendable (Error) -> Void

        init(
            onSuccess: @escaping @Sendable (ASAuthorizationAppleIDCredential) -> Void,
            onError: @escaping @Sendable (Error) -> Void
        ) {
            self.onSuccess = onSuccess
            self.onError = onError
        }

        func authorizationController(
            controller: ASAuthorizationController,
            didCompleteWithAuthorization authorization: ASAuthorization
        ) {
            if let credential = authorization.credential as? ASAuthorizationAppleIDCredential {
                onSuccess(credential)
            }
        }

        func authorizationController(
            controller: ASAuthorizationController,
            didCompleteWithError error: Error
        ) {
            onError(error)
        }

        func presentationAnchor(for controller: ASAuthorizationController) -> ASPresentationAnchor {
            guard let scene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
                  let window = scene.windows.first else {
                return ASPresentationAnchor()
            }
            return window
        }
    }
}
