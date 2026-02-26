import SwiftUI

struct SuggestedQuestionsView: View {
    let onQuestionTapped: (String) -> Void

    private let columns = [
        GridItem(.flexible(), spacing: AppSpacing.xs),
        GridItem(.flexible(), spacing: AppSpacing.xs),
    ]

    var body: some View {
        LazyVGrid(columns: columns, spacing: AppSpacing.xs) {
            ForEach(AppConstants.suggestedQuestions, id: \.self) { question in
                Button {
                    onQuestionTapped(question)
                } label: {
                    Text(question)
                        .font(AppTypography.bodySmall)
                        .foregroundStyle(Color.appForeground)
                        .multilineTextAlignment(.leading)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(AppSpacing.sm)
                        .background(Color.appMuted)
                        .clipShape(RoundedRectangle(cornerRadius: AppRadius.card))
                        .overlay(
                            RoundedRectangle(cornerRadius: AppRadius.card)
                                .stroke(Color.appBorder, lineWidth: 1)
                        )
                }
                .buttonStyle(.plain)
                .accessibilityLabel("Pregunta sugerida: \(question)")
            }
        }
        .padding(.horizontal, AppSpacing.sm)
    }
}

#Preview {
    SuggestedQuestionsView { _ in }
}
