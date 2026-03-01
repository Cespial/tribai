import SwiftUI

struct ArticleDetailView: View {
    let slug: String
    @State private var viewModel = ArticleDetailViewModel()

    var body: some View {
        Group {
            if viewModel.isLoading {
                VStack(spacing: AppSpacing.sm) {
                    ProgressView()
                    Text("Cargando articulo...")
                        .font(AppTypography.bodySmall)
                        .foregroundStyle(Color.appMutedForeground)
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else if let error = viewModel.error {
                VStack(spacing: AppSpacing.sm) {
                    Image(systemName: "wifi.exclamationmark")
                        .font(.system(size: 40))
                        .foregroundStyle(Color.appDestructive)
                    Text("Error al cargar")
                        .font(AppTypography.cardHeading)
                        .foregroundStyle(Color.appForeground)
                    Text(error)
                        .font(AppTypography.bodySmall)
                        .foregroundStyle(Color.appMutedForeground)
                        .multilineTextAlignment(.center)
                    Button("Reintentar") {
                        Task { await viewModel.loadArticle(slug: slug) }
                    }
                    .buttonStyle(.bordered)
                }
                .padding(AppSpacing.md)
                .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else if let article = viewModel.article {
                articleContent(article)
            }
        }
        .background(Color.appBackground)
        .navigationTitle(viewModel.article?.idArticulo ?? "Art. \(slug)")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button {
                    BookmarkService.shared.toggleArticleBookmark(slug)
                } label: {
                    Image(systemName: BookmarkService.shared.isArticleBookmarked(slug) ? "bookmark.fill" : "bookmark")
                        .foregroundStyle(Color.appForeground)
                }
            }
        }
        .navigationDestination(for: String.self) { ref in
            ArticleDetailView(slug: "articulo-\(ref)")
        }
        .task {
            if viewModel.article == nil {
                await viewModel.loadArticle(slug: slug)
            }
        }
    }

    @ViewBuilder
    private func articleContent(_ article: ArticleDetail) -> some View {
        VStack(spacing: 0) {
            // Header
            articleHeader(article)

            // Tab picker
            Picker("", selection: $viewModel.selectedTab) {
                ForEach(ArticleDetailViewModel.Tab.allCases, id: \.self) { tab in
                    Text(tab.rawValue).tag(tab)
                }
            }
            .pickerStyle(.segmented)
            .padding(.horizontal, AppSpacing.sm)
            .padding(.vertical, AppSpacing.xs)

            Divider()

            // Tab content
            ScrollView {
                switch viewModel.selectedTab {
                case .contenido:
                    contenidoTab(article)
                case .modificaciones:
                    modificacionesTab(article)
                case .referencias:
                    referenciasTab(article)
                case .doctrina:
                    doctrinaTab(article)
                }
            }
        }
    }

    private func articleHeader(_ article: ArticleDetail) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(article.idArticulo)
                    .font(AppTypography.cardHeading)
                    .foregroundStyle(Color.appForeground)

                estadoBadge(article.estado)

                Spacer()
            }

            Text(article.tituloCorto)
                .font(AppTypography.bodyDefault)
                .foregroundStyle(Color.appForeground)

