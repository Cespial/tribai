import SwiftUI

struct ChatInputBar: View {
    @Binding var text: String
    let isStreaming: Bool
    let characterCount: Int
    let isOverLimit: Bool
    let canSend: Bool
    let onSend: () -> Void
    let onCancel: () -> Void

    @FocusState private var isFocused: Bool

    var body: some View {
        VStack(spacing: 4) {
            HStack(alignment: .bottom, spacing: AppSpacing.xs) {
                TextField("Escribe tu consulta tributaria...", text: $text, axis: .vertical)
                    .font(AppTypography.bodyDefault)
                    .lineLimit(1...6)
                    .focused($isFocused)
                    .disabled(isStreaming)
                    .submitLabel(.send)
                    .onSubmit {
                        if canSend {
                            isFocused = false
                            onSend()
                        }
                    }
                    .accessibilityLabel("Campo de mensaje")
                    .accessibilityHint("Escribe tu consulta tributaria aquí")

                if isStreaming {
                    Button(action: onCancel) {
                        Image(systemName: "stop.circle.fill")
                            .font(.title2)
                            .foregroundStyle(Color.appDestructive)
                    }
                    .accessibilityLabel("Cancelar respuesta")
                } else {
                    Button(action: {
                        isFocused = false
                        onSend()
                    }) {
                        Image(systemName: "arrow.up.circle.fill")
                            .font(.title2)
                            .foregroundStyle(canSend ? Color.appPrimary : Color.appMutedForeground)
                    }
                    .disabled(!canSend)
                    .accessibilityLabel("Enviar mensaje")
                }
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 10)
            .background(Color.appCard)
            .clipShape(RoundedRectangle(cornerRadius: 20))
            .overlay(
                RoundedRectangle(cornerRadius: 20)
                    .stroke(Color.appBorder, lineWidth: 1)
            )

            // Character counter
            if characterCount > AppConstants.Chat.maxMessageLength - 500 {
                HStack {
                    Spacer()
                    Text("\(characterCount)/\(AppConstants.Chat.maxMessageLength)")
                        .font(AppTypography.caption)
                        .foregroundStyle(isOverLimit ? Color.appDestructive : Color.appMutedForeground)
                }
                .padding(.horizontal, 4)
            }
        }
        .padding(.horizontal, AppSpacing.sm)
        .padding(.vertical, AppSpacing.xs)
        .background(Color.appBackground)
    }
}

#Preview {
    ChatInputBar(
        text: .constant("Hola"),
        isStreaming: false,
        characterCount: 4,
        isOverLimit: false,
        canSend: true,
        onSend: {},
        onCancel: {}
    )
}
