import SwiftUI
import Charts

struct IndicadorDetailView: View {
    let indicador: IndicadorItem

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: AppSpacing.sm) {

                // MARK: - Valor prominente

                VStack(spacing: 4) {
                    Text(indicador.valor)
                        .font(.system(size: 40, weight: .bold))
                        .foregroundStyle(Color.appForeground)

                    Text(unidadLabel)
                        .font(AppTypography.label)
                        .foregroundStyle(Color.appMutedForeground)

                    Text("Corte: \(indicador.fechaCorte)")
                        .font(AppTypography.caption)
                        .foregroundStyle(Color.appMutedForeground)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, AppSpacing.sm)

                Divider()
                    .background(Color.appBorder)

                // MARK: - Para que sirve

                sectionView(title: "Para que sirve") {
                    Text(indicador.paraQueSirve)
                        .font(AppTypography.bodyDefault)
                        .foregroundStyle(Color.appForeground)
                }

                // MARK: - Notas

                if let notas = indicador.notas, !notas.isEmpty {
                    sectionView(title: "Notas") {
                        Text(notas)
                            .font(AppTypography.bodySmall)
                            .foregroundStyle(Color.appMutedForeground)
                            .padding(AppSpacing.sm)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .background(Color.appMuted)
                            .clipShape(RoundedRectangle(cornerRadius: AppRadius.card))
                            .overlay(
                                RoundedRectangle(cornerRadius: AppRadius.card)
                                    .stroke(Color.appBorder, lineWidth: 1)
                            )
                    }
                }

                // MARK: - Articulo ET

                if let articulo = indicador.articulo, !articulo.isEmpty {
                    sectionView(title: "Articulo del ET") {
                        Text("Art. \(articulo)")
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

                // MARK: - Chart

                if !indicador.history.isEmpty {
                    sectionView(title: "Historico") {
                        IndicadorChartView(history: indicador.history)
                    }
                }
            }
            .padding(AppSpacing.sm)
        }
        .background(Color.appBackground)
        .navigationTitle(indicador.nombre)
        .navigationBarTitleDisplayMode(.inline)
    }

    // MARK: - Helpers

    private var unidadLabel: String {
        switch indicador.unidad {
        case "cop": "Pesos colombianos (COP)"
        case "porcentaje": "Porcentaje (%)"
        case "indice": "Indice"
        default: indicador.unidad.capitalized
        }
    }

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
}
