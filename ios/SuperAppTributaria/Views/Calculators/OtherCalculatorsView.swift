import SwiftUI

struct OtherCalculatorsView: View {
    let calculatorId: String

    var body: some View {
        ScrollView {
            VStack(spacing: AppSpacing.sm) {
                switch calculatorId {
                case "uvt":
                    UVTConverterSection()
                case "gmf":
                    GMFSection()
                case "debo-declarar":
                    DeboDeclarSection()
                case "dividendos":
                    DividendosSection()
                case "ganancias-ocasionales", "ganancias-loterias":
                    GananciasSection()
                case "herencias":
                    HerenciasSection()
                case "timbre":
                    TimbreSection()
                case "anticipo":
                    AnticipoSection()
                case "beneficio-auditoria":
                    BeneficioAuditoriaSection()
                case "pension":
                    PensionSection()
                case "depreciacion":
                    DepreciacionSection()
                case "consumo":
                    ConsumoSection()
                case "renta-juridicas", "zonas-francas":
                    RentaJuridicasSection()
                case "descuentos-tributarios":
                    DescuentosSection()
                case "dividendos-juridicas":
                    DividendosPJSection()
                case "comparador":
                    ComparadorSection()
                case "ica":
                    ICASection()
                default:
                    genericPlaceholder
                }
            }
            .padding(.horizontal, AppSpacing.sm)
            .padding(.bottom, AppSpacing.md)
        }
        .background(Color.appBackground)
        .navigationTitle(CalculatorCatalog.item(byId: calculatorId)?.title ?? "Calculadora")
        .navigationBarTitleDisplayMode(.inline)
    }

    private var genericPlaceholder: some View {
        placeholderCard(
            title: CalculatorCatalog.item(byId: calculatorId)?.title ?? "Calculadora",
            description: CalculatorCatalog.item(byId: calculatorId)?.description ?? "Proximamente disponible."
        )
    }

    private func placeholderCard(title: String, description: String) -> some View {
        CardView {
            VStack(alignment: .leading, spacing: AppSpacing.xs) {
                Image(systemName: CalculatorCatalog.item(byId: calculatorId)?.sfSymbol ?? "function")
                    .font(.system(size: 32))
                    .foregroundStyle(Color.appMutedForeground)

                Text(title)
                    .font(AppTypography.cardHeading)
                    .foregroundStyle(Color.appForeground)

                Text(description)
                    .font(AppTypography.bodySmall)
                    .foregroundStyle(Color.appMutedForeground)
            }
        }
    }
}

// MARK: - UVT Converter

private struct UVTConverterSection: View {
    @State private var uvtValue: Decimal = 0
    @State private var copValue: Decimal = 0
    @State private var selectedYear: Int = 2026
    @State private var resultUVTtoCOP: UVTConverter.Result?
    @State private var resultCOPtoUVT: UVTConverter.Result?

    var body: some View {
        CardView {
            VStack(spacing: AppSpacing.sm) {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Ano")
                        .font(AppTypography.label)
                        .foregroundStyle(Color.appMutedForeground)
                    Picker("Ano", selection: $selectedYear) {
                        ForEach(Array(TaxData.uvtValues.keys).sorted().reversed(), id: \.self) { year in
                            Text("\(year)").tag(year)
                        }
                    }
                    .pickerStyle(.menu)
                    .tint(Color.appForeground)
                }

                DecimalInputField(label: "UVT", value: $uvtValue, suffix: "UVT")
                CalculateButton(title: "UVT a COP") {
                    resultUVTtoCOP = UVTConverter.uvtToCOP(uvt: uvtValue, year: selectedYear)
                }

                if let r = resultUVTtoCOP {
                    ResultRow(label: "\(CurrencyFormatter.number(r.uvt)) UVT (\(r.year))", value: CurrencyFormatter.cop(r.cop), isHighlighted: true)
                }

                Divider()

                CurrencyInputField(label: "Pesos colombianos", value: $copValue)
                CalculateButton(title: "COP a UVT") {
                    resultCOPtoUVT = UVTConverter.copToUVT(cop: copValue, year: selectedYear)
                }

                if let r = resultCOPtoUVT {
                    ResultRow(label: CurrencyFormatter.cop(r.cop), value: "\(r.uvt) UVT", isHighlighted: true)
                }
            }
        }
    }
}

// MARK: - GMF

private struct GMFSection: View {
    @State private var monto: Decimal = 0
    @State private var cuentaExenta: Bool = false
    @State private var result: GMFCalculator.Result?