            HStack(spacing: 12) {
                libroBadge(article.libro)

                if let year = article.ultimaModificacionYear {
                    Label("Mod. \(String(year))", systemImage: "calendar")
                        .font(AppTypography.caption)
                        .foregroundStyle(Color.appMutedForeground)
                }
            }
        }
        .padding(AppSpacing.sm)
        .background(Color.appCard)
    }

    // MARK: - Tab: Contenido

    private func contenidoTab(_ article: ArticleDetail) -> some View {
        VStack(alignment: .leading, spacing: AppSpacing.sm) {
            Text(article.contenidoTexto)
                .font(AppTypography.bodyDefault)
                .foregroundStyle(Color.appForeground)
                .textSelection(.enabled)

            if !article.concordancias.isEmpty {
                Divider()
                Text("Concordancias")
                    .font(AppTypography.label)
                    .foregroundStyle(Color.appMutedForeground)
                Text(article.concordancias)
                    .font(AppTypography.bodySmall)
                    .foregroundStyle(Color.appForeground)
            }

            if !article.notasEditoriales.isEmpty {
                Divider()
                Text("Notas Editoriales")
                    .font(AppTypography.label)
                    .foregroundStyle(Color.appMutedForeground)
                Text(article.notasEditoriales)
                    .font(AppTypography.bodySmall)
                    .foregroundStyle(Color.appForeground)
            }
        }
        .padding(AppSpacing.sm)
    }

    // MARK: - Tab: Modificaciones

    private func modificacionesTab(_ article: ArticleDetail) -> some View {
        VStack(alignment: .leading, spacing: AppSpacing.sm) {
            if article.modificacionesParsed.isEmpty {
                emptyTabView(icon: "clock", message: "Sin modificaciones registradas")
            } else {
                ModificationTimelineView(modifications: article.modificacionesParsed)
            }

            if !article.textoDerogado.isEmpty {
                Divider()
                Text("Texto Derogado")
                    .font(AppTypography.label)
                    .foregroundStyle(Color.appMutedForeground)
                    .padding(.horizontal, AppSpacing.sm)

                ForEach(article.textoDerogado, id: \.self) { texto in
                    Text(texto)
                        .font(AppTypography.bodySmall)
                        .foregroundStyle(Color.appForeground)
                        .padding(.horizontal, AppSpacing.sm)
                }
            }

            if !article.modificacionesRaw.isEmpty {
                Divider()
                Text("Historial Completo")
                    .font(AppTypography.label)
                    .foregroundStyle(Color.appMutedForeground)
                    .padding(.horizontal, AppSpacing.sm)
                Text(article.modificacionesRaw)
                    .font(AppTypography.caption)
                    .foregroundStyle(Color.appMutedForeground)
                    .padding(.horizontal, AppSpacing.sm)
            }
        }
        .padding(.vertical, AppSpacing.sm)
    }

    // MARK: - Tab: Referencias

    private func referenciasTab(_ article: ArticleDetail) -> some View {
        VStack(alignment: .leading, spacing: AppSpacing.sm) {
            if !article.crossReferences.isEmpty {
                Text("Referencias cruzadas (\(article.crossReferences.count))")
                    .font(AppTypography.label)
                    .foregroundStyle(Color.appMutedForeground)
                    .padding(.horizontal, AppSpacing.sm)

                ForEach(article.crossReferences, id: \.self) { ref in
                    NavigationLink(value: ref) {
                        HStack {
                            Image(systemName: "arrow.right.circle")
                                .font(.system(size: 14))
                                .foregroundStyle(Color.appPrimary)
                            Text("Art. \(ref)")
                                .font(AppTypography.bodySmall)
                                .foregroundStyle(Color.appPrimary)
                            Spacer()
                            Image(systemName: "chevron.right")
                                .font(.system(size: 12))
                                .foregroundStyle(Color.appMutedForeground)
                        }
                        .padding(.horizontal, AppSpacing.sm)
                        .padding(.vertical, 6)
                    }
                    .buttonStyle(.plain)
                }
            }

            if !article.referencedBy.isEmpty {
                if !article.crossReferences.isEmpty { Divider() }

                Text("Referenciado por (\(article.referencedBy.count))")
                    .font(AppTypography.label)
                    .foregroundStyle(Color.appMutedForeground)
                    .padding(.horizontal, AppSpacing.sm)

                ForEach(article.referencedBy, id: \.self) { ref in
                    NavigationLink(value: ref) {
                        HStack {
                            Image(systemName: "arrow.left.circle")
                                .font(.system(size: 14))
                                .foregroundStyle(Color.appMutedForeground)
                            Text("Art. \(ref)")
                                .font(AppTypography.bodySmall)
                                .foregroundStyle(Color.appPrimary)
                            Spacer()
                            Image(systemName: "chevron.right")
                                .font(.system(size: 12))
                                .foregroundStyle(Color.appMutedForeground)
                        }
                        .padding(.horizontal, AppSpacing.sm)
                        .padding(.vertical, 6)
                    }
                    .buttonStyle(.plain)
                }
            }

            if article.crossReferences.isEmpty && article.referencedBy.isEmpty {
                emptyTabView(icon: "arrow.triangle.branch", message: "Sin referencias cruzadas")
            }
        }
        .padding(.vertical, AppSpacing.sm)
    }

    // MARK: - Tab: Doctrina

    private func doctrinaTab(_ article: ArticleDetail) -> some View {
        VStack(alignment: .leading, spacing: AppSpacing.sm) {
            if !article.doctrinaVinculada.isEmpty {
                Text("Doctrina DIAN (\(article.doctrinaVinculada.count))")
                    .font(AppTypography.label)
                    .foregroundStyle(Color.appMutedForeground)
                    .padding(.horizontal, AppSpacing.sm)

                ForEach(article.doctrinaVinculada) { item in
                    CardView {
                        VStack(alignment: .leading, spacing: 4) {
                            HStack {
                                Text("\(item.tipo.capitalized) \(item.numero)")
                                    .font(AppTypography.bodySmall)
                                    .foregroundStyle(Color.appForeground)
                                Spacer()
                                Text(item.fecha)
                                    .font(AppTypography.caption)
                                    .foregroundStyle(Color.appMutedForeground)
                            }
                            if !item.tema.isEmpty {
                                Text(item.tema.decodingHTMLEntities)
                                    .font(AppTypography.caption)
                                    .foregroundStyle(Color.appMutedForeground)
                                    .lineLimit(3)
                            }
                        }
                    }
                    .padding(.horizontal, AppSpacing.sm)
                }
            }

            if !article.jurisprudenciaVinculada.isEmpty {
                if !article.doctrinaVinculada.isEmpty { Divider() }

                Text("Jurisprudencia (\(article.jurisprudenciaVinculada.count))")
                    .font(AppTypography.label)
                    .foregroundStyle(Color.appMutedForeground)
                    .padding(.horizontal, AppSpacing.sm)

                ForEach(article.jurisprudenciaVinculada) { item in
                    CardView {
                        VStack(alignment: .leading, spacing: 4) {
                            HStack {
                                Text("Sentencia \(item.tipo)-\(item.numero)/\(String(item.year))")
                                    .font(AppTypography.bodySmall)
                                    .foregroundStyle(Color.appForeground)
                                Spacer()
                                Text(item.corte.capitalized)
                                    .font(AppTypography.caption)
                                    .foregroundStyle(Color.appMutedForeground)
                            }
                            if let decision = item.decision {
                                Text(decision.capitalized)
                                    .font(.system(size: 10, weight: .medium))
                                    .foregroundStyle(decisionColor(decision))
                                    .padding(.horizontal, 6)
                                    .padding(.vertical, 2)
                                    .background(decisionColor(decision).opacity(0.12))
                                    .clipShape(Capsule())
                            }
                        }
                    }
                    .padding(.horizontal, AppSpacing.sm)
                }
            }

            if article.doctrinaVinculada.isEmpty && article.jurisprudenciaVinculada.isEmpty {
                emptyTabView(icon: "books.vertical", message: "Sin doctrina o jurisprudencia vinculada")
            }
        }
        .padding(.vertical, AppSpacing.sm)
    }

    // MARK: - Helpers

    private func estadoBadge(_ estado: String) -> some View {
        Text(estado.capitalized)
            .font(.system(size: 10, weight: .medium))
            .foregroundStyle(estado == "modificado" ? Color(hex: 0x0F0E0D) : .white)
            .padding(.horizontal, 6)
            .padding(.vertical, 2)
            .background(estadoColor(estado))
            .clipShape(Capsule())
    }

    private func estadoColor(_ estado: String) -> Color {
        switch estado {
        case "vigente": return ColorPalette.vigente
        case "modificado": return ColorPalette.modificado
        default: return ColorPalette.derogado
        }
    }

    private func libroBadge(_ libro: String) -> some View {
        let color = LibroColor.color(for: libro)
        return Text(libro)
            .font(AppTypography.caption)
            .foregroundStyle(color)
            .padding(.horizontal, 6)
            .padding(.vertical, 2)
            .background(color.opacity(0.12))
            .clipShape(Capsule())
    }

    private func decisionColor(_ decision: String) -> Color {
        let lower = decision.lowercased()
        if lower == "exequible" {
            return ColorPalette.vigente
        } else if lower == "inhibitoria" || lower.contains("condicionada") {
            return ColorPalette.modificado
        } else {
            return Color.appMutedForeground
        }
    }

    private func emptyTabView(icon: String, message: String) -> some View {
        VStack(spacing: AppSpacing.xs) {
            Image(systemName: icon)
                .font(.system(size: 32))
                .foregroundStyle(Color.appMutedForeground)
            Text(message)
                .font(AppTypography.bodySmall)
                .foregroundStyle(Color.appMutedForeground)
        }
        .frame(maxWidth: .infinity)
        .padding(AppSpacing.md)
    }
}
