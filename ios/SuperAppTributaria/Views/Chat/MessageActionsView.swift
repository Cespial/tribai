import SwiftUI

struct MessageActionsView: View {
    let message: ChatMessage
    let onCopy: () -> Void
    let onRetry: (() -> Void)?

    @State private var showShareSheet = false
    @State private var showSourcesPanel = false

    var body: some View {
        HStack(spacing: 12) {
            // Copy
            Button(action: {
                UIPasteboard.general.string = message.text
                Haptics.success()
                onCopy()
            }) {
                Image(systemName: "doc.on.doc")
                    .font(.system(size: 13))
                    .foregroundStyle(Color.appMutedForeground)
            }
            .accessibilityLabel("Copiar respuesta")

            // Share
            ShareLink(item: message.text) {
                Image(systemName: "square.and.arrow.up")
                    .font(.system(size: 13))
                    .foregroundStyle(Color.appMutedForeground)
            }
            .accessibilityLabel("Compartir respuesta")

            // Sources panel
            if !message.sources.isEmpty {
                Button {
                    showSourcesPanel = true
                } label: {
                    HStack(spacing: 4) {
                        Image(systemName: "book")
                            .font(.system(size: 13))
                        Text("\(message.sources.count)")
                            .font(AppTypography.caption)
                    }
                    .foregroundStyle(Color.appMutedForeground)
                }
                .accessibilityLabel("Ver \(message.sources.count) fuentes")
            }

            // Retry
            if let onRetry {
                Button(action: onRetry) {
                    Image(systemName: "arrow.clockwise")
                        .font(.system(size: 13))
                        .foregroundStyle(Color.appMutedForeground)
                }
                .accessibilityLabel("Reintentar consulta")
            }
        }
        .buttonStyle(.plain)
        .sheet(isPresented: $showSourcesPanel) {
            SourceCitationsPanel(sources: message.sources)
                .presentationDetents([.medium, .large])
        }
    }
}
