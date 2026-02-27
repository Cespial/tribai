import SwiftUI

struct LaboralCalculatorsView: View {

    enum Section: String, CaseIterable, Identifiable {
        case nomina = "Nomina"
        case liquidacion = "Liquidacion"
        case horasExtras = "Horas Extras"
        case seguridadSocial = "Seg. Social"
        case licencia = "Licencia"

        var id: String { rawValue }
    }

    @State var selectedSection: Section = .nomina

    // Nomina state
    @State private var salarioBasico: Decimal = 0
    @State private var comisiones: Decimal = 0
    @State private var claseARL: String = "I"
    @State private var aplicaExoneracion: Bool = true
    @State private var nominaResult: LaboralCalculator.NominaResult?

    // Liquidacion state
    @State private var salarioLiq: Decimal = 0
    @State private var fechaInicio: Date = Calendar.current.date(byAdding: .year, value: -1, to: Date()) ?? Date()
    @State private var fechaTerminacion: Date = Date()
    @State private var tipoContrato: LaboralCalculator.TipoContrato = .indefinido
    @State private var motivoTerminacion: LaboralCalculator.MotivoTerminacion = .renuncia
    @State private var liquidacionResult: LaboralCalculator.LiquidacionResult?

    // Horas extras state
    @State private var salarioHE: Decimal = 0
    @State private var periodo: LaboralCalculator.Periodo = .h2_2025
    @State private var horasExtraDiurna: Decimal = 0
    @State private var horasExtraNocturna: Decimal = 0
    @State private var horasRecargoNocturno: Decimal = 0
    @State private var horasDomDiurno: Decimal = 0
    @State private var horasExtrasResult: LaboralCalculator.HorasExtrasResult?

    // SS Independiente state
    @State private var ingresosNetos: Decimal = 0
    @State private var ssResult: LaboralCalculator.SSIndependienteResult?

    // Licencia state
    @State private var salarioLic: Decimal = 0
    @State private var esMaternidad: Bool = true
    @State private var licenciaResult: LaboralCalculator.LicenciaResult?

    init(initialSection: String = "nomina-completa") {
        switch initialSection {
        case "liquidacion-laboral": _selectedSection = State(initialValue: .liquidacion)
        case "horas-extras": _selectedSection = State(initialValue: .horasExtras)
        case "seguridad-social": _selectedSection = State(initialValue: .seguridadSocial)
        case "licencia-maternidad": _selectedSection = State(initialValue: .licencia)
        default: _selectedSection = State(initialValue: .nomina)
        }
    }

