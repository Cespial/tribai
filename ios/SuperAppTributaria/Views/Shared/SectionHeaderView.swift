import SwiftUI

struct SectionHeaderView: View {
    let title: String
    var action: (() -> Void)?
    var actionLabel: String = "Ver todo"

    var body: some View {
        HStack {
            Text(title)
                .font(AppTypography.cardHeading)
                .foregroundStyle(Color.appForeground)

            Spacer()

            if let action {
                Button(action: action) {
                    Text(actionLabel)
                        .font(AppTypography.label)
                        .foregroundStyle(Color.appMutedForeground)
                }
            }
        }
    }
}
