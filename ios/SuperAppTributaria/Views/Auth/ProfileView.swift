import SwiftUI

struct ProfileView: View {
    @Bindable var viewModel: AuthViewModel
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            List {
                Section {
                    VStack(spacing: 12) {
                        Image(systemName: "person.circle.fill")
                            .font(.system(size: 64))
                            .foregroundStyle(Color.appMutedForeground)

                        if let name = viewModel.currentUser?.displayName {
                            Text(name)
                                .font(AppTypography.cardHeading)
                        }

                        if let email = viewModel.currentUser?.email {
                            Text(email)
                                .font(AppTypography.bodySmall)
                                .foregroundStyle(Color.appMutedForeground)
                        }

                        if let provider = viewModel.currentUser?.provider {
                            Text(providerLabel(provider))
                                .font(AppTypography.caption)
                                .foregroundStyle(Color.appMutedForeground)
                                .padding(.horizontal, 12)
                                .padding(.vertical, 4)
                                .background(Color.appMuted)
                                .clipShape(Capsule())
                        }
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, AppSpacing.sm)
                }

                Section {
                    Button(role: .destructive) {
                        viewModel.signOut()
                        dismiss()
                    } label: {
                        Label("Cerrar sesión", systemImage: "rectangle.portrait.and.arrow.right")
                    }
                }
            }
            .navigationTitle("Perfil")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Cerrar") { dismiss() }
                }
            }
        }
    }

    private func providerLabel(_ provider: AuthProvider) -> String {
        switch provider {
        case .apple: return "Apple ID"
        case .google: return "Google"
        case .anonymous: return "Sin cuenta"
        }
    }
}
