import SwiftUI

struct EmptySearchView: View {
    var query: String
    var message: String?

    var body: some View {
        VStack(spacing: AppSpacing.sm) {
            Image(systemName: "magnifyingglass")
                .font(.system(size: 40))
                .foregroundStyle(Color.appMutedForeground)

            Text("Sin resultados")
                .font(AppTypography.cardHeading)
                .foregroundStyle(Color.appForeground)

            Text(message ?? "No se encontraron resultados para \"\(query)\"")
                .font(AppTypography.bodySmall)
                .foregroundStyle(Color.appMutedForeground)
                .multilineTextAlignment(.center)
        }
        .padding(AppSpacing.md)
        .frame(maxWidth: .infinity)
    }
}