    var body: some View {
        CardView {
            VStack(spacing: AppSpacing.sm) {
                CurrencyInputField(label: "Monto de la transaccion", value: $monto)
                Toggle("Cuenta exenta (marcada)", isOn: $cuentaExenta)
                    .font(AppTypography.bodySmall)
                    .tint(Color.appPrimary)
                CalculateButton(title: "Calcular GMF") {
                    result = GMFCalculator.calculate(input: GMFCalculator.Input(monto: monto, cuentaExenta: cuentaExenta))
                }
            }
        }

        if let r = result {
            CalculatorResultView(
                title: "GMF (4x1000)",
                mainValue: CurrencyFormatter.cop(r.gmf),
                mainLabel: "GMF a pagar",
                rows: [
                    ("Monto transaccion", CurrencyFormatter.cop(r.monto)),
                    ("Monto exento", CurrencyFormatter.cop(r.montoExento)),
                    ("Base gravable", CurrencyFormatter.cop(r.montoGravado)),
                ],
                disclaimer: "Art. 871, 879 ET. Exencion 350 UVT mensuales por cuenta marcada."
            )
        }
    }
}

// MARK: - Debo Declarar

private struct DeboDeclarSection: View {
    @State private var patrimonioBruto: Decimal = 0
    @State private var ingresosBrutos: Decimal = 0
    @State private var consumosTarjeta: Decimal = 0
    @State private var comprasTotales: Decimal = 0
    @State private var consignaciones: Decimal = 0
    @State private var result: DeboDeclarar.Result?

    var body: some View {
        CardView {
            VStack(spacing: AppSpacing.sm) {
                CurrencyInputField(label: "Patrimonio bruto a 31/dic", value: $patrimonioBruto)
                CurrencyInputField(label: "Ingresos brutos del ano", value: $ingresosBrutos)
                CurrencyInputField(label: "Consumos con tarjeta credito", value: $consumosTarjeta)
                CurrencyInputField(label: "Compras totales del ano", value: $comprasTotales)
                CurrencyInputField(label: "Consignaciones bancarias", value: $consignaciones)

                CalculateButton(title: "Verificar") {
                    result = DeboDeclarar.verificar(input: DeboDeclarar.Input(
                        patrimonioBruto: patrimonioBruto,
                        ingresosBrutos: ingresosBrutos,
                        consumosTarjeta: consumosTarjeta,
                        comprasTotales: comprasTotales,
                        consignaciones: consignaciones
                    ))
                }
            }
        }

        if let r = result {
            CardView {
                VStack(alignment: .leading, spacing: AppSpacing.xs) {
                    HStack(spacing: 8) {
                        Image(systemName: r.debeDeclarar ? "exclamationmark.circle.fill" : "checkmark.circle.fill")
                            .font(.system(size: 24))
                            .foregroundStyle(r.debeDeclarar ? Color.appDestructive : Color.appSuccess)

                        Text(r.debeDeclarar ? "SI debe declarar renta" : "NO esta obligado a declarar")
                            .font(AppTypography.cardHeading)
                            .foregroundStyle(Color.appForeground)
                    }

                    ForEach(Array(r.criterios.enumerated()), id: \.offset) { _, criterio in
                        HStack {
                            Image(systemName: criterio.supera ? "xmark.circle" : "checkmark.circle")
                                .foregroundStyle(criterio.supera ? Color.appDestructive : Color.appSuccess)
                                .font(.system(size: 14))

                            VStack(alignment: .leading, spacing: 2) {
                                Text(criterio.nombre)
                                    .font(AppTypography.bodySmall)
                                    .foregroundStyle(Color.appForeground)
                                Text("Tope: \(CurrencyFormatter.cop(criterio.topeCOP)) (\(CurrencyFormatter.number(criterio.tope)) UVT)")
                                    .font(AppTypography.caption)
                                    .foregroundStyle(Color.appMutedForeground)
                            }

                            Spacer()

                            Text(CurrencyFormatter.cop(criterio.valor))
                                .font(AppTypography.bodySmall)
                                .fontWeight(.medium)
                                .foregroundStyle(criterio.supera ? Color.appDestructive : Color.appForeground)
                        }
                        .padding(.vertical, 4)

                        if criterio.nombre != r.criterios.last?.nombre {
                            Divider()
                        }
                    }
                }
            }
        }
    }
}

// MARK: - Dividendos

