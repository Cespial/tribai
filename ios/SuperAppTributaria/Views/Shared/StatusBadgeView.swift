import SwiftUI

struct StatusBadgeView: View {
    let text: String
    let color: Color

    var body: some View {
        Text(text)
            .font(AppTypography.caption)
            .fontWeight(.medium)
            .foregroundStyle(color)
            .padding(.horizontal, 8)
            .padding(.vertical, 3)
            .background(color.opacity(0.12))
            .clipShape(Capsule())
    }
}

// MARK: - Convenience initializers

extension StatusBadgeView {
    static func deadline(_ status: DeadlineStatus) -> StatusBadgeView {
        switch status {
        case .vencido:
            StatusBadgeView(text: "Vencido", color: ColorPalette.derogado)
        case .hoy:
            StatusBadgeView(text: "Hoy", color: Color.orange)
        case .proximo:
            StatusBadgeView(text: "Proximo", color: ColorPalette.modificado)
        case .futuro:
            StatusBadgeView(text: "Futuro", color: ColorPalette.vigente)
        }
    }

    static func impacto(_ impacto: NovedadImpacto) -> StatusBadgeView {
        switch impacto {
        case .alto:
            StatusBadgeView(text: "Alto", color: ColorPalette.derogado)
        case .medio:
            StatusBadgeView(text: "Medio", color: ColorPalette.modificado)
        case .bajo:
            StatusBadgeView(text: "Bajo", color: ColorPalette.vigente)
        }
    }

    static func vigente(_ isVigente: Bool) -> StatusBadgeView {
        isVigente
            ? StatusBadgeView(text: "Vigente", color: ColorPalette.vigente)
            : StatusBadgeView(text: "No vigente", color: ColorPalette.derogado)
    }

    static func tipo(_ tipo: NovedadTipo) -> StatusBadgeView {
        StatusBadgeView(text: tipo.label, color: Color.appMutedForeground)
    }

    static func docTipo(_ tipo: DoctrinaTipoDoc) -> StatusBadgeView {
        StatusBadgeView(text: tipo.label, color: Color.appMutedForeground)
    }

    static func complejidad(_ nivel: String) -> StatusBadgeView {
        let color: Color = switch nivel {
        case "basica": ColorPalette.vigente
        case "intermedia": ColorPalette.modificado
        case "avanzada": ColorPalette.derogado
        default: Color.appMutedForeground
        }
        return StatusBadgeView(text: nivel.capitalized, color: color)
    }
}
