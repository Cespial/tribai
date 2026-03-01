import SwiftUI

struct GuiasListView: View {
    private let guias = GuiasData.guias
    var onNavigateToCalculators: () -> Void = {}
    var onNavigateToMore: () -> Void = {}

    var body: some View {
        ScrollView {
            LazyVStack(spacing: AppSpacing.sm) {
                ForEach(guias) { guia in
                    NavigationLink(value: guia.id) {
                        guiaCard(guia)
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(.horizontal, AppSpacing.sm)
            .padding(.vertical, AppSpacing.xs)
        }
        .background(Color.appBackground)
        .navigationTitle("Guias Interactivas")
        .navigationDestination(for: String.self) { guiaId in
            if let guia = guias.first(where: { $0.id == guiaId }) {
                GuiaFlowView(
                    guia: guia,
                    onNavigateToCalculators: onNavigateToCalculators,
                    onNavigateToMore: onNavigateToMore
                )
            } else {
                ContentUnavailableView("Guia no encontrada", systemImage: "exclamationmark.triangle")
            }
        }
    }

    // MARK: - Guia Card

    @ViewBuilder
    private func guiaCard(_ guia: GuiaEducativa) -> some View {
        CardView {
            VStack(alignment: .leading, spacing: AppSpacing.xs) {
                Text(guia.titulo)
                    .font(AppTypography.cardHeading)
                    .foregroundStyle(Color.appForeground)
                    .multilineTextAlignment(.leading)

                Text(guia.descripcion)
                    .font(AppTypography.bodySmall)
                    .foregroundStyle(Color.appMutedForeground)
                    .lineLimit(2)
                    .multilineTextAlignment(.leading)

                HStack(spacing: AppSpacing.xs) {
                    StatusBadgeView.complejidad(guia.complejidad)

                    Text(guia.categoria.capitalized)
                        .font(AppTypography.caption)
                        .foregroundStyle(Color.appMutedForeground)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 3)
                        .background(Color.appMuted)
                        .clipShape(Capsule())

                    Spacer()

                    Image(systemName: "chevron.right")
                        .font(.system(size: 14, weight: .medium))
                        .foregroundStyle(Color.appMutedForeground)
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
        }
    }
}

#Preview {
    NavigationStack {
        GuiasListView()
    }
}