private struct DividendosSection: View {
    @State private var dividendos: Decimal = 0
    @State private var gravados: Bool = true
    @State private var result: DividendosCalculator.Result?

    var body: some View {
        CardView {
            VStack(spacing: AppSpacing.sm) {
                CurrencyInputField(label: "Dividendos recibidos", value: $dividendos)
                Toggle("Gravados a nivel societario", isOn: $gravados)
                    .font(AppTypography.bodySmall)
                    .tint(Color.appPrimary)
                CalculateButton(title: "Calcular") {
                    result = DividendosCalculator.calculate(input: DividendosCalculator.Input(dividendos: dividendos, gravadosSocietario: gravados))
                }
            }
        }

        if let r = result {
            CalculatorResultView(
                title: "Dividendos PN",
                mainValue: CurrencyFormatter.cop(r.impuesto),
                mainLabel: "Impuesto sobre dividendos",
                rows: [
                    ("Dividendos", CurrencyFormatter.cop(r.dividendos)),
                    ("Tarifa efectiva", CurrencyFormatter.percent(r.tarifaEfectiva)),
                ],
                disclaimer: "Art. 242 ET. Tabla para PN residentes. Dividendos no gravados a nivel societario: 35% + tabla."
            )
        }
    }
}

// MARK: - Ganancias Ocasionales

private struct GananciasSection: View {
    @State private var valorVenta: Decimal = 0
    @State private var costoFiscal: Decimal = 0
    @State private var result: GananciasOcasionalesCalculator.Result?

    var body: some View {
        CardView {
            VStack(spacing: AppSpacing.sm) {
                CurrencyInputField(label: "Valor de venta", value: $valorVenta)
                CurrencyInputField(label: "Costo fiscal del activo", value: $costoFiscal)
                CalculateButton(title: "Calcular") {
                    result = GananciasOcasionalesCalculator.calculate(input: GananciasOcasionalesCalculator.Input(valorVenta: valorVenta, costoFiscal: costoFiscal))
                }
            }
        }

        if let r = result {
            CalculatorResultView(
                title: "Ganancias Ocasionales",
                mainValue: CurrencyFormatter.cop(r.impuesto),
                mainLabel: "Impuesto (15%)",
                rows: [
                    ("Ganancia bruta", CurrencyFormatter.cop(r.ganancia)),
                    ("Exencion vivienda (5,000 UVT)", CurrencyFormatter.cop(r.exencion)),
                    ("Base gravable", CurrencyFormatter.cop(r.baseGravable)),
                ],
                disclaimer: "Art. 313, 314 ET. Tarifa 15%. Exencion primeras 5,000 UVT para vivienda."
            )
        }
    }
}

// MARK: - Herencias

private struct HerenciasSection: View {
    @State private var valorHerencia: Decimal = 0
    @State private var esVivienda: Bool = false
    @State private var result: HerenciasCalculator.Result?

    var body: some View {
        CardView {
            VStack(spacing: AppSpacing.sm) {
                CurrencyInputField(label: "Valor de la herencia", value: $valorHerencia)
                Toggle("Es vivienda de habitacion", isOn: $esVivienda)
                    .font(AppTypography.bodySmall)
                    .tint(Color.appPrimary)
                CalculateButton(title: "Calcular") {
                    result = HerenciasCalculator.calculate(input: HerenciasCalculator.Input(valorHerencia: valorHerencia, esVivienda: esVivienda))
                }
            }
        }

        if let r = result {
            CalculatorResultView(
                title: "Herencias",
                mainValue: CurrencyFormatter.cop(r.impuesto),
                mainLabel: "Impuesto (15%)",
                rows: [
                    ("Valor herencia", CurrencyFormatter.cop(r.valorHerencia)),
                    ("Exencion", CurrencyFormatter.cop(r.exencion)),
                    ("Base gravable", CurrencyFormatter.cop(r.baseGravable)),
                ],
                disclaimer: "Art. 302, 307 ET. Exencion vivienda: 13,000 UVT. Exencion herederos: 3,250 UVT."
            )
        }
    }
}

// MARK: - Timbre

private struct TimbreSection: View {
    @State private var valor: Decimal = 0
    @State private var result: TimbreCalculator.Result?

