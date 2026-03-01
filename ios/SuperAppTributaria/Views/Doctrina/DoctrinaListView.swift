import SwiftUI

struct DoctrinaListView: View {

    @State private var viewModel = DoctrinaViewModel()

    var body: some View {
        ScrollView {
            VStack(spacing: AppSpacing.sm) {

                // MARK: - Search
                SearchBarView(
                    text: $viewModel.searchText,
                    placeholder: "Buscar por tema, pregunta o descriptor..."
                )
                .padding(.horizontal, AppSpacing.sm)

                // MARK: - Filter Chips
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: AppSpacing.xs) {
                        FilterChipView(
                            title: "Todos",
                            isSelected: viewModel.selectedTipo == nil
                        ) {
                            viewModel.selectedTipo = nil
                        }

                        ForEach(DoctrinaTipoDoc.allCases) { tipo in
                            FilterChipView(
                                title: tipo.label,
                                isSelected: viewModel.selectedTipo == tipo
                            ) {
                                viewModel.selectedTipo = viewModel.selectedTipo == tipo ? nil : tipo
                            }
                        }
                    }
                    .padding(.horizontal, AppSpacing.sm)
                }

                // MARK: - Vigente Toggle
                HStack {
                    Toggle("Solo vigente", isOn: $viewModel.showOnlyVigente)
                        .font(AppTypography.bodySmall)
                        .foregroundStyle(Color.appForeground)
                        .toggleStyle(.switch)
                        .tint(ColorPalette.vigente)
                }
                .padding(.horizontal, AppSpacing.sm)

                // MARK: - Count Header
                HStack {
                    Text("\(viewModel.count) documentos")
                        .font(AppTypography.label)
                        .foregroundStyle(Color.appMutedForeground)
                    Spacer()
                }
                .padding(.horizontal, AppSpacing.sm)

                // MARK: - List
                if viewModel.filteredDoctrina.isEmpty {
                    EmptySearchView(
                        query: viewModel.searchText,
                        message: "No se encontraron documentos de doctrina con los filtros seleccionados."
                    )
                } else {
                    LazyVStack(spacing: AppSpacing.xs) {
                        ForEach(viewModel.filteredDoctrina) { doctrina in
                            NavigationLink(value: doctrina.id) {
                                DoctrinaRowView(doctrina: doctrina)
                            }
                            .buttonStyle(.plain)
                        }
                    }
                    .padding(.horizontal, AppSpacing.sm)
                }
            }
            .padding(.vertical, AppSpacing.sm)
        }
        .background(Color.appBackground)
        .refreshable { }
        .navigationTitle("Doctrina DIAN")
        .navigationDestination(for: String.self) { docId in
            if let doctrina = DoctrinaCuradaData.items.first(where: { $0.id == docId }) {
                DoctrinaDetailView(doctrina: doctrina)
            }
        }
    }
}

// MARK: - Row View

private struct DoctrinaRowView: View {
    let doctrina: DoctrinaCurada

    var body: some View {
        CardView {
            VStack(alignment: .leading, spacing: AppSpacing.xs) {
                // Numero + Fecha
                HStack {
                    Text(doctrina.numero)
                        .font(AppTypography.label)
                        .foregroundStyle(Color.appForeground)

                    Spacer()

                    Text(doctrina.fecha)
                        .font(AppTypography.caption)
                        .foregroundStyle(Color.appMutedForeground)
                }

                // Tema
                Text(doctrina.tema)
                    .font(AppTypography.bodySmall)
                    .foregroundStyle(Color.appForeground)
                    .lineLimit(2)
                    .multilineTextAlignment(.leading)

                // Badges
                HStack(spacing: AppSpacing.xs) {
                    StatusBadgeView.docTipo(doctrina.tipoDocumento)
                    StatusBadgeView.vigente(doctrina.vigente)
                    Spacer()
                }
            }
        }
    }
}

#Preview {
    NavigationStack {
        DoctrinaListView()
    }
}
