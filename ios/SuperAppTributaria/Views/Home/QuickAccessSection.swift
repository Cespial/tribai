import SwiftUI

struct QuickAccessSection: View {
    let calculators: [CalculatorCatalogItem]
    let onSelect: (CalculatorCatalogItem) -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: AppSpacing.xs) {
            Text("Acceso rapido")
                .font(AppTypography.sectionHeading)
                .foregroundStyle(Color.appForeground)

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: AppSpacing.xs) {
                    ForEach(calculators) { calc in
                        Button {
                            onSelect(calc)
                            Haptics.send()
                        } label: {
                            HStack(spacing: 8) {
                                Image(systemName: calc.sfSymbol)
                                    .font(.system(size: 14))
                                    .foregroundStyle(Color.appForeground)

                                Text(calc.title)
                                    .font(AppTypography.bodySmall)
                                    .foregroundStyle(Color.appForeground)
                                    .lineLimit(1)
                            }
                            .padding(.horizontal, 14)
                            .padding(.vertical, 10)
                            .background(Color.appCard)
                            .clipShape(RoundedRectangle(cornerRadius: AppRadius.card))
                            .overlay(
                                RoundedRectangle(cornerRadius: AppRadius.card)
                                    .stroke(Color.appBorder, lineWidth: 1)
                            )
                        }
                        .buttonStyle(.plain)
                    }
                }
            }
        }
    }
}
