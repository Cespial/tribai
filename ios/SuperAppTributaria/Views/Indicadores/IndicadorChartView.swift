import SwiftUI
import Charts

struct IndicadorChartView: View {
    let history: [IndicadorHistoryPoint]

    private var minValue: Double {
        let minVal = history.map(\.valor).min() ?? 0
        return max(0, minVal * 0.9)
    }

    private var maxValue: Double {
        let maxVal = history.map(\.valor).max() ?? 0
        return maxVal * 1.1
    }

    var body: some View {
        Chart {
            ForEach(history, id: \.periodo) { point in
                AreaMark(
                    x: .value("Periodo", point.periodo),
                    y: .value("Valor", point.valor)
                )
                .foregroundStyle(
                    LinearGradient(
                        gradient: Gradient(colors: [
                            Color.appForeground.opacity(0.15),
                            Color.appForeground.opacity(0.02)
                        ]),
                        startPoint: .top,
                        endPoint: .bottom
                    )
                )
                .interpolationMethod(.catmullRom)

                LineMark(
                    x: .value("Periodo", point.periodo),
                    y: .value("Valor", point.valor)
                )
                .foregroundStyle(Color.appForeground)
                .lineStyle(StrokeStyle(lineWidth: 2))
                .interpolationMethod(.catmullRom)

                PointMark(
                    x: .value("Periodo", point.periodo),
                    y: .value("Valor", point.valor)
                )
                .foregroundStyle(Color.appForeground)
                .symbolSize(20)
            }
        }
        .chartYScale(domain: minValue...maxValue)
        .chartXAxis {
            AxisMarks(values: .automatic) { _ in
                AxisGridLine()
                    .foregroundStyle(Color.appBorder)
                AxisValueLabel()
                    .font(AppTypography.caption)
                    .foregroundStyle(Color.appMutedForeground)
            }
        }
        .chartYAxis {
            AxisMarks(position: .leading, values: .automatic) { _ in
                AxisGridLine()
                    .foregroundStyle(Color.appBorder)
                AxisValueLabel()
                    .font(AppTypography.caption)
                    .foregroundStyle(Color.appMutedForeground)
            }
        }
        .frame(height: 220)
        .padding(.vertical, AppSpacing.xs)
    }
}
