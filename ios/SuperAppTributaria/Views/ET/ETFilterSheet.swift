import SwiftUI

struct ETFilterSheet: View {
    @Bindable var viewModel: ETExplorerViewModel
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            List {
                // Libro section
                Section("Libro") {
                    if let facets = viewModel.facets {
                        ForEach(facets.libros) { libro in
                            Button {
                                viewModel.setLibro(libro.key)
                                Haptics.send()
                            } label: {
                                HStack {
                                    Circle()
                                        .fill(LibroColor.color(for: libro.label))
                                        .frame(width: 8, height: 8)
                                    Text(libro.label)
                                        .font(AppTypography.bodySmall)
                                        .foregroundStyle(Color.appForeground)
                                    Spacer()
                                    Text("\(libro.count)")
                                        .font(AppTypography.caption)
                                        .foregroundStyle(Color.appMutedForeground)
                                    if viewModel.selectedLibro == libro.key {
                                        Image(systemName: "checkmark")
                                            .font(.system(size: 14, weight: .semibold))
                                            .foregroundStyle(Color.appPrimary)
                                    }
                                }
                            }
                            .buttonStyle(.plain)
                        }
                    }
                }

                // Estado section
                Section("Estado") {
                    if let facets = viewModel.facets {
                        ForEach(facets.estados) { estado in
                            Button {
                                viewModel.setEstado(estado.key)
                                Haptics.send()
                            } label: {
                                HStack {
                                    Circle()
                                        .fill(estadoColor(estado.key))
                                        .frame(width: 8, height: 8)
                                    Text(estado.label.capitalized)
                                        .font(AppTypography.bodySmall)
                                        .foregroundStyle(Color.appForeground)
                                    Spacer()
                                    Text("\(estado.count)")
                                        .font(AppTypography.caption)
                                        .foregroundStyle(Color.appMutedForeground)
                                    if viewModel.selectedEstado == estado.key {
                                        Image(systemName: "checkmark")
                                            .font(.system(size: 14, weight: .semibold))
                                            .foregroundStyle(Color.appPrimary)
                                    }
                                }
                            }
                            .buttonStyle(.plain)
                        }
                    }
                }

                // Ley modificatoria section (top 20)
                Section("Ley Modificatoria") {
                    if let facets = viewModel.facets {
                        ForEach(Array(facets.laws.prefix(20))) { law in
                            Button {
                                viewModel.setLey(law.key)
                                Haptics.send()
                            } label: {
                                HStack {
                                    Text(law.label)
                                        .font(AppTypography.bodySmall)
                                        .foregroundStyle(Color.appForeground)
                                    Spacer()
                                    Text("\(law.count)")
                                        .font(AppTypography.caption)
                                        .foregroundStyle(Color.appMutedForeground)
                                    if viewModel.selectedLey == law.key {
                                        Image(systemName: "checkmark")
                                            .font(.system(size: 14, weight: .semibold))
                                            .foregroundStyle(Color.appPrimary)
                                    }
                                }
                            }
                            .buttonStyle(.plain)
                        }
                    }
                }
            }
            .navigationTitle("Filtros")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    if viewModel.activeFilterCount > 0 {
                        Button("Limpiar") {
                            viewModel.clearFilters()
                            Haptics.send()
                        }
                        .foregroundStyle(Color.appDestructive)
                    }
                }

                ToolbarItem(placement: .confirmationAction) {
                    Button("Listo") {
                        dismiss()
                    }
                }
            }
        }
        .presentationDetents([.medium, .large])
    }

    private func estadoColor(_ estado: String) -> Color {
        switch estado {
        case "vigente": return ColorPalette.vigente
        case "modificado": return ColorPalette.modificado
        default: return ColorPalette.derogado
        }
    }
}
