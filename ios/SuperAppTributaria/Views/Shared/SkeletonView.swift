import SwiftUI

struct SkeletonView: View {
    var lineCount: Int = 4
    var showHeader: Bool = true

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            if showHeader {
                RoundedRectangle(cornerRadius: 4)
                    .fill(Color.appMuted)
                    .frame(width: 200, height: 20)
                    .shimmer()
            }

            ForEach(0..<lineCount, id: \.self) { index in
                RoundedRectangle(cornerRadius: 4)
                    .fill(Color.appMuted)
                    .frame(height: 14)
                    .frame(maxWidth: index == lineCount - 1 ? 200 : .infinity)
                    .shimmer()
            }
        }
        .padding(AppSpacing.sm)
    }
}

struct SkeletonCardView: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            RoundedRectangle(cornerRadius: 4)
                .fill(Color.appMuted)
                .frame(height: 16)
                .frame(maxWidth: 180)
                .shimmer()

            RoundedRectangle(cornerRadius: 4)
                .fill(Color.appMuted)
                .frame(height: 12)
                .shimmer()

            RoundedRectangle(cornerRadius: 4)
                .fill(Color.appMuted)
                .frame(height: 12)
                .frame(maxWidth: 240)
                .shimmer()
        }
        .padding(AppSpacing.sm)
        .background(Color.appCard)
        .clipShape(RoundedRectangle(cornerRadius: AppRadius.card))
        .overlay(
            RoundedRectangle(cornerRadius: AppRadius.card)
                .stroke(Color.appBorder, lineWidth: 1)
        )
    }
}
