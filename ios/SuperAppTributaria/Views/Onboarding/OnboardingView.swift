import SwiftUI

struct OnboardingView: View {
    @State private var currentPage = 0
    let onComplete: () -> Void

    private let pages: [(icon: String, title: String, description: String)] = [
        (
            "building.columns",
            "Bienvenido a SuperApp Tributaria",
            "La plataforma tributaria mas completa de Colombia. Todo el Estatuto Tributario, calculadoras fiscales y asistente IA en tu bolsillo."
        ),
        (
            "function",
            "Calculadoras Fiscales",
            "Mas de 30 calculadoras: renta, IVA, retencion, nomina, patrimonio, sanciones y mas. Resultados instantaneos con precision financiera."
        ),
        (
            "bubble.left.and.text.bubble.right",
            "Asistente IA Tributario",
            "Pregunta lo que necesites sobre tributaria colombiana. El asistente consulta el ET, doctrina DIAN y jurisprudencia para darte respuestas fundamentadas."
        ),
        (
            "calendar.badge.checkmark",
            "Calendario Fiscal 2026",
            "Nunca pierdas un vencimiento. Todas las obligaciones fiscales del ano con recordatorios personalizados."
        ),
    ]

    var body: some View {
        VStack(spacing: 0) {
            TabView(selection: $currentPage) {
                ForEach(Array(pages.enumerated()), id: \.offset) { index, page in
                    VStack(spacing: AppSpacing.sm) {
                        Spacer()

                        Image(systemName: page.icon)
                            .font(.system(size: 64))
                            .foregroundStyle(Color.appPrimary)
                            .padding(.bottom, AppSpacing.sm)

                        Text(page.title)
                            .font(.system(size: 24, weight: .bold))
                            .multilineTextAlignment(.center)
                            .foregroundStyle(Color.appForeground)
                            .padding(.horizontal, AppSpacing.md)

                        Text(page.description)
                            .font(AppTypography.bodyDefault)
                            .multilineTextAlignment(.center)
                            .foregroundStyle(Color.appMutedForeground)
                            .padding(.horizontal, AppSpacing.md)

                        Spacer()
                        Spacer()
                    }
                    .tag(index)
                }
            }
            .tabViewStyle(.page(indexDisplayMode: .always))

            // Bottom button
            Button {
                if currentPage < pages.count - 1 {
                    withAnimation { currentPage += 1 }
                } else {
                    onComplete()
                }
            } label: {
                Text(currentPage < pages.count - 1 ? "Siguiente" : "Comenzar")
                    .font(.system(size: 17, weight: .semibold))
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 16)
                    .background(Color.appPrimary)
                    .clipShape(RoundedRectangle(cornerRadius: AppRadius.button))
            }
            .padding(.horizontal, AppSpacing.sm)
            .padding(.bottom, AppSpacing.md)

            if currentPage < pages.count - 1 {
                Button("Saltar") {
                    onComplete()
                }
                .font(AppTypography.bodySmall)
                .foregroundStyle(Color.appMutedForeground)
                .padding(.bottom, AppSpacing.sm)
            }
        }
        .background(Color.appBackground)
    }
}
