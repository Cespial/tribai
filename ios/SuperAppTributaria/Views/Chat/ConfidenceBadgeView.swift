import SwiftUI

struct ConfidenceBadgeView: View {
    let metadata: RAGMetadata

    var body: some View {
        HStack(spacing: 8) {
            // Confidence level
            HStack(spacing: 4) {
                Circle()
                    .fill(confidenceColor)
                    .frame(width: 6, height: 6)

                Text(confidenceLabel)
                    .font(AppTypography.caption)
                    .foregroundStyle(Color.appMutedForeground)
            }

            // Source count
            if let uniqueArticles = metadata.uniqueArticles {
                Text("\(uniqueArticles) fuentes")
                    .font(AppTypography.caption)
                    .foregroundStyle(Color.appMutedForeground)
            }

            // Pipeline latency
            if let pipelineMs = metadata.pipelineMs {
                Text("\(Int(pipelineMs))ms")
                    .font(AppTypography.caption)
                    .foregroundStyle(Color.appMutedForeground)
            }

            // Degraded mode warning
            if metadata.degradedMode == true {
                Image(systemName: "exclamationmark.triangle.fill")
                    .font(.system(size: 10))
                    .foregroundStyle(.orange)
            }
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel(accessibilityDescription)
    }

    private var confidenceColor: Color {
        switch metadata.confidenceLevel {
        case .high: return ColorPalette.vigente
        case .medium: return ColorPalette.modificado
        case .low: return ColorPalette.derogado
        case nil: return .gray
        }
    }

    private var confidenceLabel: String {
        switch metadata.confidenceLevel {
        case .high: return "Alta confianza"
        case .medium: return "Confianza media"
        case .low: return "Baja confianza"
        case nil: return "Sin datos"
        }
    }

    private var accessibilityDescription: String {
        var parts = [confidenceLabel]
        if let articles = metadata.uniqueArticles {
            parts.append("\(articles) fuentes consultadas")
        }
        if let ms = metadata.pipelineMs {
            parts.append("procesado en \(Int(ms)) milisegundos")
        }
        if metadata.degradedMode == true {
            parts.append("modo degradado activo")
        }
        return parts.joined(separator: ", ")
    }
}
