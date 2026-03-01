import SwiftUI

struct GlosarioDetailView: View {
    let term: GlosarioTerm

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: AppSpacing.sm) {
                // Term name
                Text(term.termino)
                    .font(AppTypography.pageHeading)
                    .foregroundStyle(Color.appForeground)

                // Full definition
                Text(term.definicion)
                    .font(AppTypography.bodyDefault)
                    .foregroundStyle(Color.appForeground)

                // Articulos del ET
                if !term.articulos.isEmpty {
                    VStack(alignment: .leading, spacing: AppSpacing.xs) {
                        Text("Articulos del ET")
                            .font(AppTypography.cardHeading)
                            .foregroundStyle(Color.appForeground)

                        FlowLayout(spacing: AppSpacing.xs) {
                            ForEach(term.articulos, id: \.self) { articulo in
                                Text("Art. \(articulo)")
                                    .font(AppTypography.caption)
                                    .foregroundStyle(Color.appMutedForeground)
                                    .padding(.horizontal, 10)
                                    .padding(.vertical, 6)
                                    .background(Color.appMuted)
                                    .clipShape(Capsule())
                                    .overlay(
                                        Capsule()
                                            .stroke(Color.appBorder, lineWidth: 1)
                                    )
                            }
                        }
                    }
                    .padding(.top, AppSpacing.xs)
                }

                // Terminos relacionados
                if !term.relacionados.isEmpty {
                    VStack(alignment: .leading, spacing: AppSpacing.xs) {
                        Text("Terminos relacionados")
                            .font(AppTypography.cardHeading)
                            .foregroundStyle(Color.appForeground)

                        FlowLayout(spacing: AppSpacing.xs) {
                            ForEach(term.relacionados, id: \.self) { relacionado in
                                Text(relacionado)
                                    .font(AppTypography.caption)
                                    .foregroundStyle(Color.appMutedForeground)
                                    .padding(.horizontal, 10)
                                    .padding(.vertical, 6)
                                    .background(Color.appMuted)
                                    .clipShape(Capsule())
                                    .overlay(
                                        Capsule()
                                            .stroke(Color.appBorder, lineWidth: 1)
                                    )
                            }
                        }
                    }
                    .padding(.top, AppSpacing.xs)
                }
            }
            .padding(AppSpacing.sm)
        }
        .background(Color.appBackground)
        .navigationTitle(term.termino)
        .navigationBarTitleDisplayMode(.inline)
    }
}

// MARK: - FlowLayout (wrapping horizontal layout for pills)

private struct FlowLayout: Layout {
    var spacing: CGFloat = 8

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let result = arrangeSubviews(proposal: proposal, subviews: subviews)
        return result.size
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let result = arrangeSubviews(
            proposal: ProposedViewSize(width: bounds.width, height: bounds.height),
            subviews: subviews
        )
        for (index, position) in result.positions.enumerated() {
            subviews[index].place(
                at: CGPoint(x: bounds.minX + position.x, y: bounds.minY + position.y),
                proposal: .unspecified
            )
        }
    }

    private func arrangeSubviews(
        proposal: ProposedViewSize,
        subviews: Subviews
    ) -> (size: CGSize, positions: [CGPoint]) {
        let maxWidth = proposal.width ?? .infinity
        var positions: [CGPoint] = []
        var currentX: CGFloat = 0
        var currentY: CGFloat = 0
        var lineHeight: CGFloat = 0
        var totalWidth: CGFloat = 0

        for subview in subviews {
            let size = subview.sizeThatFits(.unspecified)

            if currentX + size.width > maxWidth, currentX > 0 {
                currentX = 0
                currentY += lineHeight + spacing
                lineHeight = 0
            }

            positions.append(CGPoint(x: currentX, y: currentY))
            lineHeight = max(lineHeight, size.height)
            currentX += size.width + spacing
            totalWidth = max(totalWidth, currentX - spacing)
        }

        let totalHeight = currentY + lineHeight
        return (CGSize(width: totalWidth, height: totalHeight), positions)
    }
}
