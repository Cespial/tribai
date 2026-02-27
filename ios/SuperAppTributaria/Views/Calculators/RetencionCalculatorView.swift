import SwiftUI

struct RetencionCalculatorView: View {
    @State private var selectedConceptoId: String = "salarios"
    @State private var monto: Decimal = 0
    @State private var deduccionesSS: Decimal = 0
    @State private var result: RetencionCalculator.Result?

    private var conceptos: [TaxData.RetencionConcepto] {
        TaxData.retencionConceptos
    }

    private var selectedConcepto: TaxData.RetencionConcepto? {
        conceptos.first { $0.id == selectedConceptoId }
    }

    var body: some View {
        ScrollView {
            VStack(spacing: AppSpacing.sm) {
                CardView {
                    VStack(spacing: AppSpacing.sm) {
                        // Concept picker
                        VStack(alignment: .leading, spacing: 4) {
                            Text("Concepto de retencion")
                                .font(AppTypography.label)
                                .foregroundStyle(Color.appMutedForeground)

                            Picker("Concepto", selection: $selectedConceptoId) {
                                ForEach(conceptos, id: \.id) { concepto in
                                    Text(concepto.concepto).tag(concepto.id)
                                }
                            }
                            .pickerStyle(.menu)
                            .tint(Color.appForeground)
                        }

                        CurrencyInputField(label: "Monto base", value: $monto)

                        if selectedConcepto?.isProgressive == true {
                            CurrencyInputField(label: "Deducciones seguridad social", value: $deduccionesSS)
                        }

                        // Info about concept
                        if let concepto = selectedConcepto {
                            HStack {
                                Text("Art. \(concepto.articulo) ET")
                                    .font(AppTypography.caption)
                                    .foregroundStyle(Color.appMutedForeground)
                                Spacer()
                                if let tarifa = concepto.tarifa {
                                    Text("Tarifa: \(CurrencyFormatter.percent(tarifa))")
                                        .font(AppTypography.caption)
                                        .foregroundStyle(Color.appMutedForeground)
                                } else {
                                    Text("Tabla progresiva")
                                        .font(AppTypography.caption)
                                        .foregroundStyle(Color.appMutedForeground)
                                }
                            }
                            .padding(8)
                            .background(Color.appMuted)
                            .clipShape(RoundedRectangle(cornerRadius: AppRadius.card))
                        }

                        CalculateButton(title: "Calcular Retencion") {
                            calculate()
                        }
                    }
                }

                if let result {
                    CalculatorResultView(
                        title: "Retencion en la Fuente",
                        mainValue: CurrencyFormatter.cop(result.retencion),
                        mainLabel: "Retencion aplicable",
                        rows: [
                            ("Concepto", result.concepto),
                            ("Monto", CurrencyFormatter.cop(result.monto)),
                            ("Base gravable", CurrencyFormatter.cop(result.baseGravable)),
                            ("Tarifa aplicada", result.isProgressive ? "Progresiva (\(CurrencyFormatter.percent(result.tarifaAplicada)) efectiva)" : CurrencyFormatter.percent(result.tarifaAplicada)),
                            ("Art. ET", result.articulo),
                        ],
                        disclaimer: "Bases y tarifas segun Decreto 0572/2025. La retencion por salarios usa la tabla progresiva del Art. 383 ET."
                    )
                }
            }
            .padding(.horizontal, AppSpacing.sm)
            .padding(.bottom, AppSpacing.md)
        }
        .background(Color.appBackground)
        .navigationTitle("Retencion")
        .navigationBarTitleDisplayMode(.inline)
    }

    private func calculate() {
        let input = RetencionCalculator.Input(
            conceptoId: selectedConceptoId,
            monto: monto,
            deduccionesSS: deduccionesSS
        )
        result = RetencionCalculator.calculate(input: input)
    }
}
