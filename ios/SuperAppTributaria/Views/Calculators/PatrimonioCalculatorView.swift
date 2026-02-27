import SwiftUI

struct PatrimonioCalculatorView: View {

    enum Section: String, CaseIterable, Identifiable {
        case patrimonio = "Impuesto"
        case comparacion = "Comparacion"
        var id: String { rawValue }
    }

    @State private var selectedSection: Section = .patrimonio

    // Patrimonio inputs
    @State private var patrimonioBruto: Decimal = 0
    @State private var deudas: Decimal = 0
    @State private var valorVivienda: Decimal = 0
    @State private var otrasExclusiones: Decimal = 0
    @State private var patrimonioResult: PatrimonioCalculator.Result?

    // Comparacion inputs
    @State private var patrimonioAnterior: Decimal = 0
    @State private var patrimonioActual: Decimal = 0
    @State private var rentaDeclarada: Decimal = 0
    @State private var gananciasOcasionales: Decimal = 0
    @State private var comparacionResult: PatrimonioCalculator.ComparacionResult?

    var body: some View {
        ScrollView {
            VStack(spacing: AppSpacing.sm) {
                // Section picker
                CardView {
                    Picker("Seccion", selection: $selectedSection) {
                        ForEach(Section.allCases) { section in
                            Text(section.rawValue).tag(section)
                        }
                    }
                    .pickerStyle(.segmented)
                }

                switch selectedSection {
                case .patrimonio: patrimonioForm
                case .comparacion: comparacionForm
                }
            }
            .padding(.horizontal, AppSpacing.sm)
            .padding(.bottom, AppSpacing.md)
        }
        .background(Color.appBackground)
        .navigationTitle("Patrimonio")
        .navigationBarTitleDisplayMode(.inline)
    }

    private var patrimonioForm: some View {
        VStack(spacing: AppSpacing.sm) {
            CardView {
                VStack(spacing: AppSpacing.sm) {
                    CurrencyInputField(label: "Patrimonio bruto", value: $patrimonioBruto)
                    CurrencyInputField(label: "Deudas", value: $deudas)
                    CurrencyInputField(label: "Valor vivienda principal", value: $valorVivienda)
                    CurrencyInputField(label: "Otras exclusiones", value: $otrasExclusiones)

                    CalculateButton(title: "Calcular Patrimonio") {
                        let input = PatrimonioCalculator.Input(
                            patrimonioBruto: patrimonioBruto,
                            deudas: deudas,
                            valorVivienda: valorVivienda,
                            otrasExclusiones: otrasExclusiones
                        )
                        patrimonioResult = PatrimonioCalculator.calculate(input: input)
                    }
                }
            }

            if let r = patrimonioResult {
                CalculatorResultView(
                    title: "Impuesto al Patrimonio",
                    mainValue: CurrencyFormatter.cop(r.impuesto),
                    mainLabel: r.aplica ? "Impuesto a pagar" : "No aplica impuesto",
                    rows: [
                        ("Patrimonio liquido", CurrencyFormatter.cop(r.patrimonioLiquido)),
                        ("Exclusion vivienda", CurrencyFormatter.cop(r.exclusionVivienda)),
                        ("Base gravable", CurrencyFormatter.cop(r.baseGravable)),
                        ("Base en UVT", "\(r.baseGravableUVT) UVT"),
                        ("Umbral (40,000 UVT)", CurrencyFormatter.cop(TaxData.patrimonioThresholdUVT * TaxData.uvt2026)),
                        ("Tarifa efectiva", CurrencyFormatter.percent(r.tarifaEfectiva)),
                    ],
                    disclaimer: "Art. 292-2, 296-3 ET. Exclusion vivienda max 12,000 UVT. Tabla progresiva 0.5% - 5%."
                )
            }
        }
    }

    private var comparacionForm: some View {
        VStack(spacing: AppSpacing.sm) {
            CardView {
                VStack(spacing: AppSpacing.sm) {
                    CurrencyInputField(label: "Patrimonio liquido ano anterior", value: $patrimonioAnterior)
                    CurrencyInputField(label: "Patrimonio liquido ano actual", value: $patrimonioActual)
                    CurrencyInputField(label: "Renta liquida declarada", value: $rentaDeclarada)
                    CurrencyInputField(label: "Ganancias ocasionales", value: $gananciasOcasionales)

                    CalculateButton(title: "Comparar Patrimonios") {
                        let input = PatrimonioCalculator.ComparacionInput(
                            patrimonioAnterior: patrimonioAnterior,
                            patrimonioActual: patrimonioActual,
                            rentaDeclarada: rentaDeclarada,
                            gananciasOcasionales: gananciasOcasionales
                        )
                        comparacionResult = PatrimonioCalculator.calcComparacion(input: input)
                    }
                }
            }

            if let r = comparacionResult {
                CalculatorResultView(
                    title: "Comparacion Patrimonial",
                    mainValue: CurrencyFormatter.cop(r.rentaNoJustificada),
                    mainLabel: r.tieneRiesgo ? "Renta NO justificada" : "Sin riesgo",
                    rows: [
                        ("Incremento patrimonial", CurrencyFormatter.cop(r.incrementoPatrimonial)),
                        ("Renta justificada", CurrencyFormatter.cop(r.rentaJustificada)),
                        ("Renta no justificada", CurrencyFormatter.cop(r.rentaNoJustificada)),
                    ],
                    disclaimer: "Art. 236, 239 ET. La DIAN puede considerar como renta liquida gravable el incremento patrimonial no justificado."
                )

                if r.tieneRiesgo {
                    HStack(spacing: 8) {
                        Image(systemName: "exclamationmark.triangle.fill")
                            .foregroundStyle(Color.appDestructive)
                        Text("Existe un incremento patrimonial que no esta justificado por la renta declarada. Esto puede generar requerimiento de la DIAN.")
                            .font(AppTypography.bodySmall)
                            .foregroundStyle(Color.appForeground)
                    }
                    .padding(12)
                    .background(Color.appDestructive.opacity(0.1))
                    .clipShape(RoundedRectangle(cornerRadius: AppRadius.card))
                }
            }
        }
    }
}
