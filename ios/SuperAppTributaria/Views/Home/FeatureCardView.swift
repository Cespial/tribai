import SwiftUI

struct FeatureCardView: View {
    let sfSymbol: String
    let title: String
    let description: String
    let action: () -> Void

    var body: some View {
        Button(action: {
            action()
            Haptics.send()
        }) {
            VStack(alignment: .leading, spacing: AppSpacing.xs) {
                Image(systemName: sfSymbol)
                    .font(.system(size: 24))
                    .foregroundStyle(Color.appForeground)

                Text(title)
                    .font(AppTypography.cardHeading)
                    .foregroundStyle(Color.appForeground)
                    .lineLimit(1)

                Text(description)
                    .font(AppTypography.caption)
                    .foregroundStyle(Color.appMutedForeground)
                    .lineLimit(2)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(AppSpacing.sm)
            .background(Color.appCard)
            .clipShape(RoundedRectangle(cornerRadius: AppRadius.card))
            .overlay(
                RoundedRectangle(cornerRadius: AppRadius.card)
                    .stroke(Color.appBorder, lineWidth: 1)
            )
        }
        .buttonStyle(.plain)
    }
}
