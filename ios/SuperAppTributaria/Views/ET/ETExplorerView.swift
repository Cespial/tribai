import SwiftUI

struct ETExplorerView: View {
    @State private var viewModel = ETExplorerViewModel()

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                if viewModel.isLoading {
                    Spacer()
                    ProgressView()
                    Text("Cargando indice...")
                        .font(AppTypography.bodySmall)
                        .foregroundStyle(Color.appMutedForeground)
                        .padding(.top, AppSpacing.xs)
                    Spacer()
                } else {
                    // Search bar
                    SearchBarView(
                        text: $viewModel.searchText,
                        placeholder: "Buscar articulos..."
                    )
                    .padding(.horizontal, AppSpacing.sm)
                    .padding(.vertical, AppSpacing.xs)

                    // Libro chips
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: AppSpacing.xs) {
                            if let facets = viewModel.facets {
                                ForEach(facets.libros) { libro in
                                    FilterChipView(
                                        title: libroShortName(libro.label),
                                        isSelected: viewModel.selectedLibro == libro.key
                                    ) {
                                        viewModel.setLibro(libro.key)
                                    }
                                }
                            }
                        }
                        .padding(.horizontal, AppSpacing.sm)
                    }
                    .padding(.bottom, 4)

                    // Estado chips
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: AppSpacing.xs) {
                            if let facets = viewModel.facets {
                                ForEach(facets.estados) { estado in
                                    FilterChipView(
                                        title: estado.label.capitalized,
                                        isSelected: viewModel.selectedEstado == estado.key
                                    ) {
                                        viewModel.setEstado(estado.key)
                                    }
                                }
                            }

                            if viewModel.activeFilterCount > 0 || !viewModel.searchText.isEmpty {
                                Button {
                                    viewModel.clearAll()
                                    Haptics.send()
                                } label: {
                                    Text("Limpiar")
                                        .font(AppTypography.label)
                                        .foregroundStyle(Color.appDestructive)
                                }
                                .buttonStyle(.plain)
                            }
                        }
                        .padding(.horizontal, AppSpacing.sm)
                    }
                    .padding(.bottom, AppSpacing.xs)

                    // Header with count and filter badge
                    HStack {
                        Text("\(viewModel.totalFilteredCount) articulos")
                            .font(AppTypography.bodySmall)
                            .foregroundStyle(Color.appMutedForeground)

                        Spacer()

                        Button {
                            viewModel.showingFilterSheet = true
                            Haptics.send()
                        } label: {
                            HStack(spacing: 4) {
                                Image(systemName: "line.3.horizontal.decrease")
                                Text("Filtros")
                                if viewModel.activeFilterCount > 0 {
                                    Text("\(viewModel.activeFilterCount)")
                                        .font(AppTypography.caption)
                                        .foregroundStyle(Color.appPrimaryForeground)
                                        .padding(.horizontal, 6)
                                        .padding(.vertical, 2)
                                        .background(Color.appPrimary)
                                        .clipShape(Capsule())
                                }
                            }
                            .font(AppTypography.label)
                            .foregroundStyle(Color.appForeground)
                        }
                        .buttonStyle(.plain)
                    }
                    .padding(.horizontal, AppSpacing.sm)
                    .padding(.bottom, AppSpacing.xs)

                    Divider()

                    // Article list
                    if viewModel.displayedArticles.isEmpty {
                        if !viewModel.searchText.isEmpty {
                            EmptySearchView(query: viewModel.searchText)
                                .frame(maxHeight: .infinity)
                        } else if viewModel.activeFilterCount > 0 {
                            VStack(spacing: AppSpacing.sm) {
                                Image(systemName: "doc.text.magnifyingglass")
                                    .font(.system(size: 40))
                                    .foregroundStyle(Color.appMutedForeground)
                                Text("No se encontraron articulos con los filtros seleccionados")
                                    .font(AppTypography.bodySmall)
                                    .foregroundStyle(Color.appMutedForeground)
                                    .multilineTextAlignment(.center)
                            }
                            .padding(AppSpacing.md)
                            .frame(maxHeight: .infinity)
                        }
                    } else {
                        ScrollView {
                            LazyVStack(spacing: AppSpacing.xs) {
                                ForEach(viewModel.displayedArticles) { item in
                                    NavigationLink(value: item.slug) {
                                        ArticleRowView(article: item)
                                    }
                                    .buttonStyle(.plain)
                                }

                                if viewModel.hasMore {
                                    Button {
                                        viewModel.loadMore()
                                        Haptics.send()
                                    } label: {
                                        Text("Cargar mas (\(viewModel.totalFilteredCount - viewModel.displayedArticles.count) restantes)")
                                            .font(AppTypography.bodySmall)
                                            .foregroundStyle(Color.appPrimary)
                                            .padding(.vertical, AppSpacing.sm)
                                            .frame(maxWidth: .infinity)
                                            .background(Color.appMuted)
                                            .clipShape(RoundedRectangle(cornerRadius: AppRadius.card))
                                    }
                                    .buttonStyle(.plain)
                                    .padding(.horizontal, AppSpacing.sm)
                                }
                            }
                            .padding(.vertical, AppSpacing.xs)
                        }
                    }
                }
            }
            .background(Color.appBackground)
            .navigationTitle("Estatuto Tributario")
            .navigationBarTitleDisplayMode(.large)
            .navigationDestination(for: String.self) { slug in
                ArticleDetailView(slug: slug)
            }
            .sheet(isPresented: $viewModel.showingFilterSheet) {
                ETFilterSheet(viewModel: viewModel)
            }
            .task {
                if viewModel.allArticles.isEmpty {
                    await viewModel.loadData()
                }
            }
        }
    }

    private func libroShortName(_ label: String) -> String {
        for libro in LibroColor.allLibros where label == libro.name {
            return libro.shortName
        }
        if label.contains("Preliminar") { return "Prelim." }
        return label
    }
}
