import SwiftUI

struct GraphView: View {
    @State private var viewModel = GraphViewModel()
    @State private var showFilters = false

    var body: some View {
        ZStack(alignment: .topLeading) {
            // Graph canvas
            if viewModel.isLoaded {
                GraphCanvasView(
                    nodes: viewModel.filteredNodes,
                    edges: viewModel.filteredEdges,
                    positions: viewModel.nodePositions,
                    nodeRadius: { viewModel.nodeRadius(for: $0) },
                    selectedNode: viewModel.selectedNode,
                    onNodeTapped: { node in
                        withAnimation(.easeInOut(duration: 0.2)) {
                            if viewModel.selectedNode?.id == node.id {
                                viewModel.selectedNode = nil
                            } else {
                                viewModel.selectedNode = node
                                Haptics.impact()
                            }
                        }
                    }
                )
                .background(Color.appBackground)

                // Stats overlay
                VStack(alignment: .trailing, spacing: 4) {
                    Text("Mostrando \(viewModel.visibleNodesCount) de \(viewModel.totalNodes) artículos")
                        .font(AppTypography.caption)
                        .foregroundStyle(Color.appMutedForeground)
                    Text("\(viewModel.visibleEdgesCount) relaciones")
                        .font(AppTypography.caption)
                        .foregroundStyle(Color.appMutedForeground)
                    if viewModel.isSimulating {
                        HStack(spacing: 4) {
                            ProgressView()
                                .controlSize(.mini)
                            Text("Simulando...")
                                .font(AppTypography.caption)
                                .foregroundStyle(Color.appMutedForeground)
                        }
                    }
                }
                .padding(8)
                .background(.ultraThinMaterial)
                .clipShape(RoundedRectangle(cornerRadius: 8))
                .padding(.top, 8)
                .padding(.trailing, 8)
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topTrailing)

                // Legend
                GraphLegendView(
                    selectedLibro: viewModel.selectedLibro,
                    onLibroTapped: { libro in
                        withAnimation {
                            viewModel.setLibroFilter(
                                viewModel.selectedLibro == libro ? nil : libro
                            )
                        }
                    }
                )
                .padding(.bottom, 8)
                .padding(.leading, 8)
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .bottomLeading)

            } else {
                VStack(spacing: 12) {
                    ProgressView()
                    Text("Cargando grafo de relaciones...")
                        .font(AppTypography.bodySmall)
                        .foregroundStyle(Color.appMutedForeground)
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
            }

            // Selected node detail
            if let node = viewModel.selectedNode {
                GraphNodeDetailView(node: node)
                    .transition(.move(edge: .bottom).combined(with: .opacity))
                    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .bottom)
            }
        }
        .navigationTitle("Grafo de Relaciones")
        .navigationBarTitleDisplayMode(.inline)
        .navigationDestination(for: String.self) { slug in
            ArticleDetailView(slug: slug)
        }
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                Button {
                    showFilters.toggle()
                } label: {
                    Image(systemName: "line.3.horizontal.decrease.circle")
                }
                .accessibilityLabel("Filtros")
            }
            ToolbarItem(placement: .secondaryAction) {
                Button {
                    viewModel.setLibroFilter(nil)
                    viewModel.setMinDegree(1)
                    viewModel.setMaxVisible(220)
                } label: {
                    Label("Restablecer", systemImage: "arrow.counterclockwise")
                }
            }
        }
        .sheet(isPresented: $showFilters) {
            GraphFiltersSheet(viewModel: viewModel)
                .presentationDetents([.medium])
        }
        .task {
            viewModel.loadData()
        }
    }
}

// MARK: - Legend

struct GraphLegendView: View {
    let selectedLibro: String?
    let onLibroTapped: (String) -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            ForEach(LibroColor.allLibros, id: \.name) { libro in
                Button {
                    onLibroTapped(libro.name)
                } label: {
                    HStack(spacing: 6) {
                        Circle()
                            .fill(libro.color)
                            .frame(width: 8, height: 8)
                        Text(libro.shortName)
                            .font(.system(size: 10))
                            .foregroundStyle(Color.appForeground)
                    }
                    .opacity(selectedLibro == nil || selectedLibro == libro.name ? 1 : 0.35)
                }
                .buttonStyle(.plain)
            }
        }
        .padding(8)
        .background(.ultraThinMaterial)
        .clipShape(RoundedRectangle(cornerRadius: 8))
    }
}

