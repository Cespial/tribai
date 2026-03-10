import Foundation

/// Shared data container for App Group communication between main app and widgets.
enum SharedDataService {
    private static let suiteName = "group.co.tribai.app"

    private static var defaults: UserDefaults? {
        UserDefaults(suiteName: suiteName)
    }

    // MARK: - Deadline Data (for DeadlineWidget)

    struct SharedDeadline: Codable {
        let obligacion: String
        let fecha: String
        let diasRestantes: Int
    }

    static func writeNextDeadline(_ deadline: SharedDeadline) {
        guard let data = try? JSONEncoder().encode(deadline) else { return }
        defaults?.set(data, forKey: "nextDeadline")
    }

    static func readNextDeadline() -> SharedDeadline? {
        guard let data = defaults?.data(forKey: "nextDeadline") else { return nil }
        return try? JSONDecoder().decode(SharedDeadline.self, from: data)
    }

    // MARK: - UVT Data (for UVTConverterWidget)

    struct SharedUVTData: Codable {
        let value: Double
        let year: Int
    }

    static func writeUVTData(_ uvt: SharedUVTData) {
        guard let data = try? JSONEncoder().encode(uvt) else { return }
        defaults?.set(data, forKey: "uvtData")
    }

    static func readUVTData() -> SharedUVTData? {
        guard let data = defaults?.data(forKey: "uvtData") else { return nil }
        return try? JSONDecoder().decode(SharedUVTData.self, from: data)
    }

    // MARK: - Sync from main app

    static func syncDeadlineData(from deadlines: [CalendarDeadline]) {
        let today = Date()
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"

        let upcoming = deadlines
            .compactMap { deadline -> (CalendarDeadline, Date)? in
                guard let date = formatter.date(from: deadline.fecha),
                      date >= today else { return nil }
                return (deadline, date)
            }
            .sorted { $0.1 < $1.1 }
            .first

        if let (deadline, date) = upcoming {
            let days = Calendar.current.dateComponents([.day], from: today, to: date).day ?? 0
            let displayFormatter = DateFormatter()
            displayFormatter.dateFormat = "dd MMM yyyy"
            displayFormatter.locale = Locale(identifier: "es_CO")

            writeNextDeadline(SharedDeadline(
                obligacion: deadline.obligacion,
                fecha: displayFormatter.string(from: date),
                diasRestantes: days
            ))
        }

        writeUVTData(SharedUVTData(value: 52_374, year: 2026))
    }
}
