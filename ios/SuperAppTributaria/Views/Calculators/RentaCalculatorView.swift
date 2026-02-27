import SwiftUI

struct RentaCalculatorView: View {
    @State private var ingresosBrutos: Decimal = 0
    @State private var deducciones: Decimal = 0
    @State private var rentasExentas: Decimal = 0
    @State private var dependientes: Int = 0
    @State private var aportesVoluntarios: Decimal = 0
    @State private var result: RentaCalculator.Result?

    var body: some View {
        ScrollView {
            VStack(spacing: AppSpacing.sm) {
                // Inputs
                CardView {
                    VStack(spacing: AppSpacing.sm) {
                        CurrencyInputField(label: "Ingresos brutos anuales", value: $ingresosBrutos)
                        CurrencyInputField(label: "Deducciones (Art. 336)", value: $deducciones)
                        CurrencyInputField(label: "Rentas exentas (Art. 206)", value: $rentasExentas)
                        NumberInputField(label: "Numero de dependientes (max 4)", value: $dependientes)
                        CurrencyInputField(label: "Aportes voluntarios a pension", value: $aportesVoluntarios)

                        CalculateButton(title: "Calcular Renta") {
                            calculate()
                        }
                    }
                }

                // Result
                if let result {
                    CalculatorResultView(
                        title: "Impuesto de Renta",
                        mainValue: CurrencyFormatter.cop(result.impuesto),
                        mainLabel: "Impuesto a pagar",
                        rows: [
                            ("Ingresos brutos", CurrencyFormatter.cop(result.ingresosBrutos)),
                            ("Total deducciones aplicadas", CurrencyFormatter.cop(result.totalDeducciones)),
                            ("Renta liquida gravable", CurrencyFormatter.cop(result.rentaLiquida)),
                            ("Renta liquida en UVT", "\(result.rentaLiquidaUVT) UVT"),
                            ("Impuesto en UVT", "\(result.impuestoUVT) UVT"),
                            ("Tarifa efectiva", CurrencyFormatter.percent(result.tarifaEfectiva)),
                        ],
                        disclaimer: "Calculo basado en la tabla marginal Art. 241 ET (cedula general). Limites Ley 2277: rentas exentas max 790 UVT, deducciones + exenciones max 1.340 UVT. Resultado aproximado, consulte a un profesional."
                    )

                    // Marginal breakdown
                    if !result.breakdown.isEmpty {
                        CardView {
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Desglose marginal")
                                    .font(AppTypography.cardHeading)
                                    .foregroundStyle(Color.appForeground)

                                ForEach(Array(result.breakdown.enumerated()), id: \.offset) { _, item in
                                    HStack {
                                        VStack(alignment: .leading, spacing: 2) {
                                            Text("\(CurrencyFormatter.number(item.fromUVT)) - \(item.toUVT >= Decimal.greatestFiniteMagnitude ? "..." : CurrencyFormatter.number(item.toUVT)) UVT")
                                                .font(AppTypography.caption)
                                                .foregroundStyle(Color.appMutedForeground)
                                            Text("Tarifa: \(CurrencyFormatter.percent(item.rate))")
                                                .font(AppTypography.caption)
                                                .foregroundStyle(Color.appMutedForeground)
                                        }
                                        Spacer()
                                        Text(CurrencyFormatter.cop(item.impuestoCOP))
                                            .font(AppTypography.bodySmall)
                                            .fontWeight(.medium)
                                            .foregroundStyle(Color.appForeground)
                                    }
                                    if item.fromUVT != result.breakdown.last?.fromUVT {
                                        Divider()
                                    }
                                }
                            }
                        }
                    }
                }
            }
            .padding(.horizontal, AppSpacing.sm)
            .padding(.bottom, AppSpacing.md)
        }
        .background(Color.appBackground)
        .navigationTitle("Renta PN")
        .navigationBarTitleDisplayMode(.inline)
    }

    private func calculate() {
        let input = RentaCalculator.Input(
            ingresosBrutos: ingresosBrutos,
            deducciones: deducciones,
            rentasExentas: rentasExentas,
            dependientes: dependientes,
            aportesVoluntarios: aportesVoluntarios
        )
        result = RentaCalculator.calculate(input: input)
    }
}
