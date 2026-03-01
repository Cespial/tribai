import SwiftUI
import Charts

struct DashboardView: View {
    @State private var viewModel = DashboardViewModel()

    private let columns = [
        GridItem(.flexible(), spacing: AppSpacing.xs),
        GridItem(.flexible(), spacing: AppSpacing.xs),
    ]

    var body: some View {
        Group {
            if let stats = viewModel.stats {
                statsContent(stats)
            } else {
                ProgressView("Cargando datos...")
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            }
        }
        .background(Color.appBackground)
        .navigationTitle("Dashboard")
    }

    // MARK: - Stats Content

    @ViewBuilder
    private func statsContent(_ stats: DashboardStats) -> some View {
        ScrollView {
            VStack(alignment: .leading, spacing: AppSpacing.sm) {
                // Metric Cards
                metricsSection(stats)

                // Estado Distribution
                estadoSection(stats)

                // Libro Distribution
                libroSection(stats)

                // Top 10 Modified
                topModifiedSection(stats)

                // Reform Timeline
                timelineSection(stats)

                // Complexity Distribution
                complexitySection(stats)

                // Top Laws
                topLawsSection(stats)
            }
            .padding(.horizontal, AppSpacing.sm)
            .padding(.vertical, AppSpacing.xs)
        }
    }

    // MARK: - Metrics Grid

    @ViewBuilder
    private func metricsSection(_ stats: DashboardStats) -> some View {
        SectionHeaderView(title: "Metricas del ET")

        LazyVGrid(columns: columns, spacing: AppSpacing.xs) {
            DashboardMetricCard(
                icon: "doc.text.fill",
                value: formattedInt(stats.totalArticles),
                label: "Total Articulos"
            )

            DashboardMetricCard(
                icon: "pencil.circle.fill",
                value: "\(String(format: "%.1f", stats.statsCards.modificadosPct))%",
                label: "Modificados",
                percentageChange: "\(formattedInt(stats.statsCards.modificados)) articulos"
            )

            DashboardMetricCard(
                icon: "link.circle.fill",
                value: "\(String(format: "%.1f", stats.statsCards.conNormasPct))%",
                label: "Con Normas",
                percentageChange: "\(formattedInt(stats.statsCards.conNormas)) articulos"
            )

            DashboardMetricCard(
                icon: "chart.bar.fill",
                value: formattedAvgComplexity(stats.complexityDistribution),
                label: "Complejidad Promedio"
            )
        }
    }

    // MARK: - Estado Distribution

    @ViewBuilder
    private func estadoSection(_ stats: DashboardStats) -> some View {
        SectionHeaderView(title: "Estado de Articulos")

        CardView {
            HStack(spacing: AppSpacing.sm) {
                estadoPill(
                    label: "Vigente",
                    count: stats.estadoDistribution.vigente,
                    color: ColorPalette.vigente
                )
                estadoPill(
                    label: "Modificado",
                    count: stats.estadoDistribution.modificado,
                    color: ColorPalette.modificado
                )
            }
            .frame(maxWidth: .infinity)
        }
    }

    @ViewBuilder
    private func estadoPill(label: String, count: Int, color: Color) -> some View {
        VStack(spacing: 4) {
            Text(formattedInt(count))
                .font(.system(size: 24, weight: .bold, design: .rounded))
                .foregroundStyle(color)
            Text(label)
                .font(AppTypography.caption)
                .foregroundStyle(Color.appMutedForeground)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, AppSpacing.xs)
        .background(color.opacity(0.08))
        .clipShape(RoundedRectangle(cornerRadius: AppRadius.card))
    }

    // MARK: - Libro Distribution (Horizontal Bar Chart)

    @ViewBuilder
    private func libroSection(_ stats: DashboardStats) -> some View {
        SectionHeaderView(title: "Distribucion por Libro")

        CardView {
            Chart(stats.libroDistribution) { item in
                BarMark(
                    x: .value("Articulos", item.value),
                    y: .value("Libro", shortLibroName(item.name))
                )
                .foregroundStyle(Color.appForeground.opacity(0.75))
                .cornerRadius(3)
                .annotation(position: .trailing, alignment: .leading, spacing: 4) {
                    Text("\(item.value)")
                        .font(AppTypography.caption)
                        .foregroundStyle(Color.appMutedForeground)
                }
            }
            .chartYAxis {
                AxisMarks { value in
                    AxisValueLabel()
                        .font(AppTypography.caption)
                        .foregroundStyle(Color.appMutedForeground)
                }
            }
            .chartXAxis(.hidden)
            .frame(height: CGFloat(stats.libroDistribution.count) * 40)
        }
    }

    // MARK: - Top 10 Modified

    @ViewBuilder
    private func topModifiedSection(_ stats: DashboardStats) -> some View {
        SectionHeaderView(title: "Top 10 Mas Modificados")

        CardView {
            VStack(spacing: 0) {
                ForEach(Array(stats.topModified.enumerated()), id: \.element.id) { index, article in
                    HStack(spacing: 12) {
                        Text("\(index + 1)")
                            .font(AppTypography.label)
                            .foregroundStyle(Color.appMutedForeground)
                            .frame(width: 20)

                        VStack(alignment: .leading, spacing: 2) {
                            Text(article.id)
                                .font(AppTypography.bodySmall)
                                .fontWeight(.semibold)
                                .foregroundStyle(Color.appForeground)
                            Text(article.titulo)
                                .font(AppTypography.caption)
                                .foregroundStyle(Color.appMutedForeground)
                                .lineLimit(1)
                        }

                        Spacer()

                        Text("\(article.count)")
                            .font(.system(size: 16, weight: .bold, design: .rounded))
                            .foregroundStyle(ColorPalette.modificado)
                    }
                    .padding(.vertical, 10)

                    if index < stats.topModified.count - 1 {
                        Divider()
                            .foregroundStyle(Color.appBorder)
                    }
                }
            }
        }
    }

