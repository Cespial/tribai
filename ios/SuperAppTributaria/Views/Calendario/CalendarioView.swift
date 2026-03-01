import SwiftUI

struct CalendarioView: View {
    @State private var viewModel = CalendarioViewModel()

    private let months = Array(1...12)
    private let monthLabels = [
        "Ene", "Feb", "Mar", "Abr", "May", "Jun",
        "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
    ]

    var body: some View {
        ScrollView {
            VStack(spacing: AppSpacing.sm) {
                SearchBarView(text: $viewModel.searchText, placeholder: "Buscar vencimientos...")

                // Month selector
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        ForEach(months, id: \.self) { month in
                            FilterChipView(
                                title: monthLabels[month - 1],
                                isSelected: viewModel.selectedMonth == month
                            ) {
                                viewModel.selectedMonth = month
                            }
                        }
                    }
                    .padding(.horizontal, AppSpacing.sm)
                }

                // Tipo contribuyente
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        ForEach(TipoContribuyente.allCases) { tipo in
                            FilterChipView(
                                title: tipo.label,
                                isSelected: viewModel.selectedTipo == tipo
                            ) {
                                viewModel.selectedTipo = tipo
                            }
                        }
                    }
                    .padding(.horizontal, AppSpacing.sm)
                }

                // Obligacion filter
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        FilterChipView(
                            title: "Todas",
                            isSelected: viewModel.selectedObligacion == nil
                        ) {
                            viewModel.selectedObligacion = nil
                        }
                        ForEach(viewModel.obligacionNames, id: \.self) { name in
                            FilterChipView(
                                title: shortObligacion(name),
                                isSelected: viewModel.selectedObligacion == name
                            ) {
                                viewModel.selectedObligacion = name
                            }
                        }
                    }
                    .padding(.horizontal, AppSpacing.sm)
                }

                // Count header
                HStack {
                    Text("\(viewModel.deadlineCount) vencimientos")
                        .font(AppTypography.label)
                        .foregroundStyle(Color.appMutedForeground)
                    Spacer()
                }
                .padding(.horizontal, AppSpacing.sm)

                // Deadline list
                LazyVStack(spacing: 8) {
                    ForEach(viewModel.filteredDeadlines) { deadline in
                        DeadlineRowView(
                            deadline: deadline,
                            status: viewModel.deadlineStatus(for: deadline.fecha),
                            formattedDate: viewModel.formattedDate(deadline.fecha)
                        )
                    }
                }
                .padding(.horizontal, AppSpacing.sm)

                if viewModel.filteredDeadlines.isEmpty {
                    EmptySearchView(query: viewModel.searchText, message: "No hay vencimientos para estos filtros")
                        .padding(.top, AppSpacing.md)
                }

                // Disclaimer
                Text(CalendarioData.disclaimer)
                    .font(AppTypography.caption)
                    .foregroundStyle(Color.appMutedForeground)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, AppSpacing.sm)
                    .padding(.top, AppSpacing.xs)
            }
            .padding(.bottom, AppSpacing.md)
        }
        .background(Color.appBackground)
        .refreshable { viewModel.refresh() }
        .navigationTitle("Calendario Fiscal 2026")
        .navigationBarTitleDisplayMode(.large)
    }

    private func shortObligacion(_ name: String) -> String {
        name.replacingOccurrences(of: "Declaracion de ", with: "")
            .replacingOccurrences(of: " (mensual)", with: "")
            .replacingOccurrences(of: " Bimestral", with: " Bim.")
            .replacingOccurrences(of: " Cuatrimestral", with: " Cuat.")
    }
}
