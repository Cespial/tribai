import SwiftUI

struct FavoritosView: View {
    @State private var viewModel = FavoritosViewModel()

    var body: some View {
        VStack(spacing: 0) {
            // Tab picker
            Picker("", selection: $viewModel.selectedTab) {
                ForEach(FavoritosViewModel.Tab.allCases) { tab in
                    Text(tab.rawValue).tag(tab)
                }
            }
            .pickerStyle(.segmented)
            .padding(AppSpacing.sm)

            // Content
            if viewModel.isEmpty {
                emptyState
            } else {
                ScrollView {
                    LazyVStack(spacing: AppSpacing.xs) {
                        switch viewModel.selectedTab {
                        case .articulos:
                            if viewModel.articleSlugs.isEmpty {
                                emptyTabMessage("No tienes articulos guardados.")
                            } else {
                                ForEach(viewModel.articleSlugs, id: \.self) { slug in
                                    NavigationLink(value: slug) {
                                        articleRow(slug: slug)
                                    }
                                    .buttonStyle(.plain)
                                }
                            }

                        case .calculadoras:
                            if viewModel.calculatorIds.isEmpty {
                                emptyTabMessage("No tienes calculadoras guardadas.")
                            } else {
                                ForEach(viewModel.calculatorIds, id: \.self) { calcId in
                                    if let calc = CalculatorCatalog.item(byId: calcId) {
                                        calculatorRow(calc)
                                    }
                                }
                            }
                        }
                    }
                    .padding(.horizontal, AppSpacing.sm)
                }
            }
        }
        .background(Color.appBackground)
        .navigationTitle("Favoritos")
        .navigationBarTitleDisplayMode(.large)
        .navigationDestination(for: String.self) { slug in
            ArticleDetailView(slug: slug)
        }
    }

    // MARK: - Article Row

    @ViewBuilder
    private func articleRow(slug: String) -> some View {
        CardView {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(slug.replacingOccurrences(of: "articulo-", with: "Art. "))
                        .font(AppTypography.bodyDefault)
                        .fontWeight(.semibold)
                        .foregroundStyle(Color.appForeground)
                }
                Spacer()
                Image(systemName: "chevron.right")
                    .font(.system(size: 12))
                    .foregroundStyle(Color.appMutedForeground)
            }
        }
    }

    // MARK: - Calculator Row

    @ViewBuilder
    private func calculatorRow(_ calc: CalculatorCatalogItem) -> some View {
        CardView {
            HStack(spacing: AppSpacing.xs) {
                Image(systemName: calc.sfSymbol)
                    .font(.system(size: 20))
                    .foregroundStyle(Color.appForeground)
                    .frame(width: 32)

                VStack(alignment: .leading, spacing: 2) {
                    Text(calc.title)
                        .font(AppTypography.bodyDefault)
                        .fontWeight(.semibold)
                        .foregroundStyle(Color.appForeground)
                    Text(calc.description)
                        .font(AppTypography.caption)
                        .foregroundStyle(Color.appMutedForeground)
                        .lineLimit(1)
                }

                Spacer()
            }
        }
    }

    // MARK: - Empty States

    private var emptyState: some View {
        VStack(spacing: AppSpacing.sm) {
            Spacer()
            Image(systemName: "bookmark")
                .font(.system(size: 48))
                .foregroundStyle(Color.appMutedForeground)
            Text("Sin favoritos")
                .font(AppTypography.cardHeading)
                .foregroundStyle(Color.appForeground)
            Text("Guarda articulos y calculadoras para acceso rapido.")
                .font(AppTypography.bodySmall)
                .foregroundStyle(Color.appMutedForeground)
                .multilineTextAlignment(.center)
            Spacer()
        }
        .padding(AppSpacing.md)
    }

    @ViewBuilder
    private func emptyTabMessage(_ message: String) -> some View {
        Text(message)
            .font(AppTypography.bodySmall)
            .foregroundStyle(Color.appMutedForeground)
            .padding(.top, AppSpacing.md)
            .frame(maxWidth: .infinity)
    }
}