    // MARK: - Reform Timeline (Line Chart)

    @ViewBuilder
    private func timelineSection(_ stats: DashboardStats) -> some View {
        SectionHeaderView(title: "Timeline de Reformas")

        CardView {
            Chart(stats.reformTimeline) { year in
                LineMark(
                    x: .value("Ano", year.year),
                    y: .value("Reformas", year.total)
                )
                .foregroundStyle(Color.appForeground)
                .interpolationMethod(.catmullRom)

                AreaMark(
                    x: .value("Ano", year.year),
                    y: .value("Reformas", year.total)
                )
                .foregroundStyle(
                    .linearGradient(
                        colors: [Color.appForeground.opacity(0.15), Color.appForeground.opacity(0.0)],
                        startPoint: .top,
                        endPoint: .bottom
                    )
                )
                .interpolationMethod(.catmullRom)
            }
            .chartXAxis {
                AxisMarks(values: .automatic(desiredCount: 6)) { value in
                    AxisValueLabel {
                        if let year = value.as(Int.self) {
                            Text("'\(String(format: "%02d", year % 100))")
                                .font(AppTypography.caption)
                                .foregroundStyle(Color.appMutedForeground)
                        }
                    }
                    AxisGridLine()
                        .foregroundStyle(Color.appBorder)
                }
            }
            .chartYAxis {
                AxisMarks(position: .leading) { _ in
                    AxisValueLabel()
                        .font(AppTypography.caption)
                        .foregroundStyle(Color.appMutedForeground)
                    AxisGridLine()
                        .foregroundStyle(Color.appBorder)
                }
            }
            .frame(height: 200)
        }
    }

    // MARK: - Complexity Distribution (Bar Chart)

    @ViewBuilder
    private func complexitySection(_ stats: DashboardStats) -> some View {
        SectionHeaderView(title: "Distribucion de Complejidad")

        CardView {
            Chart(stats.complexityDistribution) { item in
                BarMark(
                    x: .value("Score", item.score),
                    y: .value("Cantidad", item.count)
                )
                .foregroundStyle(complexityColor(score: item.score))
                .cornerRadius(3)
            }
            .chartXAxis {
                AxisMarks { value in
                    AxisValueLabel()
                        .font(AppTypography.caption)
                        .foregroundStyle(Color.appMutedForeground)
                }
            }
            .chartYAxis {
                AxisMarks(position: .leading) { _ in
                    AxisValueLabel()
                        .font(AppTypography.caption)
                        .foregroundStyle(Color.appMutedForeground)
                }
            }
            .frame(height: 180)
        }
    }

    // MARK: - Top Laws

    @ViewBuilder
    private func topLawsSection(_ stats: DashboardStats) -> some View {
        SectionHeaderView(title: "Leyes con Mayor Impacto")

        CardView {
            VStack(spacing: 0) {
                ForEach(Array(stats.topLaws.prefix(10).enumerated()), id: \.element.id) { index, law in
                    HStack {
                        Text(law.name)
                            .font(AppTypography.bodySmall)
                            .foregroundStyle(Color.appForeground)
                            .lineLimit(1)

                        Spacer()

                        Text("\(law.count)")
                            .font(AppTypography.bodySmall)
                            .fontWeight(.bold)
                            .foregroundStyle(Color.appMutedForeground)
                    }
                    .padding(.vertical, 8)

                    if index < min(stats.topLaws.count, 10) - 1 {
                        Divider()
                            .foregroundStyle(Color.appBorder)
                    }
                }
            }
        }

        // Bottom spacer for safe area
        Spacer()
            .frame(height: AppSpacing.md)
    }

    // MARK: - Helpers

    private func formattedInt(_ value: Int) -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .decimal
        formatter.groupingSeparator = ","
        return formatter.string(from: NSNumber(value: value)) ?? "\(value)"
    }

    private func formattedAvgComplexity(_ distribution: [DashboardStats.ScoreCount]) -> String {
        let totalCount = distribution.reduce(0) { $0 + $1.count }
        guard totalCount > 0 else { return "0.0" }
        let weightedSum = distribution.reduce(0.0) { $0 + Double($1.score) * Double($1.count) }
        let avg = weightedSum / Double(totalCount)
        return String(format: "%.1f", avg)
    }

    private func shortLibroName(_ name: String) -> String {
        // Shorten "Libro I - Renta" to "Libro I"
        if let range = name.range(of: " - ") {
            return String(name[name.startIndex..<range.lowerBound])
        }
        return name
    }

    private func complexityColor(score: Int) -> Color {
        switch score {
        case 0...2: return ColorPalette.vigente
        case 3...5: return ColorPalette.modificado
        default: return ColorPalette.derogado
        }
    }
}

#Preview {
    NavigationStack {
        DashboardView()
    }
}
