import SwiftUI

struct IndicadoresView: View {
    @State private var viewModel = IndicadoresViewModel()

    private let columns = [
        GridItem(.flexible(), spacing: AppSpacing.sm),
        GridItem(.flexible(), spacing: AppSpacing.sm)
    ]

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: AppSpacing.sm) {

                // Categoria filters
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: AppSpacing.xs) {
                        FilterChipView(
                            title: "Todos",
                            isSelected: viewModel.selectedCategoria == nil
                        ) {
                            viewModel.selectedCategoria = nil
                        }

                        ForEach(IndicadorCategoria.allCases) { categoria in
                            FilterChipView(
                                title: categoria.label,
                                isSelected: viewModel.selectedCategoria == categoria
                            ) {
                                viewModel.selectedCategoria = categoria
                            }
                        }
                    }
                }

                // Count header
                SectionHeaderView(title: "\(viewModel.count) indicadores")

                // Grid
                LazyVGrid(columns: columns, spacing: AppSpacing.sm) {
                    ForEach(viewModel.filteredIndicadores) { indicador in
                        NavigationLink(value: indicador.id) {
                            indicadorCell(indicador)
                        }
                        .buttonStyle(.plain)
                    }
                }
            }
            .padding(AppSpacing.sm)
        }
        .background(Color.appBackground)
        .refreshable { }
        .navigationTitle("Indicadores Economicos")
        .navigationBarTitleDisplayMode(.large)
        .navigationDestination(for: String.self) { indicadorId in
            if let indicador = IndicadoresData.items.first(where: { $0.id == indicadorId }) {
                IndicadorDetailView(indicador: indicador)
            }
        }
    }

    // MARK: - Cell

    @ViewBuilder
    private func indicadorCell(_ indicador: IndicadorItem) -> some View {
        CardView {
            VStack(alignment: .leading, spacing: 6) {
                // Nombre
                Text(indicador.nombre)
                    .font(AppTypography.bodySmall)
                    .fontWeight(.semibold)
                    .foregroundStyle(Color.appForeground)
                    .lineLimit(2)
                    .multilineTextAlignment(.leading)

                // Valor
                Text(indicador.valor)
                    .font(AppTypography.cardHeading)
                    .foregroundStyle(Color.appForeground)
                    .lineLimit(1)
                    .minimumScaleFactor(0.7)

                // Fecha de corte
                Text(indicador.fechaCorte)
                    .font(AppTypography.caption)
                    .foregroundStyle(Color.appMutedForeground)

                // Categoria pill
                Text(indicador.categoria.label)
                    .font(AppTypography.caption)
                    .foregroundStyle(Color.appMutedForeground)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 3)
                    .background(Color.appMuted)
                    .clipShape(Capsule())
                    .overlay(
                        Capsule()
                            .stroke(Color.appBorder, lineWidth: 1)
                    )
            }
            .frame(maxWidth: .infinity, alignment: .leading)
        }
    }
}
