import SwiftUI

struct RetencionTablaView: View {
    @State private var viewModel = RetencionTablaViewModel()

    var body: some View {
        ScrollView {
            VStack(spacing: AppSpacing.sm) {

                // Search
                SearchBarView(text: $viewModel.searchText, placeholder: "Buscar concepto, articulo...")

                // Category filters
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        FilterChipView(
                            title: "Todas",
                            isSelected: viewModel.selectedCategory == nil
                        ) {
                            viewModel.selectedCategory = nil
                        }
                        ForEach(viewModel.categories, id: \.self) { category in
                            FilterChipView(
                                title: category,
                                isSelected: viewModel.selectedCategory == category
                            ) {
                                viewModel.selectedCategory = category
                            }
                        }
                    }
                    .padding(.horizontal, AppSpacing.sm)
                }

                // Count header
                HStack {
                    Text("\(viewModel.filteredConceptos.count) conceptos")
                        .font(AppTypography.label)
                        .foregroundStyle(Color.appMutedForeground)
                    Spacer()
                }
                .padding(.horizontal, AppSpacing.sm)

                // Concept cards
                if viewModel.filteredConceptos.isEmpty {
                    EmptySearchView(
                        query: viewModel.searchText,
                        message: "No se encontraron conceptos de retencion para esta busqueda."
                    )
                    .padding(.top, AppSpacing.md)
                } else {
                    LazyVStack(spacing: AppSpacing.xs) {
                        ForEach(viewModel.filteredConceptos) { concepto in
                            conceptoCard(concepto)
                        }
                    }
                    .padding(.horizontal, AppSpacing.sm)
                }
            }
            .padding(.bottom, AppSpacing.md)
        }
        .background(Color.appBackground)
        .refreshable { }
        .navigationTitle("Tabla de Retencion")
        .navigationBarTitleDisplayMode(.large)
    }

    // MARK: - Concepto Card

    @ViewBuilder
    private func conceptoCard(_ concepto: RetencionConceptoCompleto) -> some View {
        let isExpanded = viewModel.expandedConceptId == concepto.id

        CardView {
            VStack(alignment: .leading, spacing: AppSpacing.xs) {

                // Concepto name
                Text(concepto.concepto)
                    .font(AppTypography.bodyDefault)
                    .fontWeight(.semibold)
                    .foregroundStyle(Color.appForeground)

                // Base and Tarifa row
                HStack(spacing: AppSpacing.xs) {
                    // Base label
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Base")
                            .font(AppTypography.caption)
                            .foregroundStyle(Color.appMutedForeground)
                        if concepto.baseMinUVT > 0 {
                            Text("\(concepto.baseMinUVT) UVT (\(viewModel.baseMinCOP(concepto.baseMinUVT)))")
                                .font(AppTypography.label)
                                .foregroundStyle(Color.appForeground)
                        } else {
                            Text("Sin base minima")
                                .font(AppTypography.label)
                                .foregroundStyle(Color.appMutedForeground)
                        }
                    }

                    Spacer()

                    // Tarifa label
                    VStack(alignment: .trailing, spacing: 2) {
                        Text("Tarifa")
                            .font(AppTypography.caption)
                            .foregroundStyle(Color.appMutedForeground)
                        Text(viewModel.formattedTarifa(concepto.tarifa))
                            .font(AppTypography.label)
                            .fontWeight(.semibold)
                            .foregroundStyle(Color.appForeground)
                    }
                }

                // Article reference
                Text("Art. \(concepto.articulo) ET")
                    .font(AppTypography.caption)
                    .foregroundStyle(Color.appMutedForeground)

                // aplicaA badge (only if not "ambos")
                if concepto.aplicaA != "ambos" {
                    aplicaABadge(concepto.aplicaA)
                }

                // Notas (if present)
                if let notas = concepto.notas {
                    Text(notas)
                        .font(AppTypography.caption)
                        .italic()
                        .foregroundStyle(Color.appMutedForeground)
                }

                // Expanded details
                if isExpanded {
                    expandedDetails(concepto)
                }
            }
        }
        .contentShape(Rectangle())
        .onTapGesture {
            withAnimation(.easeInOut(duration: 0.2)) {
                viewModel.toggleExpanded(id: concepto.id)
            }
        }
    }

    // MARK: - Expanded Details

    @ViewBuilder
    private func expandedDetails(_ concepto: RetencionConceptoCompleto) -> some View {
        Divider()
            .padding(.vertical, 4)

        VStack(alignment: .leading, spacing: 6) {
            if let descripcion = concepto.descripcion {
                Text(descripcion)
                    .font(AppTypography.bodySmall)
                    .foregroundStyle(Color.appForeground)
            }

            if let tarifaND = concepto.tarifaNoDeclarante {
                HStack(spacing: 4) {
                    Text("Tarifa no declarante:")
                        .font(AppTypography.caption)
                        .foregroundStyle(Color.appMutedForeground)
                    Text(viewModel.formattedTarifa(tarifaND))
                        .font(AppTypography.caption)
                        .fontWeight(.semibold)
                        .foregroundStyle(Color.appForeground)
                }
            }

            Text("Categoria: \(concepto.categoria)")
                .font(AppTypography.caption)
                .foregroundStyle(Color.appMutedForeground)

            if !concepto.keywords.isEmpty {
                Text("Palabras clave: \(concepto.keywords.joined(separator: ", "))")
                    .font(AppTypography.caption)
                    .foregroundStyle(Color.appMutedForeground)
            }
        }
    }

    // MARK: - aplicaA Badge

    @ViewBuilder
    private func aplicaABadge(_ aplicaA: String) -> some View {
        let label: String = switch aplicaA {
        case "declarante": "Declarante"
        case "no-declarante": "No declarante"
        default: aplicaA.capitalized
        }

        Text(label)
            .font(AppTypography.caption)
            .foregroundStyle(Color.appMutedForeground)
            .padding(.horizontal, 10)
            .padding(.vertical, 4)
            .background(Color.appMuted)
            .clipShape(Capsule())
    }
}
