import SwiftUI

struct CalculatorListView: View {
    @State private var viewModel = CalculatorListViewModel()

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: AppSpacing.sm) {
                    // Search bar
                    SearchBarView(text: $viewModel.searchText, placeholder: "Buscar calculadora...")
                        .padding(.horizontal, AppSpacing.sm)

                    // Category filter chips
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 8) {
                            ForEach(viewModel.categories) { category in
                                FilterChipView(
                                    title: category.displayName,
                                    isSelected: viewModel.selectedCategory == category,
                                    action: { viewModel.selectedCategory = category }
                                )
                            }
                        }
                        .padding(.horizontal, AppSpacing.sm)
                    }

                    // Calculator grid
                    if viewModel.filteredCalculators.isEmpty {
                        EmptySearchView(query: viewModel.searchText)
                            .padding(.top, AppSpacing.md)
                    } else {
                        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: AppSpacing.xs) {
                            ForEach(viewModel.filteredCalculators) { calc in
                                NavigationLink(value: calc.id) {
                                    calculatorCard(calc)
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
            .navigationTitle("Calculadoras")
            .navigationBarTitleDisplayMode(.large)
            .navigationDestination(for: String.self) { calcId in
                calculatorDetailView(for: calcId)
                    .onAppear { viewModel.trackUsage(calcId) }
            }
        }
    }

    private func calculatorCard(_ calc: CalculatorCatalogItem) -> some View {
        VStack(alignment: .leading, spacing: AppSpacing.xs) {
            Image(systemName: calc.sfSymbol)
                .font(.system(size: 22))
                .foregroundStyle(Color.appForeground)

            Text(calc.title)
                .font(AppTypography.bodySmall)
                .fontWeight(.semibold)
                .foregroundStyle(Color.appForeground)
                .lineLimit(2)
                .multilineTextAlignment(.leading)

            Text(calc.description)
                .font(AppTypography.caption)
                .foregroundStyle(Color.appMutedForeground)
                .lineLimit(2)
                .multilineTextAlignment(.leading)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(12)
        .background(Color.appCard)
        .clipShape(RoundedRectangle(cornerRadius: AppRadius.card))
        .overlay(
            RoundedRectangle(cornerRadius: AppRadius.card)
                .stroke(Color.appBorder, lineWidth: 1)
        )
    }

    @ViewBuilder
    private func calculatorDetailView(for id: String) -> some View {
        switch id {
        case "renta":
            RentaCalculatorView()
        case "retencion", "retencion-salarios":
            RetencionCalculatorView()
        case "iva":
            IVACalculatorView()
        case "simple", "comparador-regimenes":
            SIMPLECalculatorView()
        case "sanciones", "sanciones-ampliadas", "intereses-mora":
            SancionesCalculatorView()
        case "nomina-completa", "liquidacion-laboral", "horas-extras", "seguridad-social", "licencia-maternidad":
            LaboralCalculatorsView(initialSection: id)
        case "patrimonio", "comparacion-patrimonial":
            PatrimonioCalculatorView()
        default:
            OtherCalculatorsView(calculatorId: id)
        }
    }
}
