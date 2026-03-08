import WidgetKit
import SwiftUI

struct DeadlineEntry: TimelineEntry {
    let date: Date
    let obligacion: String
    let fechaVencimiento: String
    let diasRestantes: Int
    let isPlaceholder: Bool
}

struct DeadlineProvider: TimelineProvider {
    private static let suiteName = "group.com.superapp-tributaria.SuperAppTributaria"

    func placeholder(in context: Context) -> DeadlineEntry {
        DeadlineEntry(date: Date(), obligacion: "Declaracion de Renta", fechaVencimiento: "15 Mar 2026", diasRestantes: 5, isPlaceholder: true)
    }

    func getSnapshot(in context: Context, completion: @escaping (DeadlineEntry) -> Void) {
        let entry = loadEntry()
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<DeadlineEntry>) -> Void) {
        let entry = loadEntry()
        let nextUpdate = Calendar.current.date(byAdding: .hour, value: 6, to: Date())!
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
        completion(timeline)
    }

    private func loadEntry() -> DeadlineEntry {
        if let data = UserDefaults(suiteName: Self.suiteName)?.data(forKey: "nextDeadline"),
           let decoded = try? JSONDecoder().decode(SharedDeadlineDTO.self, from: data) {
            return DeadlineEntry(
                date: Date(),
                obligacion: decoded.obligacion,
                fechaVencimiento: decoded.fecha,
                diasRestantes: decoded.diasRestantes,
                isPlaceholder: false
            )
        }
        return fallbackEntry()
    }

    private func fallbackEntry() -> DeadlineEntry {
        // Compute next deadline from hardcoded calendar when App Group data not available
        let deadlines: [(String, String)] = [
            ("Retencion en la Fuente", "2026-03-11"),
            ("IVA Bimestral Ene-Feb", "2026-03-11"),
            ("SIMPLE Anticipo Ene-Feb", "2026-03-18"),
            ("ICA Bogota Ene-Feb", "2026-03-18"),
            ("GMF Declaracion", "2026-03-18"),
            ("Renta Personas Juridicas", "2026-04-14"),
            ("Renta Personas Naturales", "2026-08-12"),
        ]

        let isoFormatter = DateFormatter()
        isoFormatter.dateFormat = "yyyy-MM-dd"
        let displayFormatter = DateFormatter()
        displayFormatter.dateFormat = "dd MMM yyyy"
        displayFormatter.locale = Locale(identifier: "es_CO")
        let today = Date()

        for (name, dateStr) in deadlines {
            if let date = isoFormatter.date(from: dateStr), date >= today {
                let days = Calendar.current.dateComponents([.day], from: today, to: date).day ?? 0
                return DeadlineEntry(
                    date: today,
                    obligacion: name,
                    fechaVencimiento: displayFormatter.string(from: date),
                    diasRestantes: days,
                    isPlaceholder: false
                )
            }
        }

        return DeadlineEntry(date: today, obligacion: "Sin vencimientos proximos", fechaVencimiento: "", diasRestantes: 0, isPlaceholder: false)
    }
}

// DTO matching SharedDataService.SharedDeadline
private struct SharedDeadlineDTO: Codable {
    let obligacion: String
    let fecha: String
    let diasRestantes: Int
}

struct DeadlineWidgetView: View {
    let entry: DeadlineEntry

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Image(systemName: "calendar.badge.clock")
                    .font(.system(size: 14))
                    .foregroundStyle(urgencyColor)
                Text("Vencimiento")
                    .font(.system(size: 11, weight: .medium))
                    .foregroundStyle(.secondary)
            }

            Text(entry.obligacion)
                .font(.system(size: 14, weight: .semibold))
                .lineLimit(2)

            Spacer()

            HStack {
                Text(entry.fechaVencimiento)
                    .font(.system(size: 11))
                    .foregroundStyle(.secondary)
                Spacer()
                if entry.diasRestantes > 0 {
                    Text("\(entry.diasRestantes)d")
                        .font(.system(size: 16, weight: .bold))
                        .foregroundStyle(urgencyColor)
                } else if entry.diasRestantes == 0 {
                    Text("HOY")
                        .font(.system(size: 14, weight: .bold))
                        .foregroundStyle(.red)
                }
            }
        }
        .padding()
        .containerBackground(.fill.tertiary, for: .widget)
    }

    private var urgencyColor: Color {
        if entry.diasRestantes <= 3 { return .red }
        if entry.diasRestantes <= 7 { return .orange }
        return .primary
    }
}

struct DeadlineWidget: Widget {
    let kind: String = "DeadlineWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: DeadlineProvider()) { entry in
            DeadlineWidgetView(entry: entry)
        }
        .configurationDisplayName("Vencimientos")
        .description("Proxima obligacion fiscal")
        .supportedFamilies([.systemSmall])
    }
}
