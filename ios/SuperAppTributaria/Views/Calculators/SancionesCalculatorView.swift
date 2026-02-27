import SwiftUI

struct SancionesCalculatorView: View {

    enum TipoSancion: String, CaseIterable, Identifiable {
        case extemporaneidad = "Extemporaneidad"
        case noDeclarar = "No declarar"
        case correccion = "Correccion"
        case interesMora = "Intereses mora"

        var id: String { rawValue }
    }

    @State private var tipoSancion: TipoSancion = .extemporaneidad

    // Extemporaneidad inputs
    @State private var impuesto: Decimal = 0
    @State private var meses: Int = 1
    @State private var conEmplazamiento: Bool = false
    @State private var primeraInfraccion: Bool = true
    @State private var ingresoBruto: Decimal = 0

    // No declarar inputs
    @State private var ingresosBrutos: Decimal = 0
    @State private var consignaciones: Decimal = 0

    // Correccion inputs
    @State private var mayorValor: Decimal = 0
    @State private var esVoluntaria: Bool = true

    // Intereses mora inputs
    @State private var deuda: Decimal = 0
    @State private var diasMora: Int = 30

    @State private var sancionResult: SancionesCalculator.SancionResult?
    @State private var interesResult: SancionesCalculator.InteresMoraResult?

    var body: some View {
        ScrollView {
            VStack(spacing: AppSpacing.sm) {
                // Type picker
                CardView {
                    VStack(alignment: .leading, spacing: AppSpacing.xs) {
                        Text("Tipo de sancion")
                            .font(AppTypography.label)
                            .foregroundStyle(Color.appMutedForeground)

                        Picker("Tipo", selection: $tipoSancion) {
                            ForEach(TipoSancion.allCases) { tipo in
                                Text(tipo.rawValue).tag(tipo)
                            }
                        }
                        .pickerStyle(.segmented)
                    }
                }

                // Dynamic form
                CardView {
                    VStack(spacing: AppSpacing.sm) {
                        switch tipoSancion {
                        case .extemporaneidad:
                            extemporaneidadForm
                        case .noDeclarar:
                            noDeclarForm
                        case .correccion:
                            correccionForm
                        case .interesMora:
                            interesMoraForm
                        }
                    }
                }

                // Results
                if tipoSancion == .interesMora, let result = interesResult {
                    CalculatorResultView(
                        title: "Intereses Moratorios",
                        mainValue: CurrencyFormatter.cop(result.interesTotal),
                        mainLabel: "Intereses de mora",
                        rows: [
                            ("Deuda original", CurrencyFormatter.cop(result.deuda)),
                            ("Dias en mora", "\(result.diasMora)"),
                            ("Tasa EA", result.periodoLabel),
                            ("Total a pagar", CurrencyFormatter.cop(result.totalAPagar)),
                        ],
                        disclaimer: "Art. 634-635 ET. Tasa de usura para credito de consumo."
                    )
                } else if let result = sancionResult {
                    CalculatorResultView(
                        title: "Sancion",
                        mainValue: CurrencyFormatter.cop(result.sancionFinal),
                        mainLabel: "Sancion a pagar",
                        rows: [
                            ("Sancion bruta", CurrencyFormatter.cop(result.sancionBruta)),
                            ("Tope aplicado", CurrencyFormatter.cop(result.tope)),
                            ("Reduccion Art. 640", result.reduccion > 0 ? CurrencyFormatter.percent(result.reduccion) : "No aplica"),
                            ("Sancion reducida", CurrencyFormatter.cop(result.sancionReducida)),
                            ("Sancion minima (10 UVT)", CurrencyFormatter.cop(result.sancionMinima)),
                        ],
                        disclaimer: result.descripcion
                    )
                }
            }
            .padding(.horizontal, AppSpacing.sm)
            .padding(.bottom, AppSpacing.md)
        }
        .background(Color.appBackground)
        .navigationTitle("Sanciones")
        .navigationBarTitleDisplayMode(.inline)
    }

    // MARK: - Forms

    private var extemporaneidadForm: some View {
        VStack(spacing: AppSpacing.sm) {
            CurrencyInputField(label: "Impuesto a cargo", value: $impuesto)
            CurrencyInputField(label: "Ingresos brutos (si impuesto = 0)", value: $ingresoBruto)
            NumberInputField(label: "Meses de extemporaneidad", value: $meses)
            Toggle("Con emplazamiento (Art. 642)", isOn: $conEmplazamiento)
                .font(AppTypography.bodySmall)
                .tint(Color.appPrimary)
            Toggle("Primera infraccion en 2 anos", isOn: $primeraInfraccion)
                .font(AppTypography.bodySmall)
                .tint(Color.appPrimary)
            CalculateButton(title: "Calcular Sancion") {
                let input = SancionesCalculator.ExtemporaneidadInput(
                    impuesto: impuesto, meses: meses,
                    conEmplazamiento: conEmplazamiento,
                    primeraInfraccion: primeraInfraccion,
                    ingresoBruto: ingresoBruto
                )
                sancionResult = SancionesCalculator.calcExtemporaneidad(input: input)
                interesResult = nil
            }
        }
    }

    private var noDeclarForm: some View {
        VStack(spacing: AppSpacing.sm) {
            CurrencyInputField(label: "Ingresos brutos", value: $ingresosBrutos)
            CurrencyInputField(label: "Consignaciones bancarias", value: $consignaciones)
            CalculateButton(title: "Calcular Sancion") {
                let nd = SancionesCalculator.NoDeclarar(
                    ingresosBrutos: ingresosBrutos,
                    consignaciones: consignaciones,
                    uvt: TaxData.uvt2026
                )
                sancionResult = nd.calculate()
                interesResult = nil
            }
        }
    }

    private var correccionForm: some View {
        VStack(spacing: AppSpacing.sm) {
            CurrencyInputField(label: "Mayor valor a pagar", value: $mayorValor)
            Toggle("Correccion voluntaria", isOn: $esVoluntaria)
                .font(AppTypography.bodySmall)
                .tint(Color.appPrimary)
            Toggle("Primera infraccion en 2 anos", isOn: $primeraInfraccion)
                .font(AppTypography.bodySmall)
                .tint(Color.appPrimary)
            CalculateButton(title: "Calcular Sancion") {
                let input = SancionesCalculator.CorreccionInput(
                    mayorValor: mayorValor,
                    esVoluntaria: esVoluntaria,
                    primeraInfraccion: primeraInfraccion
                )
                sancionResult = SancionesCalculator.calcCorreccion(input: input)
                interesResult = nil
            }
        }
    }

    private var interesMoraForm: some View {
        VStack(spacing: AppSpacing.sm) {
            CurrencyInputField(label: "Deuda tributaria", value: $deuda)
            NumberInputField(label: "Dias en mora", value: $diasMora)
            CalculateButton(title: "Calcular Intereses") {
                let input = SancionesCalculator.InteresMoraInput(deuda: deuda, diasMora: diasMora)
                interesResult = SancionesCalculator.calcInteresMora(input: input)
                sancionResult = nil
            }
        }
    }
}
