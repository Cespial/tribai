import SwiftUI

struct SourceCitationChip: View {
    let source: SourceCitation
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            HStack(spacing: 6) {
                Circle()
                    .fill(statusColor)
                    .frame(width: 6, height: 6)

                Text(source.idArticulo)
                    .font(AppTypography.caption)
                    .fontWeight(.medium)
                    .foregroundStyle(Color.appForeground)
            }
            .padding(.horizontal, 10)
            .padding(.vertical, 6)
            .background(Color.appCard)
            .clipShape(Capsule())
            .overlay(
                Capsule()
                    .stroke(Color.appBorder, lineWidth: 1)
            )
        }
        .buttonStyle(.plain)
        .accessibilityLabel("\(source.idArticulo), \(source.titulo), estado: \(source.estado?.rawValue ?? "desconocido")")
        .accessibilityHint("Toca para ver detalles del artículo")
    }

    private var statusColor: Color {
        switch source.estado {
        case .vigente: return ColorPalette.vigente
        case .modificado: return ColorPalette.modificado
        case .derogado: return ColorPalette.derogado
        case nil: return Color.appMutedForeground
        }
    }
}

#Preview {
    HStack {
        SourceCitationChip(
            source: SourceCitation(
                idArticulo: "Art. 240",
                titulo: "Tarifa general del impuesto",
                url: "https://estatuto.co/240",
                categoriaLibro: "Libro I",
                relevanceScore: 0.9,
                slug: "240",
                estado: .vigente
            ),
            onTap: {}
        )
        SourceCitationChip(
            source: SourceCitation(
                idArticulo: "Art. 592",
                titulo: "Quiénes no están obligados",
                url: "https://estatuto.co/592",
                categoriaLibro: "Libro I",
                relevanceScore: 0.8,
                slug: "592",
                estado: .modificado
            ),
            onTap: {}
        )
    }
}
