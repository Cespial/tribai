import SwiftUI

struct NovedadesListView: View {
    @State private var viewModel = NovedadesViewModel()

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: AppSpacing.sm) {

                // Search
                SearchBarView(
                    text: $viewModel.searchText,
                    placeholder: "Buscar novedades..."
                )

                // Tipo filters
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: AppSpacing.xs) {
                        FilterChipView(
                            title: "Todos",
                            isSelected: viewModel.selectedTipo == nil
                        ) {
                            viewModel.selectedTipo = nil
                        }

                        ForEach(NovedadTipo.allCases) { tipo in
                            FilterChipView(
                                title: tipo.label,
                                isSelected: viewModel.selectedTipo == tipo
                            ) {
                                viewModel.selectedTipo = tipo
                            }
                        }
                    }
                }

                // Impacto filters
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: AppSpacing.xs) {
                        FilterChipView(
                            title: "Todos",
                            isSelected: viewModel.selectedImpacto == nil
                        ) {
                            viewModel.selectedImpacto = nil
                        }

                        ForEach(NovedadImpacto.allCases) { impacto in
                            FilterChipView(
                                title: impacto.label,
                                isSelected: viewModel.selectedImpacto == impacto
                            ) {
                                viewModel.selectedImpacto = impacto
                            }
                        }
                    }
                }

                // Count header
                SectionHeaderView(title: "\(viewModel.count) novedades")

                // Results
                if viewModel.filteredNovedades.isEmpty {
                    EmptySearchView(query: viewModel.searchText)
                } else {
                    LazyVStack(spacing: AppSpacing.sm) {
                        ForEach(viewModel.filteredNovedades) { novedad in
                            NavigationLink(value: novedad.id) {
                                novedadCard(novedad)
                            }
                            .buttonStyle(.plain)
                        }
                    }
                }
            }
            .padding(AppSpacing.sm)
        }
        .background(Color.appBackground)
        .refreshable { }
        .navigationTitle("Novedades Normativas")
        .navigationBarTitleDisplayMode(.large)
        .navigationDestination(for: String.self) { novedadId in
            if let novedad = NovedadesData.items.first(where: { $0.id == novedadId }) {
                NovedadDetailView(novedad: novedad)
            }
        }
    }

    // MARK: - Card

    @ViewBuilder
    private func novedadCard(_ novedad: NovedadNormativa) -> some View {
        CardView {
            VStack(alignment: .leading, spacing: AppSpacing.xs) {
                // Fecha
                Text(novedad.fecha)
                    .font(AppTypography.caption)
                    .foregroundStyle(Color.appMutedForeground)

                // Titulo
                Text(novedad.titulo)
                    .font(AppTypography.bodyDefault)
                    .fontWeight(.semibold)
                    .foregroundStyle(Color.appForeground)
                    .lineLimit(2)
                    .multilineTextAlignment(.leading)

                // Badges
                HStack(spacing: AppSpacing.xs) {
                    StatusBadgeView.tipo(novedad.tipo)
                    StatusBadgeView.impacto(novedad.impacto)
                }

                // Resumen
                Text(novedad.resumen)
                    .font(AppTypography.bodySmall)
                    .foregroundStyle(Color.appMutedForeground)
                    .lineLimit(3)
                    .multilineTextAlignment(.leading)
            }
        }
    }
}
