import SwiftUI
import SafariServices

struct SourceCitationsPanel: View {
    let sources: [SourceCitation]
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            List {
                ForEach(sources) { source in
                    SourceDetailRow(source: source)
                }
            }
            .listStyle(.insetGrouped)
            .navigationTitle("Fuentes (\(sources.count))")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Cerrar") { dismiss() }
                }
            }
        }
    }
}

struct SourceDetailRow: View {
    let source: SourceCitation
    @State private var showSafari = false

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Circle()
                    .fill(statusColor)
                    .frame(width: 8, height: 8)

                Text(source.idArticulo)
                    .font(AppTypography.bodyDefault)
                    .fontWeight(.semibold)

                Spacer()

                if let estado = source.estado {
                    Text(estado.rawValue.capitalized)
                        .font(AppTypography.caption)
                        .foregroundStyle(statusColor)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 2)
                        .background(statusColor.opacity(0.1))
                        .clipShape(Capsule())
                }
            }

            Text(source.titulo)
                .font(AppTypography.bodySmall)
                .foregroundStyle(Color.appForeground)

            if !source.libro.isEmpty {
                Text(source.libro)
                    .font(AppTypography.caption)
                    .foregroundStyle(Color.appMutedForeground)
            }

            Button {
                showSafari = true
            } label: {
                Label("Ver artículo completo", systemImage: "safari")
                    .font(AppTypography.bodySmall)
            }
        }
        .padding(.vertical, 4)
        .sheet(isPresented: $showSafari) {
            if let urlString = source.url, let url = URL(string: urlString) {
                SafariView(url: url)
            } else if let slug = source.slug {
                SafariView(url: APIConfig.baseURL.appendingPathComponent("articulo/\(slug)"))
            }
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(source.idArticulo): \(source.titulo), estado: \(source.estado?.rawValue ?? "desconocido")")
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

// MARK: - Safari View

struct SafariView: UIViewControllerRepresentable {
    let url: URL

    func makeUIViewController(context: Context) -> SFSafariViewController {
        SFSafariViewController(url: url)
    }

    func updateUIViewController(_ uiViewController: SFSafariViewController, context: Context) {}
}