    var body: some View {
        CardView {
            VStack(spacing: AppSpacing.sm) {
                CurrencyInputField(label: "Valor del documento", value: $valor)
                CalculateButton(title: "Calcular") {
                    result = TimbreCalculator.calculate(input: TimbreCalculator.Input(valorDocumento: valor))
                }
            }
        }

        if let r = result {
            CalculatorResultView(
                title: "Timbre",
                mainValue: CurrencyFormatter.cop(r.impuesto),
                mainLabel: r.aplica ? "Impuesto de timbre (1%)" : "No aplica (bajo umbral)",
                rows: [
                    ("Valor documento", CurrencyFormatter.cop(r.valor)),
                    ("Umbral (6,000 UVT)", CurrencyFormatter.cop(r.umbral)),
                ],
                disclaimer: "Art. 519 ET. Aplica 1% sobre documentos que superen 6,000 UVT."
            )
        }
    }
}

// MARK: - Anticipo

private struct AnticipoSection: View {
    @State private var impuestoNeto: Decimal = 0
    @State private var retenciones: Decimal = 0
    @State private var anoDeclaracion: AnticipoCalculator.AnoDeclaracion = .subsiguientes
    @State private var result: AnticipoCalculator.Result?

    var body: some View {
        CardView {
            VStack(spacing: AppSpacing.sm) {
                CurrencyInputField(label: "Impuesto neto de renta", value: $impuestoNeto)
                CurrencyInputField(label: "Retenciones ano anterior", value: $retenciones)

                VStack(alignment: .leading, spacing: 4) {
                    Text("Ano de declaracion")
                        .font(AppTypography.label)
                        .foregroundStyle(Color.appMutedForeground)
                    Picker("Ano", selection: $anoDeclaracion) {
                        ForEach(AnticipoCalculator.AnoDeclaracion.allCases) { a in
                            Text(a.rawValue).tag(a)
                        }
                    }
                    .pickerStyle(.menu)
                    .tint(Color.appForeground)
                }

                CalculateButton(title: "Calcular Anticipo") {
                    result = AnticipoCalculator.calculate(input: AnticipoCalculator.Input(impuestoNeto: impuestoNeto, retencionesAnoPrevio: retenciones, anoDeclaracion: anoDeclaracion))
                }
            }
        }

        if let r = result {
            CalculatorResultView(
                title: "Anticipo de Renta",
                mainValue: CurrencyFormatter.cop(r.anticipoNeto),
                mainLabel: "Anticipo a pagar",
                rows: [
                    ("Porcentaje", CurrencyFormatter.percent(r.porcentaje)),
                    ("Anticipo bruto", CurrencyFormatter.cop(r.anticipoBruto)),
                    ("Retenciones descontadas", CurrencyFormatter.cop(r.retencionesDescontadas)),
                ],
                disclaimer: "Art. 807 ET. Primer ano: 25%, segundo: 50%, tercero en adelante: 75%."
            )
        }
    }
}

// MARK: - Beneficio Auditoria

private struct BeneficioAuditoriaSection: View {
    @State private var impuestoPrevio: Decimal = 0
    @State private var impuestoActual: Decimal = 0
    @State private var result: BeneficioAuditoriaCalculator.Result?

    var body: some View {
        CardView {
            VStack(spacing: AppSpacing.sm) {
                CurrencyInputField(label: "Impuesto neto ano anterior", value: $impuestoPrevio)
                CurrencyInputField(label: "Impuesto neto ano actual", value: $impuestoActual)
                CalculateButton(title: "Verificar Beneficio") {
                    result = BeneficioAuditoriaCalculator.calculate(input: BeneficioAuditoriaCalculator.Input(impuestoAnoPrevio: impuestoPrevio, impuestoAnoActual: impuestoActual))
                }
            }
        }

        if let r = result {
            CalculatorResultView(
                title: "Beneficio de Auditoria",
                mainValue: "\(r.mesesFirmeza) meses",
                mainLabel: "Periodo de firmeza",
                rows: [
                    ("Incremento", CurrencyFormatter.cop(r.incremento)),
                    ("Incremento %", CurrencyFormatter.percent(r.incrementoPct)),
                    ("Cumple minimo (71 UVT)", r.cumpleMinimo ? "Si" : "No"),
                    ("Firmeza 6 meses (>= 35%)", r.firmeza6Meses ? "Si" : "No"),
                    ("Firmeza 12 meses (>= 25%)", r.firmeza12Meses ? "Si" : "No"),
                ],
                disclaimer: "Art. 689-3 ET. Vigencia 2022-2026. Impuesto neto minimo 71 UVT."
            )
        }
    }
}

// MARK: - Pension

