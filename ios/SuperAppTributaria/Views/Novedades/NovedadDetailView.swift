import SwiftUI

struct NovedadDetailView: View {
    let novedad: NovedadNormativa

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: AppSpacing.sm) {

                // MARK: - Header

                Text(novedad.titulo)
                    .font(AppTypography.pageHeading)
                    .foregroundStyle(Color.appForeground)

                HStack(spacing: AppSpacing.xs) {
                    Text(novedad.fecha)
                    Text("·")
                    Text(novedad.fuente)
                    Text("·")
                    Text(novedad.numero)
                }
                .font(AppTypography.caption)
                .foregroundStyle(Color.appMutedForeground)

                HStack(spacing: AppSpacing.xs) {
                    StatusBadgeView.tipo(novedad.tipo)
                    StatusBadgeView.impacto(novedad.impacto)
                }

                Divider()
                    .background(Color.appBorder)

                // MARK: - Resumen

                sectionView(title: "Resumen") {
                    Text(novedad.resumen)
                        .font(AppTypography.bodyDefault)
                        .foregroundStyle(Color.appForeground)
                }

                // MARK: - Que significa para ti

                highlightedSection(
                    title: "Que significa para ti",
                    content: novedad.queSignificaParaTi,
                    icon: "person.fill"
                )

                // MARK: - Accion recomendada

                highlightedSection(
                    title: "Accion recomendada",
                    content: novedad.accionRecomendada,
                    icon: "checkmark.shield.fill"
                )

                // MARK: - Detalle completo

                sectionView(title: "Detalle completo") {
                    Text(novedad.detalleCompleto)
                        .font(AppTypography.bodyDefault)
                        .foregroundStyle(Color.appForeground)
                }

                // MARK: - Articulos ET afectados

                if !novedad.articulosET.isEmpty {
                    sectionView(title: "Articulos ET afectados") {
                        FlowLayout(spacing: AppSpacing.xs) {
                            ForEach(novedad.articulosET, id: \.self) { articulo in
                                pillView("Art. \(articulo)")
                            }
                        }
                    }
                }

                // MARK: - Tags

                if !novedad.tags.isEmpty {
                    sectionView(title: "Tags") {
                        FlowLayout(spacing: AppSpacing.xs) {
                            ForEach(novedad.tags, id: \.self) { tag in
                                pillView(tag)
                            }
                        }
                    }
                }
            }
            .padding(AppSpacing.sm)
        }
        .background(Color.appBackground)
        .navigationTitle(novedad.titulo)
        .navigationBarTitleDisplayMode(.inline)
    }

    // MARK: - Section

    @ViewBuilder
    private func sectionView<Content: View>(
        title: String,
        @ViewBuilder content: () -> Content
    ) -> some View {
        VStack(alignment: .leading, spacing: AppSpacing.xs) {
            Text(title)
                .font(AppTypography.cardHeading)
                .foregroundStyle(Color.appForeground)

            content()
        }
        .padding(.top, AppSpacing.xs)
    }

    // MARK: - Highlighted Section

    @ViewBuilder
    private func highlightedSection(
        title: String,
        content: String,
        icon: String
    ) -> some View {
        VStack(alignment: .leading, spacing: AppSpacing.xs) {
            HStack(spacing: 6) {
                Image(systemName: icon)
                    .font(.system(size: 14))
                    .foregroundStyle(Color.appForeground)
                Text(title)
                    .font(AppTypography.cardHeading)
                    .foregroundStyle(Color.appForeground)
            }

            Text(content)
                .font(AppTypography.bodyDefault)
                .foregroundStyle(Color.appForeground)
                .padding(AppSpacing.sm)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(Color.appMuted)
                .clipShape(RoundedRectangle(cornerRadius: AppRadius.card))
                .overlay(
                    RoundedRectangle(cornerRadius: AppRadius.card)
                        .stroke(Color.appBorder, lineWidth: 1)
                )
        }
        .padding(.top, AppSpacing.xs)
    }

    // MARK: - Pill

    @ViewBuilder
    private func pillView(_ text: String) -> some View {
        Text(text)
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

// MARK: - FlowLayout

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
