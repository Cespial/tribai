import SwiftUI

struct GuiaFlowView: View {
    let guia: GuiaEducativa
    @State private var viewModel = GuiasViewModel()
    @State private var articleSlug: String?
    @Environment(\.openURL) private var openURL
    var onNavigateToCalculators: () -> Void = {}
    var onNavigateToMore: () -> Void = {}

    var body: some View {
        VStack(spacing: 0) {
            // Progress bar
            ProgressView(value: viewModel.progress)
                .tint(ColorPalette.vigente)
                .padding(.horizontal, AppSpacing.sm)
                .padding(.top, AppSpacing.xs)

            // Content
            ScrollView {
                if let node = viewModel.currentNode {
                    nodeContent(node)
                        .id(node.id)
                        .transition(.asymmetric(
                            insertion: .move(edge: .trailing).combined(with: .opacity),
                            removal: .move(edge: .leading).combined(with: .opacity)
                        ))
                        .padding(.horizontal, AppSpacing.sm)
                        .padding(.vertical, AppSpacing.sm)
                }
            }
        }
        .background(Color.appBackground)
        .navigationTitle(guia.titulo)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button {
                    withAnimation(.easeInOut(duration: 0.3)) {
                        viewModel.reset()
                    }
                } label: {
                    Image(systemName: "arrow.counterclockwise")
                        .font(.system(size: 15, weight: .medium))
                        .foregroundStyle(Color.appMutedForeground)
                }
            }
        }
        .navigationDestination(item: $articleSlug) { slug in
            ArticleDetailView(slug: slug)
        }
        .onAppear {
            viewModel.startGuia(guia)
        }
    }

    // MARK: - Node Content

    @ViewBuilder
    private func nodeContent(_ node: DecisionNode) -> some View {
        if node.esPregunta {
            preguntaContent(node)
        } else {
            resultadoContent(node)
        }
    }

    // MARK: - Pregunta Node

    @ViewBuilder
    private func preguntaContent(_ node: DecisionNode) -> some View {
        VStack(alignment: .leading, spacing: AppSpacing.sm) {
            // Step indicator
            Text("Paso \(viewModel.history.count + 1)")
                .font(AppTypography.label)
                .foregroundStyle(Color.appMutedForeground)

            // Question text
            Text(node.texto)
                .font(AppTypography.cardHeading)
                .foregroundStyle(Color.appForeground)
                .fixedSize(horizontal: false, vertical: true)

            // Ayuda rapida
            if let ayuda = node.ayudaRapida {
                DisclosureGroup {
                    Text(ayuda)
                        .font(AppTypography.bodySmall)
                        .foregroundStyle(Color.appMutedForeground)
                        .padding(.top, 4)
                } label: {
                    HStack(spacing: 6) {
                        Image(systemName: "lightbulb.fill")
                            .font(.system(size: 13))
                            .foregroundStyle(ColorPalette.modificado)
                        Text("Ayuda rapida")
                            .font(AppTypography.label)
                            .foregroundStyle(Color.appMutedForeground)
                    }
                }
                .tint(Color.appMutedForeground)
            }

            // Option buttons
            VStack(spacing: 12) {
                ForEach(Array(node.opciones.enumerated()), id: \.offset) { _, option in
                    Button {
                        withAnimation(.easeInOut(duration: 0.3)) {
                            viewModel.selectOption(nextNodeId: option.nextNodeId)
                        }
                    } label: {
                        HStack {
                            Text(option.label)
                                .font(AppTypography.bodyDefault)
                                .fontWeight(.medium)
                                .foregroundStyle(Color.appPrimaryForeground)
                            Spacer()
                            Image(systemName: "arrow.right")
                                .font(.system(size: 14, weight: .medium))
                                .foregroundStyle(Color.appPrimaryForeground.opacity(0.7))
                        }
                        .padding(.horizontal, AppSpacing.sm)
                        .padding(.vertical, 14)
                        .background(Color.appPrimary)
                        .clipShape(RoundedRectangle(cornerRadius: AppRadius.card))
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(.top, AppSpacing.xs)

            // Back button
            if viewModel.canGoBack {
                Button {
                    withAnimation(.easeInOut(duration: 0.3)) {
                        viewModel.goBack()
                    }
                } label: {
                    HStack(spacing: 6) {
                        Image(systemName: "chevron.left")
                            .font(.system(size: 13, weight: .medium))
                        Text("Anterior")
                            .font(AppTypography.bodySmall)
                            .fontWeight(.medium)
                    }
                    .foregroundStyle(Color.appMutedForeground)
                }
                .buttonStyle(.plain)
                .padding(.top, AppSpacing.xs)
            }
        }
    }

    // MARK: - Resultado Node

    @ViewBuilder
    private func resultadoContent(_ node: DecisionNode) -> some View {
        VStack(alignment: .leading, spacing: AppSpacing.sm) {
            // Result icon
            Image(systemName: "checkmark.circle.fill")
                .font(.system(size: 40))
                .foregroundStyle(ColorPalette.vigente)

            // Result title
            Text(node.texto)
                .font(AppTypography.pageHeading)
                .foregroundStyle(Color.appForeground)
                .fixedSize(horizontal: false, vertical: true)

            // Recomendacion
            if let recomendacion = node.recomendacion {
                CardView {
                    VStack(alignment: .leading, spacing: AppSpacing.xs) {
                        HStack(spacing: 6) {
                            Image(systemName: "info.circle.fill")
                                .font(.system(size: 15))
                                .foregroundStyle(ColorPalette.vigente)
                            Text("Recomendacion")
                                .font(AppTypography.label)
                                .foregroundStyle(Color.appMutedForeground)
                        }

                        Text(recomendacion)
                            .font(AppTypography.bodyDefault)
                            .foregroundStyle(Color.appForeground)
                            .fixedSize(horizontal: false, vertical: true)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                }
            }

            // Enlaces
            if !node.enlaces.isEmpty {
                VStack(spacing: 10) {
                    ForEach(Array(node.enlaces.enumerated()), id: \.offset) { _, enlace in
                        Button {
                            handleEnlace(enlace.href)
                        } label: {
                            HStack {
                                Image(systemName: "arrow.up.right.square")
                                    .font(.system(size: 14))
                                Text(enlace.label)
                                    .font(AppTypography.bodySmall)
                                    .fontWeight(.medium)
                                Spacer()
                            }
                            .foregroundStyle(Color.appPrimary)
                            .padding(.horizontal, AppSpacing.sm)
                            .padding(.vertical, 12)
                            .background(Color.appMuted)
                            .clipShape(RoundedRectangle(cornerRadius: AppRadius.card))
                            .overlay(
                                RoundedRectangle(cornerRadius: AppRadius.card)
                                    .stroke(Color.appBorder, lineWidth: 1)
                            )
                        }
                        .buttonStyle(.plain)
                    }
                }
            }

            // Restart button
            Button {
                withAnimation(.easeInOut(duration: 0.3)) {
                    viewModel.reset()
                }
            } label: {
                HStack {
                    Image(systemName: "arrow.counterclockwise")
                        .font(.system(size: 14, weight: .medium))
                    Text("Reiniciar guia")
                        .font(AppTypography.bodyDefault)
                        .fontWeight(.medium)
                }
                .foregroundStyle(Color.appPrimaryForeground)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 14)
                .background(Color.appPrimary)
                .clipShape(RoundedRectangle(cornerRadius: AppRadius.card))
            }
            .buttonStyle(.plain)
            .padding(.top, AppSpacing.xs)

            // Back to list
            if viewModel.canGoBack {
                Button {
                    withAnimation(.easeInOut(duration: 0.3)) {
                        viewModel.goBack()
                    }
                } label: {
                    HStack(spacing: 6) {
                        Image(systemName: "chevron.left")
                            .font(.system(size: 13, weight: .medium))
                        Text("Anterior")
                            .font(AppTypography.bodySmall)
                            .fontWeight(.medium)
                    }
                    .foregroundStyle(Color.appMutedForeground)
                }
                .buttonStyle(.plain)
            }
        }
    }

    // MARK: - Enlace Navigation

    private func handleEnlace(_ href: String) {
        if href.contains("/explorador") || href.contains("art=") {
            // Parse article slug from href like /explorador?art=240
            if let range = href.range(of: "art=") {
                let artNumber = String(href[range.upperBound...])
                    .trimmingCharacters(in: .whitespaces)
                    .components(separatedBy: "&").first ?? ""
                articleSlug = "articulo-\(artNumber)"
            }
        } else if href.contains("/calculadoras") {
            onNavigateToCalculators()
        } else if href.contains("/calendario") {
            onNavigateToMore()
        }
    }
}

#Preview {
    NavigationStack {
        GuiaFlowView(guia: GuiasData.guias[0])
    }
}