private struct PensionSection: View {
    @State private var genero: String = "hombre"
    @State private var fechaNacimiento: Date = Calendar.current.date(byAdding: .year, value: -50, to: Date()) ?? Date()
    @State private var semanasActuales: Int = 800
    @State private var anoRetiro: Int = 2030
    @State private var result: PensionVerificador.Result?

    var body: some View {
        CardView {
            VStack(spacing: AppSpacing.sm) {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Genero")
                        .font(AppTypography.label)
                        .foregroundStyle(Color.appMutedForeground)
                    Picker("Genero", selection: $genero) {
                        Text("Hombre").tag("hombre")
                        Text("Mujer").tag("mujer")
                    }
                    .pickerStyle(.segmented)
                }

                DatePicker("Fecha de nacimiento", selection: $fechaNacimiento, displayedComponents: .date)
                    .font(AppTypography.bodySmall)

                NumberInputField(label: "Semanas cotizadas actuales", value: $semanasActuales)
                NumberInputField(label: "Ano proyectado de retiro", value: $anoRetiro)

                CalculateButton(title: "Verificar Pension") {
                    result = PensionVerificador.verificar(input: PensionVerificador.Input(
                        genero: genero, fechaNacimiento: fechaNacimiento,
                        semanasActuales: semanasActuales, anoRetiro: anoRetiro
                    ))
                }
            }
        }

        if let r = result {
            CalculatorResultView(
                title: "Verificador de Pension",
                mainValue: (r.cumpleEdad && r.cumpleSemanas) ? "Cumple requisitos" : "No cumple aun",
                mainLabel: "Estado",
                rows: [
                    ("Edad actual", "\(r.edadActual) anos"),
                    ("Edad requerida", "\(r.edadRequerida) anos"),
                    ("Cumple edad", r.cumpleEdad ? "Si" : "No"),
                    ("Semanas requeridas", "\(r.semanasRequeridas)"),
                    ("Faltan semanas", "\(r.faltanSemanas)"),
                ],
                disclaimer: "Ley 100/1993, Ley 797/2003. Mujeres: reduccion progresiva de semanas por Ley 2381/2024."
            )
        }
    }
}

// MARK: - Depreciacion

private struct DepreciacionSection: View {
    @State private var valorActivo: Decimal = 0
    @State private var tipoActivo: String = "maquinaria"
    @State private var anosUso: Int = 0
    @State private var result: DepreciacionCalculator.Result?

    var body: some View {
        CardView {
            VStack(spacing: AppSpacing.sm) {
                CurrencyInputField(label: "Valor del activo", value: $valorActivo)

                VStack(alignment: .leading, spacing: 4) {
                    Text("Tipo de activo")
                        .font(AppTypography.label)
                        .foregroundStyle(Color.appMutedForeground)
                    Picker("Tipo", selection: $tipoActivo) {
                        ForEach(TaxData.depreciacionTasas, id: \.tipo) { t in
                            Text(t.label).tag(t.tipo)
                        }
                    }
                    .pickerStyle(.menu)
                    .tint(Color.appForeground)
                }

                NumberInputField(label: "Anos en uso", value: $anosUso)

                CalculateButton(title: "Calcular Depreciacion") {
                    result = DepreciacionCalculator.calculate(input: DepreciacionCalculator.Input(valorActivo: valorActivo, tipoActivo: tipoActivo, anosUso: anosUso))
                }
            }
        }

        if let r = result {
            CalculatorResultView(
                title: "Depreciacion Fiscal",
                mainValue: CurrencyFormatter.cop(r.depreciacionAnual),
                mainLabel: "Depreciacion anual",
                rows: [
                    ("Tipo activo", r.label),
                    ("Vida util", "\(r.vidaUtil) anos"),
                    ("Tasa anual", CurrencyFormatter.percent(r.tasaAnual)),
                    ("Depreciacion acumulada", CurrencyFormatter.cop(r.depreciacionAcumulada)),
                    ("Valor residual", CurrencyFormatter.cop(r.valorResidual)),
                ],
                disclaimer: "Art. 137 ET. Metodo linea recta."
            )
        }
    }
}

// MARK: - Consumo

private struct ConsumoSection: View {
    @State private var monto: Decimal = 0
    @State private var tipoConsumo: String = "restaurantes"
    @State private var result: ConsumoCalculator.Result?

