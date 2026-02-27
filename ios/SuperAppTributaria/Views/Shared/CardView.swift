import SwiftUI

struct CardView<Content: View>: View {
    var padding: CGFloat = AppSpacing.sm
    @ViewBuilder let content: () -> Content

    var body: some View {
        content()
            .padding(padding)
            .background(Color.appCard)
            .clipShape(RoundedRectangle(cornerRadius: AppRadius.card))
            .overlay(
                RoundedRectangle(cornerRadius: AppRadius.card)
                    .stroke(Color.appBorder, lineWidth: 1)
            )
    }
}
