import SwiftUI

struct GlobalSearchView: View {
    @State private var viewModel = GlobalSearchViewModel()
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                // Search bar
                HStack(spacing: 10) {
                    Image(systemName: "magnifyingglass")
                        .foregroundStyle(Color.appMutedForeground)
                    TextField("Buscar calculadoras, terminos, vencimientos...", text: $viewModel.query)
                        .textFieldStyle(.plain)
                        .autocorrectionDisabled()
                        .onChange(of: viewModel.query) { _, _ in
                            viewModel.search()
                        }
                    if !viewModel.query.isEmpty {
                        Button {
                            viewModel.query = ""
                            viewModel.results = []
                        } label: {
                            Image(systemName: "xmark.circle.fill")
                                .foregroundStyle(Color.appMutedForeground)
                        }
                    }
                }
                .padding(12)
                .background(Color.appMuted)
                .clipShape(RoundedRectangle(cornerRadius: AppRadius.card))
                .padding(.horizontal, AppSpacing.sm)
                .padding(.top, AppSpacing.xs)

                if viewModel.results.isEmpty && !viewModel.query.isEmpty && viewModel.query.count >= 2 {
                    VStack(spacing: AppSpacing.xs) {
                        Image(systemName: "magnifyingglass")
                            .font(.system(size: 32))
                            .foregroundStyle(Color.appMutedForeground)
                        Text("Sin resultados para \"\(viewModel.query)\"")
                            .font(AppTypography.bodySmall)
                            .foregroundStyle(Color.appMutedForeground)
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else {
                    ScrollView {
                        LazyVStack(alignment: .leading, spacing: AppSpacing.sm) {
                            ForEach(viewModel.groupedResults, id: \.category) { group in
                                Section {
                                    ForEach(group.items) { item in
                                        searchResultRow(item)
                                    }
                                } header: {
                                    Text(group.category.rawValue)
                                        .font(AppTypography.label)
                                        .foregroundStyle(Color.appMutedForeground)
                                        .padding(.horizontal, AppSpacing.sm)
                                        .padding(.top, AppSpacing.xs)
                                }
                            }
                        }
                        .padding(.top, AppSpacing.xs)
                    }
                }
            }
            .background(Color.appBackground)
            .navigationTitle("Buscar")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Cerrar") { dismiss() }
                }
            }
        }
    }

    private func searchResultRow(_ item: GlobalSearchViewModel.SearchResult) -> some View {
        HStack(spacing: 10) {
            Image(systemName: iconForCategory(item.category))
                .font(.system(size: 14))
                .foregroundStyle(Color.appPrimary)
                .frame(width: 24)

            VStack(alignment: .leading, spacing: 2) {
                Text(item.title)
                    .font(AppTypography.bodySmall)
                    .foregroundStyle(Color.appForeground)
                Text(item.subtitle)
                    .font(AppTypography.caption)
                    .foregroundStyle(Color.appMutedForeground)
                    .lineLimit(1)
            }

            Spacer()

            Image(systemName: "chevron.right")
                .font(.system(size: 12))
                .foregroundStyle(Color.appMutedForeground)
        }
        .padding(.horizontal, AppSpacing.sm)
        .padding(.vertical, 8)
    }

    private func iconForCategory(_ category: GlobalSearchViewModel.ResultCategory) -> String {
        switch category {
        case .calculadora: return "function"
        case .articulo: return "book"
        case .calendario: return "calendar"
        case .glosario: return "character.book.closed"
        }
    }
}
