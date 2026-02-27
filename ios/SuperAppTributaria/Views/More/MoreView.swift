import SwiftUI

struct MoreView: View {

    var body: some View {
        NavigationStack {
            List {
                Section("Herramientas") {
                    moreRow(icon: "calendar", title: "Calendario Fiscal 2026", subtitle: "Fechas y plazos tributarios")
                    moreRow(icon: "chart.bar", title: "Indicadores Economicos", subtitle: "UVT, SMLMV, tasas de interes")
                    moreRow(icon: "character.book.closed", title: "Glosario Tributario", subtitle: "Terminos y definiciones")
                }

                Section("Contenido") {
                    moreRow(icon: "doc.text.magnifyingglass", title: "Doctrina DIAN", subtitle: "Conceptos y oficios oficiales")
                    moreRow(icon: "list.bullet.clipboard", title: "Guias Interactivas", subtitle: "Paso a paso tributarios")
                    moreRow(icon: "newspaper", title: "Novedades Normativas", subtitle: "Reformas y cambios recientes")
                }

                Section("Herramientas avanzadas") {
                    moreRow(icon: "chart.xyaxis.line", title: "Dashboard Analitico", subtitle: "Estadisticas del Estatuto Tributario")

                    NavigationLink {
                        GraphView()
                    } label: {
                        Label {
                            VStack(alignment: .leading, spacing: 2) {
                                Text("Grafo de Relaciones")
                                    .font(AppTypography.bodyDefault)
                                    .foregroundStyle(Color.appForeground)
                                Text("Mapa visual de conexiones del ET")
                                    .font(AppTypography.caption)
                                    .foregroundStyle(Color.appMutedForeground)
                            }
                        } icon: {
                            Image(systemName: "point.3.connected.trianglepath.dotted")
                                .foregroundStyle(Color.appForeground)
                        }
                    }
                }

                Section {
                    HStack {
                        Spacer()
                        VStack(spacing: 4) {
                            Text("SuperApp Tributaria Colombia")
                                .font(AppTypography.caption)
                                .foregroundStyle(Color.appMutedForeground)
                            Text("UVT 2026: $52.374 | SMLMV: $1.750.905")
                                .font(AppTypography.caption)
                                .foregroundStyle(Color.appMutedForeground)
                        }
                        Spacer()
                    }
                }
            }
            .navigationTitle("Mas")
            .navigationBarTitleDisplayMode(.large)
        }
    }

    private func moreRow(icon: String, title: String, subtitle: String) -> some View {
        Label {
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(AppTypography.bodyDefault)
                    .foregroundStyle(Color.appForeground)
                Text(subtitle)
                    .font(AppTypography.caption)
                    .foregroundStyle(Color.appMutedForeground)
            }
        } icon: {
            Image(systemName: icon)
                .foregroundStyle(Color.appForeground)
        }
    }
}
