import SwiftUI

struct IVACalculatorView: View {
    @State private var monto: Decimal = 0
    @State private var mode: IVACalculator.Mode = .calcular
    @State private var tarifa: IVACalculator.Tarifa = .general
    @State private var result: IVACalculator.Result?

    var body: some View {
        ScrollView {
            VStack(spacing: AppSpacing.sm) {
                CardView {
                    VStack(spacing: AppSpacing.sm) {
                        // Mode toggle
                        VStack(alignment: .leading, spacing: 4) {
                            Text("Operacion")
                                .font(AppTypography.label)
                                .foregroundStyle(Color.appMutedForeground)

                            Picker("Modo", selection: $mode) {
                                Text("Calcular IVA").tag(IVACalculator.Mode.calcular)
                                Text("Extraer IVA").tag(IVACalculator.Mode.extraer)
                            }
                            .pickerStyle(.segmented)
                        }

                        CurrencyInputField(
                            label: mode == .calcular ? "Base (sin IVA)" : "Total (con IVA)",
                            value: $monto
                        )

                        // Tariff selector
                        VStack(alignment: .leading, spacing: 4) {
                            Text("Tarifa")
                                .font(AppTypography.label)
                                .foregroundStyle(Color.appMutedForeground)

                            Picker("Tarifa", selection: $tarifa) {
                                ForEach(IVACalculator.Tarifa.allCases) { t in
                                    Text(t.rawValue).tag(t)
                                }
                            }
                            .pickerStyle(.segmented)
                        }

                        CalculateButton(title: "Calcular") {
                            calculate()
                        }
                    }
                }

                if let result {
                    CalculatorResultView(
                        title: "IVA",
                        mainValue: CurrencyFormatter.cop(result.iva),
                        mainLabel: "IVA",
                        rows: [
                            ("Base gravable", CurrencyFormatter.cop(result.base)),
                            ("IVA (\(CurrencyFormatter.percent(result.tarifa)))", CurrencyFormatter.cop(result.iva)),
                            ("Total", CurrencyFormatter.cop(result.total)),
                        ],
                        disclaimer: "IVA general 19% (Art. 468 ET), IVA reducido 5% (Art. 468-1 ET). Bienes exentos Art. 477, excluidos Art. 424."
                    )
                }
            }
            .padding(.horizontal, AppSpacing.sm)
            .padding(.bottom, AppSpacing.md)
        }
        .background(Color.appBackground)
        .navigationTitle("IVA")
        .navigationBarTitleDisplayMode(.inline)
    }

    private func calculate() {
        let input = IVACalculator.Input(monto: monto, mode: mode, tarifa: tarifa)
        result = IVACalculator.calculate(input: input)
    }
}
