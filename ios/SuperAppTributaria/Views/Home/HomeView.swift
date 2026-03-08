import SwiftUI

struct HomeView: View {
    @State private var viewModel = HomeViewModel()
    var onNavigateToCalculators: () -> Void = {}
    var onNavigateToChat: () -> Void = {}
    var onNavigateToMore: () -> Void = {}
    var onNavigateToET: () -> Void = {}
    var onNavigateToCalculator: ((CalculatorCatalogItem) -> Void)?

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: AppSpacing.sm) {
                    // Header
                    headerSection

                    // Quick access calculators
                    QuickAccessSection(
                        calculators: viewModel.quickAccessCalculators,
                        onSelect: { calc in
                            viewModel.trackCalculatorUsage(calc.id)
                            onNavigateToCalculator?(calc)
                        }
                    )

                    // Key indicators
                    indicatorsSection

                    // Feature grid
                    Text("Herramientas")
                        .font(AppTypography.sectionHeading)
                        .foregroundStyle(Color.appForeground)

                    featuresGrid
                }
                .padding(.horizontal, AppSpacing.sm)
                .padding(.bottom, AppSpacing.md)
            }
            .background(Color.appBackground)
            .navigationTitle("SuperApp Tributaria")
            .navigationBarTitleDisplayMode(.large)
        }
    }

    // MARK: - Header

    private var headerSection: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text("Constantes \(TaxData.currentUVTYear)")
                .font(AppTypography.label)
                .foregroundStyle(Color.appMutedForeground)

            HStack(spacing: AppSpacing.sm) {
                indicatorPill(label: "UVT", value: CurrencyFormatter.cop(TaxData.uvt2026))
                indicatorPill(label: "SMLMV", value: CurrencyFormatter.cop(TaxData.smlmv2026))
            }
        }
    }

    private func indicatorPill(label: String, value: String) -> some View {
        HStack(spacing: 4) {
            Text(label)
                .font(AppTypography.caption)
                .foregroundStyle(Color.appMutedForeground)
            Text(value)
                .font(AppTypography.bodySmall)
                .fontWeight(.semibold)
                .foregroundStyle(Color.appForeground)
        }
        .padding(.horizontal, 10)
        .padding(.vertical, 6)
        .background(Color.appCard)
        .clipShape(RoundedRectangle(cornerRadius: AppRadius.card))
        .overlay(
            RoundedRectangle(cornerRadius: AppRadius.card)
                .stroke(Color.appBorder, lineWidth: 1)
        )
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(label): \(value)")
    }

    // MARK: - Indicators

    private var indicatorsSection: some View {
        HStack(spacing: AppSpacing.xs) {
            indicatorCard(title: "Auxilio Transporte", value: CurrencyFormatter.cop(TaxData.auxilioTransporte2026))
            indicatorCard(title: "Sancion Minima", value: CurrencyFormatter.cop(TaxData.sancionMinimaUVT * TaxData.uvt2026))
        }
    }

    private func indicatorCard(title: String, value: String) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(title)
                .font(AppTypography.caption)
                .foregroundStyle(Color.appMutedForeground)
            Text(value)
                .font(AppTypography.bodySmall)
                .fontWeight(.semibold)
                .foregroundStyle(Color.appForeground)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(12)
        .background(Color.appCard)
        .clipShape(RoundedRectangle(cornerRadius: AppRadius.card))
        .overlay(
            RoundedRectangle(cornerRadius: AppRadius.card)
                .stroke(Color.appBorder, lineWidth: 1)
        )
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(title): \(value)")
    }

    // MARK: - Features Grid

    private var featuresGrid: some View {
        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: AppSpacing.xs) {
            ForEach(viewModel.features) { feature in
                FeatureCardView(
                    sfSymbol: feature.sfSymbol,
                    title: feature.title,
                    description: feature.description,
                    action: {
                        handleFeatureTap(feature)
                    }
                )
                .accessibilityLabel("\(feature.title): \(feature.description)")
            }
        }
    }

    private func handleFeatureTap(_ feature: HomeViewModel.FeatureItem) {
        switch feature.destination {
        case .calculators:
            onNavigateToCalculators()
        case .tab(let tab):
            switch tab {
            case .chat:
                onNavigateToChat()
            case .et:
                onNavigateToET()
            case .more:
                onNavigateToMore()
            default:
                onNavigateToMore()
            }
        case .graph:
            onNavigateToMore()
        }
    }
}
