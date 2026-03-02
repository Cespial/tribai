import SwiftUI

struct OfflineIndicatorView: View {
    let isFromCache: Bool

    var body: some View {
        if isFromCache {
            HStack(spacing: 6) {
                Image(systemName: "arrow.down.circle.fill")
                    .font(.system(size: 12))
                Text("Contenido offline")
                    .font(AppTypography.caption)
            }
            .foregroundStyle(.white)
            .padding(.horizontal, 10)
            .padding(.vertical, 6)
            .background(Color.orange.gradient)
            .clipShape(Capsule())
        }
    }
}
