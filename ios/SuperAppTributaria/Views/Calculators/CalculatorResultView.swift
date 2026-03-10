import SwiftUI
import UIKit

struct CalculatorResultView: View {
    let title: String
    let mainValue: String
    let mainLabel: String
    let rows: [(label: String, value: String)]
    var disclaimer: String? = nil
    var onConsultAssistant: (() -> Void)? = nil

    @State private var showingShareSheet = false

    var body: some View {
        VStack(alignment: .leading, spacing: AppSpacing.sm) {
            // Main result
            VStack(spacing: 4) {
                Text(mainLabel)
                    .font(AppTypography.label)
                    .foregroundStyle(Color.appMutedForeground)

                Text(mainValue)
                    .font(.system(.title, design: .rounded, weight: .bold))
                    .foregroundStyle(Color.appForeground)
            }
            .frame(maxWidth: .infinity)
            .padding(AppSpacing.sm)
            .background(Color.appMuted)
            .clipShape(RoundedRectangle(cornerRadius: AppRadius.card))
            .accessibilityElement(children: .combine)
            .accessibilityLabel("\(mainLabel): \(mainValue)")

            // Breakdown rows
            if !rows.isEmpty {
                VStack(spacing: 0) {
                    ForEach(Array(rows.enumerated()), id: \.offset) { _, row in
                        ResultRow(label: row.label, value: row.value)
                        if row.label != rows.last?.label {
                            Divider()
                        }
                    }
                }
                .padding(AppSpacing.sm)
                .background(Color.appCard)
                .clipShape(RoundedRectangle(cornerRadius: AppRadius.card))
                .overlay(
                    RoundedRectangle(cornerRadius: AppRadius.card)
                        .stroke(Color.appBorder, lineWidth: 1)
                )
            }

            // Disclaimer
            VStack(spacing: 6) {
                if let disclaimer {
                    Text(disclaimer)
                        .font(AppTypography.caption)
                        .foregroundStyle(Color.appMutedForeground)
                }
                Text("Este calculo es aproximado y no constituye asesoria tributaria profesional. Consulte con un contador publico certificado.")
                    .font(AppTypography.caption)
                    .foregroundStyle(Color.appMutedForeground)
            }
            .padding(12)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(Color.appMuted.opacity(0.5))
            .clipShape(RoundedRectangle(cornerRadius: AppRadius.card))

            // Consult assistant
            if let action = onConsultAssistant {
                Button(action: action) {
                    HStack(spacing: 8) {
                        Image(systemName: "bubble.left.and.text.bubble.right")
                        Text("Consultar al asistente")
                    }
                    .font(AppTypography.bodySmall)
                    .foregroundStyle(Color.appPrimary)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 12)
                    .background(Color.appCard)
                    .clipShape(RoundedRectangle(cornerRadius: AppRadius.button))
                    .overlay(
                        RoundedRectangle(cornerRadius: AppRadius.button)
                            .stroke(Color.appBorder, lineWidth: 1)
                    )
                }
                .buttonStyle(.plain)
                .accessibilityHint("Abre el asistente tributario para consultar sobre este resultado")
            }

            // Share button
            Button {
                showingShareSheet = true
            } label: {
                HStack(spacing: 8) {
                    Image(systemName: "square.and.arrow.up")
                    Text("Compartir resultado")
                }
                .font(AppTypography.bodySmall)
                .foregroundStyle(Color.appPrimary)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 12)
                .background(Color.appCard)
                .clipShape(RoundedRectangle(cornerRadius: AppRadius.button))
                .overlay(
                    RoundedRectangle(cornerRadius: AppRadius.button)
                        .stroke(Color.appBorder, lineWidth: 1)
                )
            }
            .buttonStyle(.plain)
            .accessibilityHint("Comparte el resultado del calculo como texto y PDF")
            .sheet(isPresented: $showingShareSheet) {
                let textSummary = TextSummaryBuilder.buildSummary(
                    title: title,
                    mainLabel: mainLabel,
                    mainValue: mainValue,
                    rows: rows,
                    disclaimer: disclaimer
                )
                let pdfData = PDFExportService.generatePDF(from: PDFExportService.PDFContent(
                    title: title,
                    subtitle: "\(mainLabel): \(mainValue)",
                    rows: rows,
                    disclaimer: disclaimer,
                    date: Date()
                ))
                ShareSheetView(items: [textSummary, pdfData])
            }
        }
    }
}
