import SwiftUI
import SwiftData

struct ProfileView: View {
    @Bindable var viewModel: AuthViewModel
    @Environment(\.dismiss) private var dismiss
    @Environment(\.modelContext) private var modelContext
    var analyticsService: AnalyticsService?
    var conversationRepository: ConversationRepositoryProtocol?

    @State private var showDeleteConfirmation = false
    @State private var showExportSheet = false
    @State private var exportURL: URL?
    @State private var isExporting = false

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

                if BiometricLockService.shared.isBiometricAvailable {
                    Section {
                        Toggle(isOn: Binding(
                            get: { BiometricLockService.shared.isEnabled },
                            set: { BiometricLockService.shared.isEnabled = $0 }
                        )) {
                            Label(
                                "Bloqueo con \(BiometricLockService.shared.biometricName)",
                                systemImage: BiometricLockService.shared.biometricIcon
                            )
                        }
                    } header: {
                        Text("Seguridad")
                    }
                }

                Section {
                    Button {
                        exportUserData()
                    } label: {
                        Label("Exportar mis datos", systemImage: "square.and.arrow.up")
                    }
                    .disabled(isExporting)
                } header: {
                    Text("Mis datos")
                } footer: {
                    Text("Descarga una copia de tus datos en formato JSON: conversaciones, favoritos y preferencias.")
                }

                Section {
                    Button(role: .destructive) {
                        viewModel.signOut()
                        dismiss()
                    } label: {
                        Label("Cerrar sesion", systemImage: "rectangle.portrait.and.arrow.right")
                    }
                }

                Section {
                    Button(role: .destructive) {
                        showDeleteConfirmation = true
                    } label: {
                        Label("Eliminar cuenta y datos", systemImage: "trash")
                    }
                } footer: {
                    Text("Elimina permanentemente tu cuenta y todos los datos almacenados en este dispositivo.")
                }
            }
            .navigationTitle("Perfil")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Cerrar") { dismiss() }
                }
            }
            .alert(
                "Eliminar cuenta y datos",
                isPresented: $showDeleteConfirmation
            ) {
                Button("Cancelar", role: .cancel) {}
                Button("Eliminar", role: .destructive) {
                    performAccountDeletion()
                }
            } message: {
                Text("Esta accion eliminara permanentemente tu cuenta y todos los datos asociados: conversaciones, favoritos, preferencias. Esta accion no se puede deshacer.")
            }
            .sheet(isPresented: $showExportSheet) {
                if let url = exportURL {
                    ActivityViewController(activityItems: [url])
                }
            }
        }
    }

    // MARK: - Account Deletion

    private func performAccountDeletion() {
        // Clear SwiftData conversations and cached articles
        deleteAllSwiftDataEntities()

        // Clear analytics
        analyticsService?.clearAll()

        // Clear conversations via repository
        if let repository = conversationRepository {
            Task {
                try? await repository.deleteAll()
            }
        }

        // Delete account (clears keychain, UserDefaults, bookmarks, onboarding)
        viewModel.deleteAccount()
        dismiss()
    }

    private func deleteAllSwiftDataEntities() {
        // Delete all conversations
        let conversationDescriptor = FetchDescriptor<ConversationEntity>()
        if let conversations = try? modelContext.fetch(conversationDescriptor) {
            for entity in conversations {
                modelContext.delete(entity)
            }
        }

        // Delete all cached articles
        let cacheDescriptor = FetchDescriptor<CachedArticleEntity>()
        if let cached = try? modelContext.fetch(cacheDescriptor) {
            for entity in cached {
                modelContext.delete(entity)
            }
        }

        try? modelContext.save()
    }

    // MARK: - Data Export

    private func exportUserData() {
        isExporting = true

        Task {
            let exportData = await buildExportData()

            let encoder = JSONEncoder()
            encoder.outputFormatting = [.prettyPrinted, .sortedKeys]
            encoder.dateEncodingStrategy = .iso8601

            guard let jsonData = try? encoder.encode(exportData) else {
                await MainActor.run { isExporting = false }
                return
            }

            let tempDir = FileManager.default.temporaryDirectory
            let fileName = "tribai-datos-\(formattedDate()).json"
            let fileURL = tempDir.appendingPathComponent(fileName)

            do {
                try jsonData.write(to: fileURL, options: .atomic)
                await MainActor.run {
                    exportURL = fileURL
                    showExportSheet = true
                    isExporting = false
                }
            } catch {
                await MainActor.run { isExporting = false }
            }
        }
    }

    private func buildExportData() async -> ExportableUserData {
        // Gather conversations
        var conversations: [ExportableConversation] = []
        if let repository = conversationRepository {
            if let allConversations = try? await repository.fetchAll() {
                conversations = allConversations.map { conv in
                    ExportableConversation(
                        id: conv.id,
                        title: conv.title,
                        createdAt: conv.createdAt,
                        updatedAt: conv.updatedAt,
                        messages: conv.messages.map { msg in
                            ExportableMessage(
                                role: msg.role.rawValue,
                                text: msg.text,
                                createdAt: msg.createdAt
                            )
                        }
                    )
                }
            }
        }

        // Gather bookmarks
        let bookmarks = ExportableBookmarks(
            articleSlugs: Array(BookmarkService.shared.bookmarkedArticleSlugs),
            calculatorIds: Array(BookmarkService.shared.bookmarkedCalculatorIds)
        )

        // Gather preferences
        let preferences = ExportablePreferences(
            biometricLockEnabled: BiometricLockService.shared.isEnabled,
            hasSeenOnboarding: OnboardingService.hasSeenOnboarding
        )

        return ExportableUserData(
            exportDate: Date(),
            user: ExportableUser(
                displayName: viewModel.currentUser?.displayName,
                email: viewModel.currentUser?.email,
                provider: viewModel.currentUser?.provider.rawValue
            ),
            conversations: conversations,
            bookmarks: bookmarks,
            preferences: preferences
        )
    }

    private func formattedDate() -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        return formatter.string(from: Date())
    }

    // MARK: - Helpers

    private func providerLabel(_ provider: AuthProvider) -> String {
        switch provider {
        case .apple: return "Apple ID"
        case .google: return "Google"
        case .anonymous: return "Sin cuenta"
        }
    }
}

// MARK: - Export Data Models

private struct ExportableUserData: Codable {
    let exportDate: Date
    let user: ExportableUser
    let conversations: [ExportableConversation]
    let bookmarks: ExportableBookmarks
    let preferences: ExportablePreferences
}

private struct ExportableUser: Codable {
    let displayName: String?
    let email: String?
    let provider: String?
}

private struct ExportableConversation: Codable {
    let id: String
    let title: String
    let createdAt: Date
    let updatedAt: Date
    let messages: [ExportableMessage]
}

private struct ExportableMessage: Codable {
    let role: String
    let text: String
    let createdAt: Date
}

private struct ExportableBookmarks: Codable {
    let articleSlugs: [String]
    let calculatorIds: [String]
}

private struct ExportablePreferences: Codable {
    let biometricLockEnabled: Bool
    let hasSeenOnboarding: Bool
}

// MARK: - UIActivityViewController Wrapper

private struct ActivityViewController: UIViewControllerRepresentable {
    let activityItems: [Any]

    func makeUIViewController(context: Context) -> UIActivityViewController {
        UIActivityViewController(activityItems: activityItems, applicationActivities: nil)
    }

    func updateUIViewController(_ uiViewController: UIActivityViewController, context: Context) {}
}
