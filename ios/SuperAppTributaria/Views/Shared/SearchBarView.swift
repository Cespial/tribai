import SwiftUI
import Combine

struct SearchBarView: View {
    @Binding var text: String
    var placeholder: String = "Buscar..."
    var onCommit: (() -> Void)?

    @FocusState private var isFocused: Bool

    var body: some View {
        HStack(spacing: AppSpacing.xs) {
            Image(systemName: "magnifyingglass")
                .foregroundStyle(Color.appMutedForeground)
                .font(.system(size: 16))
                .accessibilityHidden(true)

            TextField(placeholder, text: $text)
                .font(AppTypography.bodyDefault)
                .foregroundStyle(Color.appForeground)
                .focused($isFocused)
                .submitLabel(.search)
                .onSubmit { onCommit?() }
                .autocorrectionDisabled()
                .accessibilityLabel(placeholder)

            if !text.isEmpty {
                Button {
                    text = ""
                    Haptics.send()
                } label: {
                    Image(systemName: "xmark.circle.fill")
                        .foregroundStyle(Color.appMutedForeground)
                        .font(.system(size: 16))
                }
                .buttonStyle(.plain)
                .accessibilityLabel("Limpiar busqueda")
            }
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 10)
        .background(Color.appMuted)
        .clipShape(RoundedRectangle(cornerRadius: AppRadius.card))
    }
}
