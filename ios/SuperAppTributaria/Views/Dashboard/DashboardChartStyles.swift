import SwiftUI
import Charts

// MARK: - Chart Style Helpers for Dashboard

/// Provides consistent chart styling across all Dashboard charts.
enum DashboardChartStyles {

    /// Standard chart height for full-width charts.
    static let standardHeight: CGFloat = 200

    /// Compact chart height for smaller inline charts.
    static let compactHeight: CGFloat = 150

    /// Colors used for pie/donut segments or bar series.
    static let seriesColors: [Color] = [
        Color.appForeground.opacity(0.85),
        ColorPalette.vigente,
        ColorPalette.modificado,
        Color.appMutedForeground,
        ColorPalette.derogado,
    ]

    /// Returns a gradient suitable for area marks below a line chart.
    static func areaGradient(for color: Color = Color.appForeground) -> LinearGradient {
        LinearGradient(
            colors: [color.opacity(0.15), color.opacity(0.0)],
            startPoint: .top,
            endPoint: .bottom
        )
    }
}

// MARK: - Stat Summary Row

/// A reusable row for displaying a stat label and value inline,
/// used in summary lists within the dashboard.
struct DashboardStatRow: View {
    let label: String
    let value: String
    var valueColor: Color = Color.appForeground

    var body: some View {
        HStack {
            Text(label)
                .font(AppTypography.bodySmall)
                .foregroundStyle(Color.appMutedForeground)
            Spacer()
            Text(value)
                .font(AppTypography.bodySmall)
                .fontWeight(.semibold)
                .foregroundStyle(valueColor)
        }
    }
}

// MARK: - Donut Segment for Estado

/// A small donut / ring chart segment view for displaying estado distribution
/// as a visual summary (used inline in metric cards or headers).
struct EstadoDonutView: View {
    let vigente: Int
    let modificado: Int

    private var total: Double {
        Double(vigente + modificado)
    }

    private var vigenteAngle: Double {
        guard total > 0 else { return 0 }
        return (Double(vigente) / total) * 360
    }

    var body: some View {
        ZStack {
            Circle()
                .trim(from: 0, to: CGFloat(Double(vigente) / max(total, 1)))
                .stroke(ColorPalette.vigente, style: StrokeStyle(lineWidth: 6, lineCap: .round))
                .rotationEffect(.degrees(-90))

            Circle()
                .trim(from: CGFloat(Double(vigente) / max(total, 1)), to: 1.0)
                .stroke(ColorPalette.modificado, style: StrokeStyle(lineWidth: 6, lineCap: .round))
                .rotationEffect(.degrees(-90))
        }
    }
}

#Preview("Stat Row") {
    VStack {
        DashboardStatRow(label: "Total Articulos", value: "1,294")
        DashboardStatRow(label: "Modificados", value: "64.9%", valueColor: ColorPalette.modificado)
    }
    .padding()
}

#Preview("Donut") {
    EstadoDonutView(vigente: 438, modificado: 856)
        .frame(width: 60, height: 60)
        .padding()
}
