import SwiftUI

struct MoreView: View {

    var body: some View {
        NavigationStack {
            List {
                Section("Herramientas") {
                    NavigationLink {
                        CalendarioView()
                    } label: {
                        moreRow(icon: "calendar", title: "Calendario Fiscal 2026", subtitle: "Fechas y plazos tributarios")
                    }

                    NavigationLink {
                        IndicadoresView()
                    } label: {
                        moreRow(icon: "chart.bar", title: "Indicadores Economicos", subtitle: "UVT, SMLMV, tasas de interes")
                    }

                    NavigationLink {
                        GlosarioView()
                    } label: {
                        moreRow(icon: "character.book.closed", title: "Glosario Tributario", subtitle: "Terminos y definiciones")
                    }

                    NavigationLink {
                        RetencionTablaView()
                    } label: {
                        moreRow(icon: "tablecells", title: "Tabla de Retencion", subtitle: "Conceptos y tarifas 2026")
                    }
                }

                Section("Contenido") {
                    NavigationLink {
                        DoctrinaListView()
                    } label: {
                        moreRow(icon: "doc.text.magnifyingglass", title: "Doctrina DIAN", subtitle: "Conceptos y oficios oficiales")
                    }

                    NavigationLink {
                        GuiasListView()
                    } label: {
                        moreRow(icon: "list.bullet.clipboard", title: "Guias Interactivas", subtitle: "Paso a paso tributarios")
                    }

                    NavigationLink {
                        NovedadesListView()
                    } label: {
                        moreRow(icon: "newspaper", title: "Novedades Normativas", subtitle: "Reformas y cambios recientes")
                    }
                }

                Section("Personal") {
                    NavigationLink {
                        FavoritosView()
                    } label: {
                        moreRow(icon: "bookmark", title: "Favoritos", subtitle: "Articulos y calculadoras guardados")
                    }
                }

                Section("Herramientas avanzadas") {
                    NavigationLink {
                        DashboardView()
                    } label: {
                        moreRow(icon: "chart.xyaxis.line", title: "Dashboard Analitico", subtitle: "Estadisticas del Estatuto Tributario")
                    }

                    NavigationLink {
                        GraphView()
                    } label: {
                        moreRow(icon: "point.3.connected.trianglepath.dotted", title: "Grafo de Relaciones", subtitle: "Mapa visual de conexiones del ET")
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