    var body: some View {
        ScrollView {
            VStack(spacing: AppSpacing.sm) {
                // Section picker
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        ForEach(Section.allCases) { section in
                            FilterChipView(
                                title: section.rawValue,
                                isSelected: selectedSection == section,
                                action: { selectedSection = section }
                            )
                        }
                    }
                }

                switch selectedSection {
                case .nomina: nominaForm
                case .liquidacion: liquidacionForm
                case .horasExtras: horasExtrasForm
                case .seguridadSocial: seguridadSocialForm
                case .licencia: licenciaForm
                }
            }
            .padding(.horizontal, AppSpacing.sm)
            .padding(.bottom, AppSpacing.md)
        }
        .background(Color.appBackground)
        .navigationTitle("Laboral")
        .navigationBarTitleDisplayMode(.inline)
    }

    // MARK: - Nomina

    private var nominaForm: some View {
        VStack(spacing: AppSpacing.sm) {
            CardView {
                VStack(spacing: AppSpacing.sm) {
                    CurrencyInputField(label: "Salario basico mensual", value: $salarioBasico)
                    CurrencyInputField(label: "Comisiones / bonificaciones", value: $comisiones)

                    VStack(alignment: .leading, spacing: 4) {
                        Text("Clase de riesgo ARL")
                            .font(AppTypography.label)
                            .foregroundStyle(Color.appMutedForeground)
                        Picker("ARL", selection: $claseARL) {
                            ForEach(TaxData.arlClasses, id: \.clase) { c in
                                Text("Clase \(c.clase)").tag(c.clase)
                            }
                        }
                        .pickerStyle(.menu)
                        .tint(Color.appForeground)
                    }

                    Toggle("Aplica exoneracion Art. 114-1", isOn: $aplicaExoneracion)
                        .font(AppTypography.bodySmall)
                        .tint(Color.appPrimary)

                    CalculateButton(title: "Calcular Nomina") {
                        let input = LaboralCalculator.NominaInput(
                            salarioBasico: salarioBasico,
                            comisiones: comisiones,
                            claseARL: claseARL,
                            aplicaExoneracion: aplicaExoneracion
                        )
                        nominaResult = LaboralCalculator.calcNomina(input: input)
                    }
                }
            }

            if let r = nominaResult {
                CalculatorResultView(
                    title: "Nomina Completa",
                    mainValue: CurrencyFormatter.cop(r.costoTotalEmpleador),
                    mainLabel: "Costo total empleador (mensual)",
                    rows: [
                        ("IBC", CurrencyFormatter.cop(r.ibc)),
                        ("Auxilio transporte", CurrencyFormatter.cop(r.auxTransporte)),
                        ("Salud empleador", CurrencyFormatter.cop(r.saludEmpleador)),
                        ("Pension empleador", CurrencyFormatter.cop(r.pensionEmpleador)),
                        ("ARL", CurrencyFormatter.cop(r.arlEmpleador)),
                        ("SENA", CurrencyFormatter.cop(r.sena)),
                        ("ICBF", CurrencyFormatter.cop(r.icbf)),
                        ("Caja compensacion", CurrencyFormatter.cop(r.ccf)),
                        ("Cesantias (prov.)", CurrencyFormatter.cop(r.cesantias)),
                        ("Int. cesantias (prov.)", CurrencyFormatter.cop(r.intCesantias)),
                        ("Prima (prov.)", CurrencyFormatter.cop(r.prima)),
                        ("Vacaciones (prov.)", CurrencyFormatter.cop(r.vacaciones)),
                        ("Neto trabajador", CurrencyFormatter.cop(r.netoTrabajador)),
                    ]
                )
            }
        }
    }

    // MARK: - Liquidacion

    private var liquidacionForm: some View {
        VStack(spacing: AppSpacing.sm) {
            CardView {
                VStack(spacing: AppSpacing.sm) {
                    CurrencyInputField(label: "Salario basico mensual", value: $salarioLiq)

                    DatePicker("Fecha inicio contrato", selection: $fechaInicio, displayedComponents: .date)
                        .font(AppTypography.bodySmall)

                    DatePicker("Fecha terminacion", selection: $fechaTerminacion, displayedComponents: .date)
                        .font(AppTypography.bodySmall)

                    VStack(alignment: .leading, spacing: 4) {
                        Text("Tipo de contrato")
                            .font(AppTypography.label)
                            .foregroundStyle(Color.appMutedForeground)
                        Picker("Contrato", selection: $tipoContrato) {
                            ForEach(LaboralCalculator.TipoContrato.allCases) { t in
                                Text(t.rawValue).tag(t)
                            }
                        }
                        .pickerStyle(.menu)
                        .tint(Color.appForeground)
                    }

                    VStack(alignment: .leading, spacing: 4) {
                        Text("Motivo de terminacion")
                            .font(AppTypography.label)
                            .foregroundStyle(Color.appMutedForeground)
                        Picker("Motivo", selection: $motivoTerminacion) {
                            ForEach(LaboralCalculator.MotivoTerminacion.allCases) { m in
                                Text(m.rawValue).tag(m)
                            }
                        }
                        .pickerStyle(.menu)
                        .tint(Color.appForeground)
                    }

                    CalculateButton(title: "Calcular Liquidacion") {
                        let input = LaboralCalculator.LiquidacionInput(
                            salario: salarioLiq,
                            fechaInicio: fechaInicio,
                            fechaTerminacion: fechaTerminacion,
                            tipoContrato: tipoContrato,
                            motivoTerminacion: motivoTerminacion
                        )
                        liquidacionResult = LaboralCalculator.calcLiquidacion(input: input)
                    }
                }
            }

            if let r = liquidacionResult {
                CalculatorResultView(
                    title: "Liquidacion Laboral",
                    mainValue: CurrencyFormatter.cop(r.total),
                    mainLabel: "Total liquidacion",
                    rows: [
                        ("Dias trabajados", "\(r.diasTrabajados)"),
                        ("Cesantias", CurrencyFormatter.cop(r.cesantias)),
                        ("Intereses cesantias", CurrencyFormatter.cop(r.intCesantias)),
                        ("Prima proporcional", CurrencyFormatter.cop(r.prima)),
                        ("Vacaciones", CurrencyFormatter.cop(r.vacaciones)),
                        ("Indemnizacion", CurrencyFormatter.cop(r.indemnizacion)),
                    ],
                    disclaimer: "Cesantias Art. 249 CST. Indemnizacion Art. 64 CST (Ley 789/2002)."
                )
            }
        }
    }

    // MARK: - Horas Extras

    private var horasExtrasForm: some View {
        VStack(spacing: AppSpacing.sm) {
            CardView {
                VStack(spacing: AppSpacing.sm) {
                    CurrencyInputField(label: "Salario mensual", value: $salarioHE)

                    VStack(alignment: .leading, spacing: 4) {
                        Text("Periodo (jornada laboral)")
                            .font(AppTypography.label)
                            .foregroundStyle(Color.appMutedForeground)
                        Picker("Periodo", selection: $periodo) {
                            ForEach(LaboralCalculator.Periodo.allCases) { p in
                                Text(p.rawValue).tag(p)
                            }
                        }
                        .pickerStyle(.menu)
                        .tint(Color.appForeground)
                    }

                    DecimalInputField(label: "Horas extra diurna", value: $horasExtraDiurna, suffix: "hrs")
                    DecimalInputField(label: "Horas extra nocturna", value: $horasExtraNocturna, suffix: "hrs")
                    DecimalInputField(label: "Horas recargo nocturno", value: $horasRecargoNocturno, suffix: "hrs")
                    DecimalInputField(label: "Horas dominical/festivo diurno", value: $horasDomDiurno, suffix: "hrs")

                    CalculateButton(title: "Calcular Extras") {
                        let input = LaboralCalculator.HorasExtrasInput(
                            salario: salarioHE,
                            periodo: periodo,
                            horasExtraDiurna: horasExtraDiurna,
                            horasExtraNocturna: horasExtraNocturna,
                            horasRecargoNocturno: horasRecargoNocturno,
                            horasDomDiurno: horasDomDiurno
                        )
                        horasExtrasResult = LaboralCalculator.calcHorasExtras(input: input)
                    }
                }
            }

            if let r = horasExtrasResult {
                CalculatorResultView(
                    title: "Horas Extras",
                    mainValue: CurrencyFormatter.cop(r.totalExtras),
                    mainLabel: "Total extras y recargos",
                    rows: [
                        ("Valor hora ordinaria", CurrencyFormatter.cop(r.valorHoraOrdinaria)),
                        ("Extra diurna (x1.25)", CurrencyFormatter.cop(r.extraDiurna)),
                        ("Extra nocturna (x1.75)", CurrencyFormatter.cop(r.extraNocturna)),
                        ("Recargo nocturno (x0.35)", CurrencyFormatter.cop(r.recargoNocturno)),
                        ("Dominical diurno", CurrencyFormatter.cop(r.domDiurno)),
                    ],
                    disclaimer: "Ley 2101/2021 (jornada) + Ley 2466/2025 (recargos dominicales progresivos)."
                )
            }
        }
    }

    // MARK: - Seguridad Social

    private var seguridadSocialForm: some View {
        VStack(spacing: AppSpacing.sm) {
            CardView {
                VStack(spacing: AppSpacing.sm) {
                    CurrencyInputField(label: "Ingresos netos mensuales", value: $ingresosNetos)

                    CalculateButton(title: "Calcular Aportes") {
                        let input = LaboralCalculator.SSIndependienteInput(ingresosNetos: ingresosNetos)
                        ssResult = LaboralCalculator.calcSSIndependiente(input: input)
                    }
                }
            }

            if let r = ssResult {
                CalculatorResultView(
                    title: "Seguridad Social",
                    mainValue: CurrencyFormatter.cop(r.total),
                    mainLabel: "Total aportes mensuales",
                    rows: [
                        ("IBC (40% ingresos)", CurrencyFormatter.cop(r.ibc)),
                        ("Salud (12.5%)", CurrencyFormatter.cop(r.salud)),
                        ("Pension (17%)", CurrencyFormatter.cop(r.pension)),
                        ("ARL (0.522%)", CurrencyFormatter.cop(r.arl)),
                    ],
                    disclaimer: "Base: 40% de ingresos netos. Minimo 1 SMLMV, maximo 25 SMLMV."
                )
            }
        }
    }

    // MARK: - Licencia

    private var licenciaForm: some View {
        VStack(spacing: AppSpacing.sm) {
            CardView {
                VStack(spacing: AppSpacing.sm) {
                    CurrencyInputField(label: "Salario mensual", value: $salarioLic)

                    VStack(alignment: .leading, spacing: 4) {
                        Text("Tipo de licencia")
                            .font(AppTypography.label)
                            .foregroundStyle(Color.appMutedForeground)
                        Picker("Licencia", selection: $esMaternidad) {
                            Text("Maternidad (18 sem)").tag(true)
                            Text("Paternidad (2 sem)").tag(false)
                        }
                        .pickerStyle(.segmented)
                    }

                    CalculateButton(title: "Calcular Licencia") {
                        let input = LaboralCalculator.LicenciaInput(salario: salarioLic, esMaternidad: esMaternidad)
                        licenciaResult = LaboralCalculator.calcLicencia(input: input)
                    }
                }
            }

            if let r = licenciaResult {
                CalculatorResultView(
                    title: "Licencia",
                    mainValue: CurrencyFormatter.cop(r.valorTotal),
                    mainLabel: "Valor total licencia",
                    rows: [
                        ("Semanas", "\(r.semanas)"),
                        ("Dias calendario", "\(r.dias)"),
                        ("Valor diario", CurrencyFormatter.cop(r.valorDiario)),
                    ],
                    disclaimer: "Maternidad: 18 semanas (Ley 1822/2017). Paternidad: 2 semanas habiles (Ley 2114/2021)."
                )
            }
        }
    }
}
