import SwiftUI
import MarkdownUI

struct MessageBubbleView: View {
    let message: ChatMessage
    let isStreaming: Bool
    let onCopy: () -> Void
    let onRetry: (() -> Void)?
    let onSourceTapped: ((SourceCitation) -> Void)?

    var body: some View {
        HStack(alignment: .top) {
            if message.role == .user {
                Spacer(minLength: 60)
            }

            VStack(alignment: message.role == .user ? .trailing : .leading, spacing: 6) {
                // Message content
                Group {
                    if message.role == .assistant {
                        Markdown(message.text)
                            .markdownTheme(.superApp)
                    } else {
                        Text(message.text)
                            .font(AppTypography.bodyDefault)
                    }
                }
                .foregroundStyle(message.role == .user ? Color.appPrimaryForeground : Color.appForeground)
                .padding(.horizontal, 14)
                .padding(.vertical, 10)
                .background(
                    message.role == .user ? Color.appPrimary : Color.appMuted
                )
                .clipShape(RoundedRectangle(cornerRadius: 16))

                // Source citations (assistant only)
                if message.role == .assistant && !message.sources.isEmpty {
                    SourceCitationsRow(
                        sources: message.sources,
                        onSourceTapped: onSourceTapped
                    )
                }

                // Confidence badge (assistant only)
                if message.role == .assistant, let metadata = message.ragMetadata {
                    ConfidenceBadgeView(metadata: metadata)
                }

                // Suggested calculators (assistant only)
                if message.role == .assistant && !message.suggestedCalculators.isEmpty && !isStreaming {
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 6) {
                            ForEach(message.suggestedCalculators) { calc in
                                SuggestedCalculatorChip(calculator: calc)
                            }
                        }
                    }
                }

                // Actions (assistant only, not during streaming)
                if message.role == .assistant && !isStreaming {
                    MessageActionsView(
                        message: message,
                        onCopy: onCopy,
                        onRetry: onRetry
                    )
                }
            }

            if message.role == .assistant {
                Spacer(minLength: 40)
            }
        }
        .padding(.horizontal, AppSpacing.sm)
        .accessibilityElement(children: .combine)
        .accessibilityLabel(
            message.role == .user
                ? "Tú: \(message.text)"
                : "Asistente: \(message.text)"
        )
    }
}

// MARK: - Source Citations Row

struct SourceCitationsRow: View {
    let sources: [SourceCitation]
    let onSourceTapped: ((SourceCitation) -> Void)?

    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 6) {
                ForEach(sources) { source in
                    SourceCitationChip(source: source) {
                        onSourceTapped?(source)
                    }
                }
            }
        }
    }
}

// MARK: - Markdown Theme

extension MarkdownUI.Theme {
    @MainActor static let superApp = MarkdownUI.Theme()
        .text {
            FontSize(16)
        }
        .code {
            FontSize(14)
            FontFamily(.system(.monospaced))
        }
        .heading1 { configuration in
            configuration.label
                .markdownMargin(top: 8, bottom: 4)
                .markdownTextStyle {
                    FontSize(22)
                    FontWeight(.bold)
                }
        }
        .heading2 { configuration in
            configuration.label
                .markdownMargin(top: 6, bottom: 2)
                .markdownTextStyle {
                    FontSize(18)
                    FontWeight(.semibold)
                }
        }
        .heading3 { configuration in
            configuration.label
                .markdownTextStyle {
                    FontSize(16)
                    FontWeight(.semibold)
                }
        }
        .listItem { configuration in
            configuration.label
                .padding(.vertical, 2)
        }
        .strong {
            FontWeight(.semibold)
        }
}

// MARK: - Suggested Calculator Chip

private struct SuggestedCalculatorChip: View {
    let calculator: SuggestedCalculator

    var body: some View {
        HStack(spacing: 4) {
            Image(systemName: catalogItem?.sfSymbol ?? "function")
                .font(.system(size: 11))
            Text(calculator.title ?? catalogItem?.title ?? calculator.slug)
                .font(AppTypography.caption)
                .lineLimit(1)
        }
        .foregroundStyle(Color.appForeground)
        .padding(.horizontal, 10)
        .padding(.vertical, 6)
        .background(Color.appMuted)
        .clipShape(Capsule())
        .overlay(
            Capsule()
                .stroke(Color.appBorder, lineWidth: 1)
        )
    }

    private var catalogItem: CalculatorCatalogItem? {
        CalculatorCatalog.item(byId: calculator.slug)
    }
}

#Preview {
    VStack {
        MessageBubbleView(
            message: ChatMessage(role: .user, text: "¿Debo declarar renta?"),
            isStreaming: false,
            onCopy: {},
            onRetry: nil,
            onSourceTapped: nil
        )
        MessageBubbleView(
            message: ChatMessage(
                role: .assistant,
                text: "Según el **artículo 592** del Estatuto Tributario...",
                sources: [
                    SourceCitation(
                        idArticulo: "Art. 592",
                        titulo: "Quiénes no están obligados a declarar",
                        slug: "articulo-592",
                        contenidoTexto: "No están obligados a presentar declaración de renta...",
                        libro: "Libro I",
                        estado: .vigente
                    )
                ]
            ),
            isStreaming: false,
            onCopy: {},
            onRetry: {},
            onSourceTapped: nil
        )
    }
}
