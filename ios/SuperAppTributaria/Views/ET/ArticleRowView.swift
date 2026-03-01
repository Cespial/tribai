import SwiftUI

struct ArticleRowView: View {
    let article: ArticleIndexItem

    var body: some View {
        CardView {
            VStack(alignment: .leading, spacing: 8) {
                // Top row: ID + estado badge
                HStack(alignment: .center) {
                    Text(article.id)
                        .font(AppTypography.label)
                        .foregroundStyle(Color.appForeground)

                    estadoBadge

                    Spacer()

                    Image(systemName: "chevron.right")
                        .font(.system(size: 12))
                        .foregroundStyle(Color.appMutedForeground)
                        .accessibilityHidden(true)
                }

                // Titulo corto
                Text(article.tituloCorto)
                    .font(AppTypography.bodySmall)
                    .foregroundStyle(Color.appForeground)
                    .lineLimit(2)

                // Preview snippet
                if !article.previewSnippet.isEmpty {
                    Text(article.previewSnippet)
                        .font(AppTypography.caption)
                        .foregroundStyle(Color.appMutedForeground)
                        .lineLimit(2)
                }

                // Pills row
                HStack(spacing: 6) {
                    libroPill

                    if article.totalMods > 0 {
                        pillView(
                            icon: "pencil",
                            text: "\(article.totalMods)",
                            color: ColorPalette.modificado
                        )
                    }

                    if article.totalNormas > 0 {
                        pillView(
                            icon: "doc.text",
                            text: "\(article.totalNormas)",
                            color: Color.appMutedForeground
                        )
                    }

                    if article.crossReferencesValidCount > 0 {
                        pillView(
                            icon: "arrow.triangle.branch",
                            text: "\(article.crossReferencesValidCount)",
                            color: Color.appMutedForeground
                        )
                    }
                }
            }
        }
        .padding(.horizontal, AppSpacing.sm)
    }

    private var estadoBadge: some View {
        Text(article.estado.rawValue.capitalized)
            .font(.system(size: 10, weight: .medium))
            .foregroundStyle(estadoTextColor)
            .padding(.horizontal, 6)
            .padding(.vertical, 2)
            .background(estadoColor)
            .clipShape(Capsule())
    }

    private var estadoColor: Color {
        switch article.estado {
        case .vigente: return ColorPalette.vigente
        case .modificado: return ColorPalette.modificado
        case .derogado: return ColorPalette.derogado
        }
    }

    private var estadoTextColor: Color {
        // Yellow background needs dark text for WCAG contrast
        article.estado == .modificado ? Color.appForeground : .white
    }

    private var libroPill: some View {
        let color = LibroColor.color(for: article.libro)
        let shortName = LibroColor.shortName(for: article.libro)
        return Text(shortName)
            .font(.system(size: 10, weight: .medium))
            .foregroundStyle(color)
            .padding(.horizontal, 6)
            .padding(.vertical, 2)
            .background(color.opacity(0.12))
            .clipShape(Capsule())
    }

    private func pillView(icon: String, text: String, color: Color) -> some View {
        HStack(spacing: 2) {
            Image(systemName: icon)
                .font(.system(size: 9))
            Text(text)
                .font(.system(size: 10, weight: .medium))
        }
        .foregroundStyle(color)
        .padding(.horizontal, 6)
        .padding(.vertical, 2)
        .background(color.opacity(0.1))
        .clipShape(Capsule())
    }
}
