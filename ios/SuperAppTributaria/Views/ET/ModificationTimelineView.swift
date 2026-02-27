import SwiftUI

struct ModificationTimelineView: View {
    let modifications: [Modificacion]

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            ForEach(Array(modifications.enumerated()), id: \.element.id) { index, mod in
                HStack(alignment: .top, spacing: 12) {
                    // Timeline indicator
                    VStack(spacing: 0) {
                        Circle()
                            .fill(tipoColor(mod.tipo))
                            .frame(width: 12, height: 12)

                        if index < modifications.count - 1 {
                            Rectangle()
                                .fill(Color.appBorder)
                                .frame(width: 2)
                                .frame(maxHeight: .infinity)
                        }
                    }
                    .frame(width: 12)

                    // Content
                    VStack(alignment: .leading, spacing: 4) {
                        HStack {
                            Text(mod.tipo.capitalized)
                                .font(AppTypography.label)
                                .foregroundStyle(tipoColor(mod.tipo))

                            if let year = mod.normaYear {
                                Text("(\(String(year)))")
                                    .font(AppTypography.caption)
                                    .foregroundStyle(Color.appMutedForeground)
                            }
                        }

                        if let normaTipo = mod.normaTipo, let normaNumero = mod.normaNumero {
                            HStack(spacing: 4) {
                                Text("\(normaTipo) \(normaNumero)")
                                    .font(AppTypography.bodySmall)
                                    .foregroundStyle(Color.appForeground)

                                if let year = mod.normaYear {
                                    Text("de \(String(year))")
                                        .font(AppTypography.bodySmall)
                                        .foregroundStyle(Color.appMutedForeground)
                                }
                            }

                            if let art = mod.normaArticulo {
                                Text("Art. \(art)")
                                    .font(AppTypography.caption)
                                    .foregroundStyle(Color.appMutedForeground)
                            }
                        }
                    }
                    .padding(.bottom, AppSpacing.sm)
                }
            }
        }
        .padding(.horizontal, AppSpacing.sm)
    }

    private func tipoColor(_ tipo: String) -> Color {
        switch tipo.lowercased() {
        case "modificado": return ColorPalette.modificado
        case "adicionado": return ColorPalette.vigente
        case "derogado": return ColorPalette.derogado
        default: return Color.appMutedForeground
        }
    }
}
