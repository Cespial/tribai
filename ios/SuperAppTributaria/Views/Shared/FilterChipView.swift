import SwiftUI

struct FilterChipView: View {
    let title: String
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: {
            action()
            Haptics.send()
        }) {
            Text(title)
                .font(AppTypography.label)
                .foregroundStyle(isSelected ? Color.appPrimaryForeground : Color.appForeground)
                .padding(.horizontal, 14)
                .padding(.vertical, 7)
                .background(isSelected ? Color.appPrimary : Color.appCard)
                .clipShape(Capsule())
                .overlay(
                    Capsule()
                        .stroke(isSelected ? Color.clear : Color.appBorder, lineWidth: 1)
                )
        }
        .buttonStyle(.plain)
    }
}
