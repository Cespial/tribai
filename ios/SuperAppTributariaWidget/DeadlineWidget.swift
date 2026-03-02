import WidgetKit
import SwiftUI

struct DeadlineEntry: TimelineEntry {
    let date: Date
    let obligacion: String
    let fechaVencimiento: String
    let diasRestantes: Int
}

struct DeadlineProvider: TimelineProvider {
    func placeholder(in context: Context) -> DeadlineEntry {
        DeadlineEntry(date: Date(), obligacion: "Declaracion de Renta", fechaVencimiento: "15 Mar 2026", diasRestantes: 5)
    }

    func getSnapshot(in context: Context, completion: @escaping (DeadlineEntry) -> Void) {
        let entry = DeadlineEntry(date: Date(), obligacion: "Declaracion de Renta", fechaVencimiento: "15 Mar 2026", diasRestantes: 5)
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<DeadlineEntry>) -> Void) {
        let nextDeadline = getNextDeadline()
        let entry = DeadlineEntry(
            date: Date(),
            obligacion: nextDeadline.obligacion,
            fechaVencimiento: nextDeadline.fecha,
            diasRestantes: nextDeadline.dias
        )
        let nextUpdate = Calendar.current.date(byAdding: .hour, value: 6, to: Date())!
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
        completion(timeline)
    }

    private func getNextDeadline() -> (obligacion: String, fecha: String, dias: Int) {
        // Placeholder — in production would read from App Group shared container
        let formatter = DateFormatter()
        formatter.dateFormat = "dd MMM yyyy"
        formatter.locale = Locale(identifier: "es_CO")
        return ("Proxima obligacion fiscal", formatter.string(from: Date()), 0)
    }
}

struct DeadlineWidgetView: View {
    let entry: DeadlineEntry

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Image(systemName: "calendar.badge.clock")
                    .font(.system(size: 14))
                    .foregroundStyle(.orange)
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
                Text("\(entry.diasRestantes)d")
                    .font(.system(size: 16, weight: .bold))
                    .foregroundStyle(entry.diasRestantes <= 3 ? .red : .primary)
            }
        }
        .padding()
        .containerBackground(.fill.tertiary, for: .widget)
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
