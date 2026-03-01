import SwiftUI

struct GlosarioView: View {
    @State private var viewModel = GlosarioViewModel()

    var body: some View {
        ScrollView {
            VStack(spacing: AppSpacing.sm) {
                // Search bar
                SearchBarView(text: $viewModel.searchText, placeholder: "Buscar terminos...")

                // Letter filter chips
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        FilterChipView(
                            title: "Todos",
                            isSelected: viewModel.selectedLetter == nil
                        ) {
                            viewModel.selectedLetter = nil
                        }
                        ForEach(viewModel.availableLetters, id: \.self) { letter in
                            FilterChipView(
                                title: letter,
                                isSelected: viewModel.selectedLetter == letter
                            ) {
                                viewModel.selectedLetter = letter
                            }
                        }
                    }
                    .padding(.horizontal, AppSpacing.sm)
                }

                // Count header
                HStack {
                    Text("\(viewModel.termCount) terminos")
                        .font(AppTypography.label)
                        .foregroundStyle(Color.appMutedForeground)
                    Spacer()
                }
                .padding(.horizontal, AppSpacing.sm)

                // Term list
                if viewModel.filteredTerms.isEmpty {
                    EmptySearchView(
                        query: viewModel.searchText,
                        message: "No se encontraron terminos para esta busqueda"
                    )
                    .padding(.top, AppSpacing.md)
                } else {
                    LazyVStack(spacing: AppSpacing.xs) {
                        ForEach(viewModel.filteredTerms) { term in
                            NavigationLink(value: term.id) {
                                CardView {
                                    VStack(alignment: .leading, spacing: AppSpacing.xs) {
                                        Text(term.termino)
                                            .font(AppTypography.cardHeading)
                                            .foregroundStyle(Color.appForeground)

                                        Text(term.definicion)
                                            .font(AppTypography.bodySmall)
                                            .foregroundStyle(Color.appMutedForeground)
                                            .lineLimit(2)
                                            .multilineTextAlignment(.leading)
                                    }
                                    .frame(maxWidth: .infinity, alignment: .leading)
                                }
                            }
                            .buttonStyle(.plain)
                        }
                    }
                    .padding(.horizontal, AppSpacing.sm)
                }
            }
            .padding(.bottom, AppSpacing.md)
        }
        .background(Color.appBackground)
        .navigationTitle("Glosario Tributario")
        .navigationBarTitleDisplayMode(.large)
        .navigationDestination(for: String.self) { termId in
            if let term = viewModel.filteredTerms.first(where: { $0.id == termId })
                ?? GlosarioData.terminos.first(where: { $0.id == termId }) {
                GlosarioDetailView(term: term)
            } else {
                ContentUnavailableView("Termino no encontrado", systemImage: "exclamationmark.triangle")
            }
        }
    }
}
