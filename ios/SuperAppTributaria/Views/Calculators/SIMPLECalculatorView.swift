import SwiftUI

struct SIMPLECalculatorView: View {
    @State private var ingresosBrutos: Decimal = 0
    @State private var grupoId: Int = 1
    @State private var costosDeducciones: Decimal = 0
    @State private var usaCostosReales: Bool = false
    @State private var margenUtilidad: Decimal = 30
    @State private var result: SIMPLECalculator.Result?

    var body: some View {
        ScrollView {
            VStack(spacing: AppSpacing.sm) {
                CardView {
                    VStack(spacing: AppSpacing.sm) {
                        // Activity group picker
                        VStack(alignment: .leading, spacing: 4) {
                            Text("Grupo de actividad economica")
                                .font(AppTypography.label)
                                .foregroundStyle(Color.appMutedForeground)

                            Picker("Grupo", selection: $grupoId) {
                                ForEach(TaxData.simpleGroups) { group in
                                    Text(group.label).tag(group.id)
                                }
                            }
                            .pickerStyle(.menu)
                            .tint(Color.appForeground)
                        }

                        CurrencyInputField(label: "Ingresos brutos anuales", value: $ingresosBrutos)

                        // Cost estimation toggle
                        Toggle(isOn: $usaCostosReales) {
                            Text("Usar costos reales")
                                .font(AppTypography.bodySmall)
                                .foregroundStyle(Color.appForeground)
                        }
                        .tint(Color.appPrimary)

                        if usaCostosReales {
                            CurrencyInputField(label: "Costos y deducciones", value: $costosDeducciones)
                        } else {
                            PercentageInputField(label: "Margen de utilidad estimado", value: $margenUtilidad)
                        }

                        CalculateButton(title: "Comparar Regimenes") {
                            calculate()
                        }
                    }
                }

                if let result {
                    // SIMPLE result
                    CalculatorResultView(
                        title: "Regimen SIMPLE",
                        mainValue: CurrencyFormatter.cop(result.impuestoSIMPLE),
                        mainLabel: "Impuesto SIMPLE",
                        rows: [
                            ("Grupo", result.grupo),
                            ("Ingresos en UVT", "\(result.ingresosUVT) UVT"),
                            ("Tarifa SIMPLE", CurrencyFormatter.percent(result.tarifaSIMPLE)),
                            ("Impuesto SIMPLE", CurrencyFormatter.cop(result.impuestoSIMPLE)),
                        ]
                    )

                    // Comparison
                    CardView {
                        VStack(alignment: .leading, spacing: AppSpacing.xs) {
                            Text("Comparacion con Ordinario")
                                .font(AppTypography.cardHeading)
                                .foregroundStyle(Color.appForeground)

                            ResultRow(label: "Utilidad estimada", value: CurrencyFormatter.cop(result.utilidadEstimada))
                            Divider()
                            ResultRow(label: "Impuesto Ordinario", value: CurrencyFormatter.cop(result.impuestoOrdinario))
                            Divider()
                            ResultRow(label: "Impuesto SIMPLE", value: CurrencyFormatter.cop(result.impuestoSIMPLE))
                            Divider()
                            ResultRow(
                                label: result.convieneSIMPLE ? "Ahorro con SIMPLE" : "Mayor costo SIMPLE",
                                value: CurrencyFormatter.cop(abs(result.ahorro)),
                                isHighlighted: true
                            )

                            HStack {
                                Image(systemName: result.convieneSIMPLE ? "checkmark.circle.fill" : "xmark.circle.fill")
                                    .foregroundStyle(result.convieneSIMPLE ? Color.appSuccess : Color.appDestructive)
                                Text(result.convieneSIMPLE ? "SIMPLE es mas favorable" : "Ordinario es mas favorable")
                                    .font(AppTypography.bodySmall)
                                    .fontWeight(.semibold)
                                    .foregroundStyle(Color.appForeground)
                            }
                            .padding(.top, 4)
                        }
                    }
                }
            }
            .padding(.horizontal, AppSpacing.sm)
            .padding(.bottom, AppSpacing.md)
        }
        .background(Color.appBackground)
        .navigationTitle("SIMPLE vs Ordinario")
        .navigationBarTitleDisplayMode(.inline)
    }

    private func calculate() {
        let input = SIMPLECalculator.Input(
            ingresosBrutos: ingresosBrutos,
            grupoId: grupoId,
            costosDeducciones: costosDeducciones,
            usaCostosReales: usaCostosReales,
            margenUtilidad: margenUtilidad
        )
        result = SIMPLECalculator.calculate(input: input)
    }
}
