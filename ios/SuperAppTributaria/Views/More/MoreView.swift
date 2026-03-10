import SwiftUI
import UIKit

struct MoreView: View {
    var onNavigateToCalculators: () -> Void = {}
    @State private var appearanceService = AppearanceService.shared

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
                        GuiasListView(
                            onNavigateToCalculators: onNavigateToCalculators
                        )
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

                Section("Apariencia") {
                    Picker("Modo", selection: $appearanceService.mode) {
                        ForEach(AppearanceMode.allCases, id: \.self) { mode in
                            Text(mode.label).tag(mode)
                        }
                    }
                    .pickerStyle(.segmented)
                }

                Section("Soporte") {
                    Button {
                        openSupportEmail()
                    } label: {
                        moreRow(icon: "envelope", title: "Soporte y comentarios", subtitle: "Escribenos a soporte@tribai.co")
                    }
                }

                Section("Legal") {
                    NavigationLink {
                        LegalView(page: .terms)
                    } label: {
                        moreRow(icon: "doc.plaintext", title: "Terminos de Uso", subtitle: "Condiciones del servicio")
                    }

                    NavigationLink {
                        LegalView(page: .privacy)
                    } label: {
                        moreRow(icon: "lock.shield", title: "Politica de Privacidad", subtitle: "Tratamiento de datos personales")
                    }

                    NavigationLink {
                        LegalView(page: .about)
                    } label: {
                        moreRow(icon: "info.circle", title: "Acerca de", subtitle: "Version, creditos e IA generativa")
                    }
                }

                Section {
                    HStack {
                        Spacer()
                        VStack(spacing: 4) {
                            Text("TribAI")
                                .font(AppTypography.caption)
                                .foregroundStyle(Color.appMutedForeground)
                            Text("v1.0.0")
                                .font(AppTypography.caption)
                                .foregroundStyle(Color.appMutedForeground)
                            Text("UVT \(TaxData.currentUVTYear): \(CurrencyFormatter.cop(TaxData.uvt2026)) | SMLMV: \(CurrencyFormatter.cop(TaxData.smlmv2026))")
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

    private func openSupportEmail() {
        let appVersion = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0.0"
        let buildNumber = Bundle.main.infoDictionary?["CFBundleVersion"] as? String ?? "1"
        let iosVersion = UIDevice.current.systemVersion
        let deviceModel = UIDevice.current.model

        let subject = "TribAI iOS v\(appVersion) - Feedback"
        let body = """

        ---
        Dispositivo: \(deviceModel)
        iOS: \(iosVersion)
        App: v\(appVersion) (\(buildNumber))
        """

        let encodedSubject = subject.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? ""
        let encodedBody = body.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? ""

        if let url = URL(string: "mailto:soporte@tribai.co?subject=\(encodedSubject)&body=\(encodedBody)") {
            UIApplication.shared.open(url)
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
