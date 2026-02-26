import SwiftUI

struct StatusBanner: View {
    let status: HealthStatus
    let isConnected: Bool

    var body: some View {
        if !isConnected {
            bannerView(
                icon: "wifi.slash",
                message: "Sin conexión a internet",
                color: Color.appDestructive
            )
        } else if status == .degraded {
            bannerView(
                icon: "exclamationmark.triangle.fill",
                message: "Servicio con rendimiento reducido",
                color: .orange
            )
        } else if status == .unhealthy {
            bannerView(
                icon: "xmark.circle.fill",
                message: "Servicio temporalmente no disponible",
                color: Color.appDestructive
            )
        }
    }

    private func bannerView(icon: String, message: String, color: Color) -> some View {
        HStack(spacing: 8) {
            Image(systemName: icon)
                .font(.system(size: 14))
            Text(message)
                .font(AppTypography.bodySmall)
        }
        .foregroundStyle(.white)
        .frame(maxWidth: .infinity)
        .padding(.vertical, 8)
        .padding(.horizontal, AppSpacing.sm)
        .background(color)
        .accessibilityLabel(message)
    }
}
