import SwiftUI
import AuthenticationServices

struct SignInView: View {
    @Bindable var viewModel: AuthViewModel

    var body: some View {
        VStack(spacing: AppSpacing.md) {
            Spacer()

            // Logo & Title
            VStack(spacing: AppSpacing.sm) {
                Image(systemName: "building.columns")
                    .font(.system(size: 64))
                    .foregroundStyle(Color.appForeground)

                Text("SuperApp Tributaria")
                    .font(AppTypography.pageHeading)
                    .foregroundStyle(Color.appForeground)

                Text("Colombia")
                    .font(AppTypography.sectionHeading)
                    .foregroundStyle(Color.appMutedForeground)

                Text("Tu asistente tributario con inteligencia artificial")
                    .font(AppTypography.bodySmall)
                    .foregroundStyle(Color.appMutedForeground)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, AppSpacing.md)
            }

            Spacer()

            // Sign-in buttons
            VStack(spacing: 12) {
                // Apple Sign In
                SignInWithAppleButton(.signIn) { request in
                    request.requestedScopes = [.fullName, .email]
                } onCompletion: { result in
                    switch result {
                    case .success(let auth):
                        if let credential = auth.credential as? ASAuthorizationAppleIDCredential {
                            viewModel.signInWithApple(credential: credential)
                        }
                    case .failure(let error):
                        viewModel.error = error.localizedDescription
                        viewModel.showError = true
                    }
                }
                .signInWithAppleButtonStyle(.black)
                .frame(height: 50)
                .clipShape(RoundedRectangle(cornerRadius: AppRadius.card))
                .accessibilityLabel("Iniciar sesión con Apple")

                // Continue without account
                Button {
                    viewModel.continueWithoutAccount()
                } label: {
                    Text("Continuar sin cuenta")
                        .font(AppTypography.bodySmall)
                        .foregroundStyle(Color.appMutedForeground)
                        .underline()
                }
                .padding(.top, 8)
                .accessibilityLabel("Continuar sin crear cuenta")
            }
            .padding(.horizontal, AppSpacing.md)
            .padding(.bottom, AppSpacing.lg)
        }
        .background(Color.appBackground)
        .alert("Error", isPresented: $viewModel.showError) {
            Button("OK", role: .cancel) {}
        } message: {
            Text(viewModel.error ?? "Error desconocido")
        }
    }
}

#Preview {
    SignInView(viewModel: AuthViewModel())
}