    var body: some View {
        CardView {
            VStack(spacing: AppSpacing.sm) {
                CurrencyInputField(label: "Monto base", value: $monto)

                VStack(alignment: .leading, spacing: 4) {
                    Text("Tipo de consumo")
                        .font(AppTypography.label)
                        .foregroundStyle(Color.appMutedForeground)
                    Picker("Tipo", selection: $tipoConsumo) {
                        ForEach(TaxData.consumoTarifas, id: \.tipo) { t in
                            Text(t.label).tag(t.tipo)
                        }
                    }
                    .pickerStyle(.menu)
                    .tint(Color.appForeground)
                }

                CalculateButton(title: "Calcular") {
                    result = ConsumoCalculator.calculate(input: ConsumoCalculator.Input(monto: monto, tipoConsumo: tipoConsumo))
                }
            }
        }

        if let r = result {
            CalculatorResultView(
                title: "Impuesto al Consumo",
                mainValue: CurrencyFormatter.cop(r.impuesto),
                mainLabel: "INC (\(CurrencyFormatter.percent(r.tarifa)))",
                rows: [
                    ("Base", CurrencyFormatter.cop(r.base)),
                    ("Total con INC", CurrencyFormatter.cop(r.total)),
                ],
                disclaimer: "Art. 512-1 ET."
            )
        }
    }
}

// MARK: - Renta Juridicas

private struct RentaJuridicasSection: View {
    @State private var rentaLiquida: Decimal = 0
    @State private var sector: String = "general"
    @State private var result: RentaJuridicasCalculator.Result?

    var body: some View {
        CardView {
            VStack(spacing: AppSpacing.sm) {
                CurrencyInputField(label: "Renta liquida gravable", value: $rentaLiquida)

                VStack(alignment: .leading, spacing: 4) {
                    Text("Sector economico")
                        .font(AppTypography.label)
                        .foregroundStyle(Color.appMutedForeground)
                    Picker("Sector", selection: $sector) {
                        ForEach(TaxData.pjRates, id: \.sector) { rate in
                            Text(rate.label).tag(rate.sector)
                        }
                    }
                    .pickerStyle(.menu)
                    .tint(Color.appForeground)
                }

                CalculateButton(title: "Calcular Renta PJ") {
                    result = RentaJuridicasCalculator.calculate(input: RentaJuridicasCalculator.Input(rentaLiquida: rentaLiquida, sector: sector))
                }
            }
        }

        if let r = result {
            CalculatorResultView(
                title: "Renta PJ",
                mainValue: CurrencyFormatter.cop(r.totalImpuesto),
                mainLabel: "Impuesto total",
                rows: [
                    ("Sector", r.sector),
                    ("Tarifa", CurrencyFormatter.percent(r.tarifa)),
                    ("Impuesto base", CurrencyFormatter.cop(r.impuesto)),
                    ("Sobretasa financiero", CurrencyFormatter.cop(r.sobretasa)),
                ],
                disclaimer: "Art. 240 ET. Sobretasa financiero: 15% adicional sobre renta > 120,000 UVT (Dto 1474/2025)."
            )
        }
    }
}

// MARK: - Descuentos Tributarios

private struct DescuentosSection: View {
    @State private var impuestoNeto: Decimal = 0
    @State private var ivaActivos: Decimal = 0
    @State private var donaciones: Decimal = 0
    @State private var impuestoExterior: Decimal = 0
    @State private var result: DescuentosCalculator.Result?

    var body: some View {
        CardView {
            VStack(spacing: AppSpacing.sm) {
                CurrencyInputField(label: "Impuesto neto de renta", value: $impuestoNeto)
                CurrencyInputField(label: "IVA activos productivos (Art. 258-1)", value: $ivaActivos)
                CurrencyInputField(label: "Donaciones realizadas (Art. 257)", value: $donaciones)
                CurrencyInputField(label: "Impuestos pagados exterior (Art. 254)", value: $impuestoExterior)

                CalculateButton(title: "Calcular Descuentos") {
                    result = DescuentosCalculator.calculate(input: DescuentosCalculator.Input(
                        impuestoNeto: impuestoNeto,
                        ivaActivosProductivos: ivaActivos,
                        donaciones: donaciones,
                        impuestoExterior: impuestoExterior
                    ))
                }
            }
        }

        if let r = result {
            CalculatorResultView(
                title: "Descuentos Tributarios",
                mainValue: CurrencyFormatter.cop(r.totalDescuentos),
                mainLabel: "Total descuentos aplicables",
                rows: [
                    ("Impuesto neto", CurrencyFormatter.cop(r.impuestoNeto)),
                    ("Descuento IVA activos", CurrencyFormatter.cop(r.descuentoIVA)),
                    ("Descuento donaciones (25%)", CurrencyFormatter.cop(r.descuentoDonaciones)),
                    ("Descuento impuesto exterior", CurrencyFormatter.cop(r.descuentoExterior)),
                    ("Impuesto final", CurrencyFormatter.cop(r.impuestoFinal)),
                ],
                disclaimer: "Art. 254, 257, 258-1 ET. Descuentos limitados al impuesto neto de renta."
            )
        }
    }
}

