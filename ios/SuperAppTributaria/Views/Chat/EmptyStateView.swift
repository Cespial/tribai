import SwiftUI

struct EmptyStateView: View {
    let onQuestionTapped: (String) -> Void

    var body: some View {
        VStack(spacing: AppSpacing.md) {
            Spacer()

            VStack(spacing: AppSpacing.sm) {
                Image(systemName: "building.columns")
                    .font(.system(size: 48))
                    .foregroundStyle(Color.appMutedForeground)

                Text("Asistente Tributario Colombia")
                    .font(AppTypography.sectionHeading)
                    .foregroundStyle(Color.appForeground)
                    .multilineTextAlignment(.center)

                Text("Consulta el Estatuto Tributario, doctrina DIAN, jurisprudencia y mas con inteligencia artificial.")
                    .font(AppTypography.bodySmall)
                    .foregroundStyle(Color.appMutedForeground)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, AppSpacing.md)
            }

            AIDisclaimerBanner()

            SuggestedQuestionsView(onQuestionTapped: onQuestionTapped)

            Spacer()
        }
    }
}

// MARK: - AI Disclaimer Banner

struct AIDisclaimerBanner: View {
    var body: some View {
        HStack(spacing: 8) {
            Image(systemName: "info.circle")
                .font(.system(size: 14))
            Text("Este asistente utiliza inteligencia artificial generativa. Las respuestas son informativas y no constituyen asesoria tributaria profesional. Verifique siempre con un contador publico certificado.")
                .font(AppTypography.caption)
        }
        .foregroundStyle(Color.appMutedForeground)
        .padding(12)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color.appMuted.opacity(0.6))
        .clipShape(RoundedRectangle(cornerRadius: AppRadius.card))
        .padding(.horizontal, AppSpacing.sm)
    }
}

#Preview {
    EmptyStateView { _ in }
}
