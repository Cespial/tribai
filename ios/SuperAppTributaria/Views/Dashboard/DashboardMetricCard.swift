import SwiftUI

struct DashboardMetricCard: View {
    let icon: String
    let value: String
    let label: String
    var percentageChange: String?

    var body: some View {
        CardView {
            VStack(alignment: .leading, spacing: AppSpacing.xs) {
                // Icon
                Image(systemName: icon)
                    .font(.system(size: 20))
                    .foregroundStyle(Color.appMutedForeground)

                // Value
                Text(value)
                    .font(AppTypography.metricValue)
                    .foregroundStyle(Color.appForeground)
                    .minimumScaleFactor(0.7)
                    .lineLimit(1)

                // Label
                Text(label)
                    .font(AppTypography.caption)
                    .foregroundStyle(Color.appMutedForeground)
                    .lineLimit(2)
                    .fixedSize(horizontal: false, vertical: true)

                // Optional percentage
                if let pct = percentageChange {
                    Text(pct)
                        .font(AppTypography.caption)
                        .fontWeight(.medium)
                        .foregroundStyle(ColorPalette.modificado)
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
        }
    }
}

#Preview {
    HStack {
        DashboardMetricCard(
            icon: "doc.text",
            value: "1,294",
            label: "Total Articulos",
            percentageChange: nil
        )
        DashboardMetricCard(
            icon: "pencil.circle",
            value: "64.9%",
            label: "Modificados",
            percentageChange: "840 articulos"
        )
    }
    .padding()
}
