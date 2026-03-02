import SwiftUI

struct LockScreenView: View {
    let onUnlock: () -> Void

    @State private var isAuthenticating = false

    var body: some View {
        VStack(spacing: AppSpacing.md) {
            Spacer()

            Image(systemName: "lock.shield.fill")
                .font(.system(size: 64))
                .foregroundStyle(Color.appPrimary)

            Text("SuperApp Tributaria")
                .font(.system(size: 22, weight: .bold))
                .foregroundStyle(Color.appForeground)

            Text("Desbloquea para continuar")
                .font(AppTypography.bodySmall)
                .foregroundStyle(Color.appMutedForeground)

            Spacer()

            Button {
                Task {
                    isAuthenticating = true
                    let success = await BiometricLockService.shared.authenticate()
                    isAuthenticating = false
                    if success {
                        onUnlock()
                    }
                }
            } label: {
                HStack(spacing: 10) {
                    if isAuthenticating {
                        ProgressView()
                            .tint(.white)
                    } else {
                        Image(systemName: BiometricLockService.shared.biometricIcon)
                    }
                    Text("Desbloquear con \(BiometricLockService.shared.biometricName)")
                }
                .font(.system(size: 17, weight: .semibold))
                .foregroundStyle(.white)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 16)
                .background(Color.appPrimary)
                .clipShape(RoundedRectangle(cornerRadius: AppRadius.button))
            }
            .disabled(isAuthenticating)
            .padding(.horizontal, AppSpacing.md)
            .padding(.bottom, AppSpacing.lg)
        }
        .background(Color.appBackground)
        .task {
            // Auto-authenticate on appear
            let _ = await BiometricLockService.shared.authenticate()
            if !BiometricLockService.shared.isLocked {
                onUnlock()
            }
        }
    }
}