// MARK: - Node Detail

struct GraphNodeDetailView: View {
    let node: GraphNode

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Circle()
                    .fill(LibroColor.color(for: node.libro))
                    .frame(width: 12, height: 12)
                Text(node.label)
                    .font(AppTypography.cardHeading)
                    .foregroundStyle(Color.appForeground)
                Spacer()
                Text(node.estado)
                    .font(AppTypography.caption)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 3)
                    .background(estadoColor.opacity(0.15))
                    .foregroundStyle(estadoColor)
                    .clipShape(Capsule())
            }

            Text(node.titulo)
                .font(AppTypography.bodySmall)
                .foregroundStyle(Color.appMutedForeground)
                .lineLimit(2)

            HStack(spacing: 16) {
                Label("\(node.libro)", systemImage: "book")
                    .font(AppTypography.caption)
                    .foregroundStyle(Color.appMutedForeground)
                Spacer()
                HStack(spacing: 12) {
                    Label("Entrantes: \(node.refsIn)", systemImage: "arrow.down.left")
                    Label("Salientes: \(node.refsOut)", systemImage: "arrow.up.right")
                }
                .font(AppTypography.caption)
                .foregroundStyle(Color.appMutedForeground)
            }

            NavigationLink(value: "articulo-\(node.id)") {
                HStack(spacing: 6) {
                    Image(systemName: "doc.text")
                        .font(.system(size: 13))
                    Text("Ver articulo")
                        .font(AppTypography.label)
                }
                .foregroundStyle(Color.appPrimary)
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(Color.appMuted)
                .clipShape(Capsule())
            }
        }
        .padding(16)
        .background(.ultraThickMaterial)
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .padding(.horizontal, 12)
        .padding(.bottom, 12)
    }

    private var estadoColor: Color {
        switch node.estado {
        case "vigente": return ColorPalette.vigente
        case "modificado": return ColorPalette.modificado
        case "derogado": return ColorPalette.derogado
        default: return Color.appMutedForeground
        }
    }
}

// MARK: - Filters Sheet

struct GraphFiltersSheet: View {
    @Bindable var viewModel: GraphViewModel
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            Form {
                Section("Libro") {
                    Picker("Filtrar por libro", selection: Binding(
                        get: { viewModel.selectedLibro ?? "" },
                        set: { viewModel.setLibroFilter($0.isEmpty ? nil : $0) }
                    )) {
                        Text("Todos").tag("")
                        ForEach(LibroColor.allLibros, id: \.name) { libro in
                            HStack {
                                Circle().fill(libro.color).frame(width: 8, height: 8)
                                Text(libro.name)
                            }
                            .tag(libro.name)
                        }
                    }
                    .pickerStyle(.inline)
                    .labelsHidden()
                }

                Section("Conectividad mínima: \(viewModel.minDegree)") {
                    Slider(
                        value: Binding(
                            get: { Double(viewModel.minDegree) },
                            set: { viewModel.setMinDegree(Int($0)) }
                        ),
                        in: 1...15,
                        step: 1
                    )
                    Text("Solo artículos con al menos \(viewModel.minDegree) referencias")
                        .font(AppTypography.caption)
                        .foregroundStyle(Color.appMutedForeground)
                }

                Section("Nodos visibles: \(viewModel.maxVisibleNodes)") {
                    Slider(
                        value: Binding(
                            get: { Double(viewModel.maxVisibleNodes) },
                            set: { viewModel.setMaxVisible(Int($0)) }
                        ),
                        in: 50...540,
                        step: 10
                    )
                    Text("Mostrando los \(viewModel.maxVisibleNodes) artículos más conectados")
                        .font(AppTypography.caption)
                        .foregroundStyle(Color.appMutedForeground)
                }
            }
            .navigationTitle("Filtros del Grafo")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Listo") { dismiss() }
                }
            }
        }
    }
}
