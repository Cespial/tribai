import SwiftUI

struct DoctrinaDetailView: View {

    let doctrina: DoctrinaCurada

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: AppSpacing.md) {

                // MARK: - Header
                VStack(alignment: .leading, spacing: AppSpacing.xs) {
                    Text(doctrina.numero)
                        .font(AppTypography.label)
                        .foregroundStyle(Color.appMutedForeground)

                    Text(doctrina.fecha)
                        .font(AppTypography.caption)
                        .foregroundStyle(Color.appMutedForeground)

                    HStack(spacing: AppSpacing.xs) {
                        StatusBadgeView.docTipo(doctrina.tipoDocumento)
                        StatusBadgeView.vigente(doctrina.vigente)
                    }
                }
                .padding(.horizontal, AppSpacing.sm)

                // MARK: - Tema
                VStack(alignment: .leading, spacing: AppSpacing.xs) {
                    SectionHeaderView(title: "Tema")
                    Text(doctrina.tema)
                        .font(AppTypography.bodyDefault)
                        .foregroundStyle(Color.appForeground)
                }
                .padding(.horizontal, AppSpacing.sm)

                // MARK: - Pregunta
                VStack(alignment: .leading, spacing: AppSpacing.xs) {
                    SectionHeaderView(title: "Pregunta")
                    Text(doctrina.pregunta)
                        .font(AppTypography.bodyDefault)
                        .foregroundStyle(Color.appForeground)
                }
                .padding(.horizontal, AppSpacing.sm)

                // MARK: - Sintesis
                VStack(alignment: .leading, spacing: AppSpacing.xs) {
                    SectionHeaderView(title: "Sintesis")
                    Text(doctrina.sintesis)
                        .font(AppTypography.bodyDefault)
                        .foregroundStyle(Color.appForeground)
                }
                .padding(.horizontal, AppSpacing.sm)

                // MARK: - Conclusion Clave (highlighted card)
                VStack(alignment: .leading, spacing: AppSpacing.xs) {
                    SectionHeaderView(title: "Conclusion Clave")
                    CardView {
                        Text(doctrina.conclusionClave)
                            .font(AppTypography.bodyDefault)
                            .foregroundStyle(Color.appForeground)
                            .frame(maxWidth: .infinity, alignment: .leading)
                    }
                }
                .padding(.horizontal, AppSpacing.sm)

                // MARK: - Descriptores
                if !doctrina.descriptores.isEmpty {
                    VStack(alignment: .leading, spacing: AppSpacing.xs) {
                        SectionHeaderView(title: "Descriptores")
                        DescriptoresFlowView(descriptores: doctrina.descriptores)
                    }
                    .padding(.horizontal, AppSpacing.sm)
                }

                // MARK: - Articulos del ET
                if !doctrina.articulosET.isEmpty {
                    VStack(alignment: .leading, spacing: AppSpacing.xs) {
                        SectionHeaderView(title: "Articulos del ET")
                        ForEach(doctrina.articulosET, id: \.self) { articulo in
                            HStack(spacing: AppSpacing.xs) {
                                Image(systemName: "doc.text")
                                    .font(.system(size: 14))
                                    .foregroundStyle(Color.appMutedForeground)
                                Text("Art. \(articulo)")
                                    .font(AppTypography.bodySmall)
                                    .foregroundStyle(Color.appForeground)
                            }
                        }
                    }
                    .padding(.horizontal, AppSpacing.sm)
                }
            }
            .padding(.vertical, AppSpacing.sm)
        }
        .background(Color.appBackground)
        .navigationTitle(doctrina.numero)
        .navigationBarTitleDisplayMode(.inline)
    }
}

// MARK: - Flow Layout for Descriptores

private struct DescriptoresFlowView: View {
    let descriptores: [String]

    @State private var totalHeight: CGFloat = .zero

    var body: some View {
        GeometryReader { geometry in
            generateContent(in: geometry)
        }
        .frame(height: totalHeight)
    }

    private func generateContent(in geometry: GeometryProxy) -> some View {
        nonisolated(unsafe) var width: CGFloat = 0
        nonisolated(unsafe) var height: CGFloat = 0
        let containerWidth = geometry.size.width

        return ZStack(alignment: .topLeading) {
            ForEach(descriptores, id: \.self) { descriptor in
                DescriptorPillView(text: descriptor)
                    .padding(.trailing, 6)
                    .padding(.bottom, 6)
                    .alignmentGuide(.leading) { dimension in
                        if abs(width - dimension.width) > containerWidth {
                            width = 0
                            height -= dimension.height
                        }
                        let result = width
                        if descriptor == descriptores.last {
                            width = 0
                        } else {
                            width -= dimension.width
                        }
                        return result
                    }
                    .alignmentGuide(.top) { _ in
                        let result = height
                        if descriptor == descriptores.last {
                            height = 0
                        }
                        return result
                    }
            }
        }
        .background(viewHeightReader($totalHeight))
    }

    private func viewHeightReader(_ binding: Binding<CGFloat>) -> some View {
        GeometryReader { geometry -> Color in
            DispatchQueue.main.async {
                binding.wrappedValue = geometry.size.height
            }
            return Color.clear
        }
    }
}

private struct DescriptorPillView: View {
    let text: String

    var body: some View {
        Text(text)
            .font(AppTypography.caption)
            .foregroundStyle(Color.appMutedForeground)
            .padding(.horizontal, 10)
            .padding(.vertical, 5)
            .background(Color.appMuted)
            .clipShape(Capsule())
    }
}

#Preview {
    NavigationStack {
        DoctrinaDetailView(doctrina: DoctrinaCuradaData.items[0])
    }
}
