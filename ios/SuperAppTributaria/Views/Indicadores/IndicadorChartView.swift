import SwiftUI
import Charts

struct IndicadorChartView: View {
    let history: [IndicadorHistoryPoint]

    private var chartDomain: ClosedRange<Double> {
        let minVal = max(0, (history.map(\.valor).min() ?? 0) * 0.9)
        let maxVal = (history.map(\.valor).max() ?? 0) * 1.1
        guard maxVal > minVal else {
            return (minVal - 1)...(maxVal + 1)
        }
        return minVal...maxVal
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
        .chartYScale(domain: chartDomain)
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
