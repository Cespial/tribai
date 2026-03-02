import WidgetKit
import SwiftUI

struct UVTEntry: TimelineEntry {
    let date: Date
    let uvtValue: Decimal
    let year: Int
}

struct UVTProvider: TimelineProvider {
    func placeholder(in context: Context) -> UVTEntry {
        UVTEntry(date: Date(), uvtValue: 52_374, year: 2026)
    }

    func getSnapshot(in context: Context, completion: @escaping (UVTEntry) -> Void) {
        let entry = UVTEntry(date: Date(), uvtValue: 52_374, year: 2026)
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<UVTEntry>) -> Void) {
        let entry = UVTEntry(date: Date(), uvtValue: 52_374, year: 2026)
        let nextUpdate = Calendar.current.date(byAdding: .day, value: 1, to: Date())!
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
        completion(timeline)
    }
}

struct UVTConverterWidgetView: View {
    let entry: UVTEntry

    private var commonValues: [(uvt: Int, cop: String)] {
        let formatter = NumberFormatter()
        formatter.numberStyle = .decimal
        formatter.groupingSeparator = "."
        formatter.decimalSeparator = ","
        formatter.maximumFractionDigits = 0

        let values: [Int] = [1, 10, 100, 1_000, 1_090]
        return values.map { uvt in
            let cop = entry.uvtValue * Decimal(uvt)
            let formatted = formatter.string(from: NSDecimalNumber(decimal: cop)) ?? "\(cop)"
            return (uvt, "$\(formatted)")
        }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack {
                Image(systemName: "coloncurrencysign.arrow.trianglehead.counterclockwise.rotate.90")
                    .font(.system(size: 12))
                    .foregroundStyle(.blue)
                Text("UVT \(entry.year)")
                    .font(.system(size: 11, weight: .medium))
                    .foregroundStyle(.secondary)
                Spacer()
                Text("$\(formattedUVT)")
                    .font(.system(size: 11, weight: .bold))
            }

            Divider()

            ForEach(commonValues, id: \.uvt) { item in
                HStack {
                    Text("\(item.uvt) UVT")
                        .font(.system(size: 10))
                        .foregroundStyle(.secondary)
                        .frame(width: 65, alignment: .leading)
                    Spacer()
                    Text(item.cop)
                        .font(.system(size: 10, weight: .medium))
                }
            }
        }
        .padding()
        .containerBackground(.fill.tertiary, for: .widget)
    }

    private var formattedUVT: String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .decimal
        formatter.groupingSeparator = "."
        formatter.maximumFractionDigits = 0
        return formatter.string(from: NSDecimalNumber(decimal: entry.uvtValue)) ?? "\(entry.uvtValue)"
    }
}

struct UVTConverterWidget: Widget {
    let kind: String = "UVTConverterWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: UVTProvider()) { entry in
            UVTConverterWidgetView(entry: entry)
        }
        .configurationDisplayName("Conversor UVT")
        .description("Valores comunes en UVT y pesos")
        .supportedFamilies([.systemMedium])
    }
}