// MARK: - Dividendos PJ

private struct DividendosPJSection: View {
    @State private var dividendos: Decimal = 0
    @State private var esNacional: Bool = true
    @State private var gravados: Bool = true
    @State private var result: DividendosPJCalculator.Result?

    var body: some View {
        CardView {
            VStack(spacing: AppSpacing.sm) {
                CurrencyInputField(label: "Dividendos recibidos", value: $dividendos)
                Toggle("PJ Nacional (domiciliada en Colombia)", isOn: $esNacional)
                    .font(AppTypography.bodySmall)
                    .tint(Color.appPrimary)
                Toggle("Gravados a nivel societario", isOn: $gravados)
                    .font(AppTypography.bodySmall)
                    .tint(Color.appPrimary)

                CalculateButton(title: "Calcular") {
                    result = DividendosPJCalculator.calculate(input: DividendosPJCalculator.Input(
                        dividendos: dividendos,
                        esNacional: esNacional,
                        gravadosSocietario: gravados
                    ))
                }
            }
        }

        if let r = result {
            CalculatorResultView(
                title: "Dividendos PJ",
                mainValue: CurrencyFormatter.cop(r.impuesto),
                mainLabel: "Impuesto sobre dividendos",
                rows: [
                    ("Dividendos", CurrencyFormatter.cop(r.dividendos)),
                    ("Tipo PJ", r.esNacional ? "Nacional" : "Extranjera"),
                    ("Gravados societario", r.gravadosSocietario ? "Si" : "No"),
                    ("Tarifa efectiva", CurrencyFormatter.percent(r.tarifaEfectiva)),
                    ("Neto despues impuesto", CurrencyFormatter.cop(r.neto)),
                ],
                disclaimer: r.explicacion
            )
        }
    }
}

// MARK: - Comparador de Contratacion

private struct ComparadorSection: View {
    @State private var salario: Decimal = 0
    @State private var result: ComparadorContratacionCalculator.Result?

    var body: some View {
        CardView {
            VStack(spacing: AppSpacing.sm) {
                CurrencyInputField(label: "Salario mensual base", value: $salario)

                CalculateButton(title: "Comparar Escenarios") {
                    result = ComparadorContratacionCalculator.calculate(
                        input: ComparadorContratacionCalculator.Input(salarioBase: salario)
                    )
                }
            }
        }

        if let r = result {
            comparadorResultCard("Contrato Laboral", escenario: r.laboral)
            comparadorResultCard("Salario Integral", escenario: r.integral)
            comparadorResultCard("Prestacion de Servicios", escenario: r.servicios)

            // Resumen comparativo
            CardView {
                VStack(alignment: .leading, spacing: AppSpacing.xs) {
                    Text("Resumen Comparativo")
                        .font(AppTypography.cardHeading)
                        .foregroundStyle(Color.appForeground)

                    Divider()

                    comparadorRow("Costo empleador", values: [
                        CurrencyFormatter.cop(r.laboral.costoTotalEmpleador),
                        CurrencyFormatter.cop(r.integral.costoTotalEmpleador),
                        CurrencyFormatter.cop(r.servicios.costoTotalEmpleador),
                    ])

                    comparadorRow("Neto trabajador", values: [
                        CurrencyFormatter.cop(r.laboral.netoTrabajador),
                        CurrencyFormatter.cop(r.integral.netoTrabajador),
                        CurrencyFormatter.cop(r.servicios.netoTrabajador),
                    ])
                }
            }
        }
    }

