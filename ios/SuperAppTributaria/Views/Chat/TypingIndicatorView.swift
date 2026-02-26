import SwiftUI

struct TypingIndicatorView: View {
    let label: String

    @State private var dotOffsets: [CGFloat] = [0, 0, 0]

    var body: some View {
        HStack(alignment: .top) {
            VStack(alignment: .leading, spacing: 4) {
                HStack(spacing: 6) {
                    ForEach(0..<3, id: \.self) { index in
                        Circle()
                            .fill(Color.appMutedForeground)
                            .frame(width: 8, height: 8)
                            .offset(y: dotOffsets[index])
                    }
                }
                .padding(.horizontal, 14)
                .padding(.vertical, 12)
                .background(Color.appMuted)
                .clipShape(RoundedRectangle(cornerRadius: 16))

                Text(label)
                    .font(AppTypography.caption)
                    .foregroundStyle(Color.appMutedForeground)
                    .padding(.leading, 4)
                    .transition(.opacity)
                    .animation(.easeInOut(duration: 0.3), value: label)
            }

            Spacer(minLength: 100)
        }
        .padding(.horizontal, AppSpacing.sm)
        .onAppear { startAnimation() }
        .accessibilityLabel(label)
    }

    private func startAnimation() {
        for index in 0..<3 {
            withAnimation(
                .easeInOut(duration: 0.5)
                .repeatForever(autoreverses: true)
                .delay(Double(index) * 0.15)
            ) {
                dotOffsets[index] = -6
            }
        }
    }
}

#Preview {
    VStack {
        TypingIndicatorView(label: "Buscando en el Estatuto Tributario...")
    }
}
