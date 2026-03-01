import Foundation

@MainActor
@Observable
final class CalendarioViewModel {

    var selectedMonth: Int = Calendar.current.component(.month, from: Date())
    var selectedTipo: TipoContribuyente = .todos
    var selectedObligacion: String?
    var searchText: String = ""

    private static let isoFormatter: DateFormatter = {
        let f = DateFormatter()
        f.dateFormat = "yyyy-MM-dd"
        return f
    }()

    private static let displayFormatter: DateFormatter = {
        let f = DateFormatter()
        f.locale = Locale(identifier: "es_CO")
        f.dateFormat = "d MMM yyyy"
        return f
    }()

    private static let monthNames = [
        "Ene", "Feb", "Mar", "Abr", "May", "Jun",
        "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
    ]

    var monthName: String {
        Self.monthNames[safe: selectedMonth - 1] ?? ""
    }

    var obligacionNames: [String] {
        CalendarioData.obligacionNames
    }

    var filteredDeadlines: [CalendarDeadline] {
        CalendarioData.obligaciones.filter { d in
            guard let mes = d.mesNumero else { return false }
            if mes != selectedMonth { return false }
            if selectedTipo != .todos && d.tipoContribuyente != .todos && d.tipoContribuyente != selectedTipo { return false }
            if let obl = selectedObligacion, d.obligacion != obl { return false }
            if !searchText.isEmpty {
                let q = searchText.lowercased()
                let matches = d.obligacion.lowercased().contains(q)
                    || d.periodo.lowercased().contains(q)
                    || d.ultimoDigito.contains(q)
                return matches
            }
            return true
        }
        .sorted { ($0.fecha, $0.ultimoDigito) < ($1.fecha, $1.ultimoDigito) }
    }

    var deadlineCount: Int { filteredDeadlines.count }

    func deadlineStatus(for dateStr: String) -> DeadlineStatus {
        guard let date = Self.isoFormatter.date(from: dateStr) else { return .futuro }
        let today = Calendar.current.startOfDay(for: Date())
        let target = Calendar.current.startOfDay(for: date)

        if target < today { return .vencido }
        if target == today { return .hoy }
        if let sevenDays = Calendar.current.date(byAdding: .day, value: 7, to: today),
           target <= sevenDays { return .proximo }
        return .futuro
    }

    func formattedDate(_ dateStr: String) -> String {
        guard let date = Self.isoFormatter.date(from: dateStr) else { return dateStr }
        return Self.displayFormatter.string(from: date)
    }

    func refresh() {
        // Re-trigger deadline status computation by touching the month
        let current = selectedMonth
        selectedMonth = current
    }
}

private extension Array {
    subscript(safe index: Int) -> Element? {
        indices.contains(index) ? self[index] : nil
    }
}
