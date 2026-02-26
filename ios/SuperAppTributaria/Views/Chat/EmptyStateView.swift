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

                Text("Consulta el Estatuto Tributario, doctrina DIAN, jurisprudencia y más con inteligencia artificial.")
                    .font(AppTypography.bodySmall)
                    .foregroundStyle(Color.appMutedForeground)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, AppSpacing.md)
            }

            SuggestedQuestionsView(onQuestionTapped: onQuestionTapped)

            Spacer()
        }
    }
}

#Preview {
    EmptyStateView { _ in }
}