    @ViewBuilder
    private func comparadorResultCard(_ title: String, escenario: ComparadorContratacionCalculator.Escenario) -> some View {
        CalculatorResultView(
            title: title,
            mainValue: CurrencyFormatter.cop(escenario.costoTotalEmpleador),
            mainLabel: "Costo total empleador",
            rows: [
                ("Salario bruto", CurrencyFormatter.cop(escenario.salarioBruto)),
                ("Salud empleador", CurrencyFormatter.cop(escenario.aportesSaludEmpleador)),
                ("Pension empleador", CurrencyFormatter.cop(escenario.aportesPensionEmpleador)),
                ("ARL", CurrencyFormatter.cop(escenario.arl)),
                ("Parafiscales", CurrencyFormatter.cop(escenario.parafiscales)),
                ("Prestaciones", CurrencyFormatter.cop(escenario.prestaciones)),
                ("Deducciones trabajador", CurrencyFormatter.cop(escenario.deduccionesTrabajador)),
                ("Neto trabajador", CurrencyFormatter.cop(escenario.netoTrabajador)),
            ],
            disclaimer: nil
        )
    }

    @ViewBuilder
    private func comparadorRow(_ label: String, values: [String]) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(label)
                .font(AppTypography.caption)
                .foregroundStyle(Color.appMutedForeground)

            HStack(spacing: 0) {
                ForEach(Array(["Laboral", "Integral", "Servicios"].enumerated()), id: \.offset) { index, tipo in
                    VStack(spacing: 2) {
                        Text(tipo)
                            .font(AppTypography.caption)
                            .foregroundStyle(Color.appMutedForeground)
                        Text(values[index])
                            .font(AppTypography.label)
                            .fontWeight(.semibold)
                            .foregroundStyle(Color.appForeground)
                            .lineLimit(1)
                            .minimumScaleFactor(0.7)
                    }
                    .frame(maxWidth: .infinity)
                }
            }
        }
        .padding(.vertical, 4)
    }
}

// MARK: - ICA Municipal

private struct ICASection: View {
    @State private var ingresos: Decimal = 0
    @State private var actividad: ICACalculator.Actividad = .comercial
    @State private var usarTarifaPersonalizada: Bool = false
    @State private var tarifaPersonalizada: Decimal = 0
    @State private var result: ICACalculator.Result?

    var body: some View {
        CardView {
            VStack(spacing: AppSpacing.sm) {
                CurrencyInputField(label: "Ingresos brutos en el municipio", value: $ingresos)

                VStack(alignment: .leading, spacing: 4) {
                    Text("Actividad economica")
                        .font(AppTypography.label)
                        .foregroundStyle(Color.appMutedForeground)
                    Picker("Actividad", selection: $actividad) {
                        ForEach(ICACalculator.Actividad.allCases) { act in
                            Text(act.label).tag(act)
                        }
                    }
                    .pickerStyle(.menu)
                    .tint(Color.appForeground)

                    Text("Rango tipico: \(actividad.rangoTarifa)")
                        .font(AppTypography.caption)
                        .foregroundStyle(Color.appMutedForeground)
                }

                Toggle("Usar tarifa personalizada", isOn: $usarTarifaPersonalizada)
                    .font(AppTypography.bodySmall)
                    .tint(Color.appPrimary)

                if usarTarifaPersonalizada {
                    DecimalInputField(label: "Tarifa (por mil)", value: $tarifaPersonalizada, suffix: "‰")
                }

                CalculateButton(title: "Calcular ICA") {
                    result = ICACalculator.calculate(input: ICACalculator.Input(
                        ingresosBrutos: ingresos,
                        actividad: actividad,
                        tarifaPersonalizada: usarTarifaPersonalizada ? tarifaPersonalizada : nil
                    ))
                }
            }
        }

        if let r = result {
            CalculatorResultView(
                title: "ICA Municipal",
                mainValue: CurrencyFormatter.cop(r.totalICA),
                mainLabel: "Total ICA + sobretasas",
                rows: [
                    ("Ingresos brutos", CurrencyFormatter.cop(r.ingresosBrutos)),
                    ("Actividad", r.actividad),
                    ("Tarifa", "\(r.tarifaPorMil) por mil"),
                    ("ICA base", CurrencyFormatter.cop(r.ica)),
                    ("Avisos y tableros (15%)", CurrencyFormatter.cop(r.avisosTableros)),
                    ("Sobretasa bomberil (3%)", CurrencyFormatter.cop(r.sobretasaBomberil)),
                    ("Tarifa efectiva", CurrencyFormatter.percent(r.tarifaEfectiva)),
                ],
                disclaimer: "ICA varia por municipio. Tarifas usadas son promedios nacionales. Consulte el acuerdo municipal de su jurisdiccion."
            )
        }
    }
}
