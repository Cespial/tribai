import Foundation

/// Sanciones Tributarias — Art. 641, 642, 643, 644, 647 ET
enum SancionesCalculator {

    // MARK: - Extemporaneidad (Art. 641/642)

    struct ExtemporaneidadInput {
        var impuesto: Decimal
        var meses: Int
        var conEmplazamiento: Bool = false
        var primeraInfraccion: Bool = true
        var ingresoBruto: Decimal = 0
        var uvt: Decimal = TaxData.uvt2026
    }

    struct SancionResult {
        let sancionBruta: Decimal
        let tope: Decimal
        let sancionConTope: Decimal
        let reduccion: Decimal
        let sancionReducida: Decimal
        let sancionFinal: Decimal
        let sancionMinima: Decimal
        let descripcion: String
    }

    static func calcExtemporaneidad(input: ExtemporaneidadInput) -> SancionResult {
        let tasaPorMes: Decimal = input.conEmplazamiento
            ? Decimal(string: "0.10")!   // 10% per month (Art. 642)
            : Decimal(string: "0.05")!   // 5% per month (Art. 641)

        let sancionBruta: Decimal
        let tope: Decimal

        if input.impuesto > 0 {
            sancionBruta = input.impuesto * tasaPorMes * Decimal(input.meses)
            tope = input.conEmplazamiento ? input.impuesto * 2 : input.impuesto
        } else {
            // Base on gross income
            let baseIngreso = input.ingresoBruto * TaxData.sancionExtemporaneidad.porIngresos * Decimal(input.meses)
            sancionBruta = baseIngreso
            tope = input.conEmplazamiento
                ? input.ingresoBruto * TaxData.sancionExtemporaneidad.limiteIngresos * 2
                : input.ingresoBruto * TaxData.sancionExtemporaneidad.limiteIngresos
        }

        let sancionConTope = min(sancionBruta, tope)

        // First offense reduction (Art. 640): 50%
        let reduccionPct: Decimal = input.primeraInfraccion ? Decimal(string: "0.50")! : 1
        let sancionReducida = (sancionConTope * reduccionPct).rounded

        // Minimum sanction: 10 UVT
        let sancionMinima = TaxData.sancionMinimaUVT * input.uvt
        let sancionFinal = max(sancionReducida, sancionMinima)

        let desc = input.conEmplazamiento
            ? "Art. 642 — Extemporaneidad posterior a emplazamiento"
            : "Art. 641 — Extemporaneidad antes de emplazamiento"

        return SancionResult(
            sancionBruta: sancionBruta.rounded,
            tope: tope.rounded,
            sancionConTope: sancionConTope.rounded,
            reduccion: input.primeraInfraccion ? Decimal(string: "0.50")! : 0,
            sancionReducida: sancionReducida,
            sancionFinal: sancionFinal,
            sancionMinima: sancionMinima,
            descripcion: desc
        )
    }

    // MARK: - No Declarar (Art. 643)

    struct NoDeclarar {
        let ingresosBrutos: Decimal
        let consignaciones: Decimal
        let uvt: Decimal

        func calculate() -> SancionResult {
            let base = max(
                ingresosBrutos * TaxData.sancionNoDeclarar.rentaIngresos,
                consignaciones * TaxData.sancionNoDeclarar.rentaConsignaciones
            )
            let sancionMinima = TaxData.sancionMinimaUVT * uvt
            let sancionFinal = max(base.rounded, sancionMinima)

            return SancionResult(
                sancionBruta: base.rounded,
                tope: base.rounded,
                sancionConTope: base.rounded,
                reduccion: 0,
                sancionReducida: base.rounded,
                sancionFinal: sancionFinal,
                sancionMinima: sancionMinima,
                descripcion: "Art. 643 — Sancion por no declarar (Renta)"
            )
        }
    }

    // MARK: - Correccion (Art. 644)

    struct CorreccionInput {
        var mayorValor: Decimal
        var esVoluntaria: Bool = true
        var primeraInfraccion: Bool = true
        var uvt: Decimal = TaxData.uvt2026
    }

    static func calcCorreccion(input: CorreccionInput) -> SancionResult {
        let tasa = input.esVoluntaria
            ? TaxData.sancionCorreccion.voluntaria
            : TaxData.sancionCorreccion.postEmplazamiento

        let sancionBruta = (input.mayorValor * tasa).rounded
        let reduccionPct: Decimal = input.primeraInfraccion ? Decimal(string: "0.50")! : 1
        let sancionReducida = (sancionBruta * reduccionPct).rounded
        let sancionMinima = TaxData.sancionMinimaUVT * input.uvt
        let sancionFinal = max(sancionReducida, sancionMinima)

        let desc = input.esVoluntaria
            ? "Art. 644 — Correccion voluntaria (10%)"
            : "Art. 644 — Correccion post emplazamiento (20%)"

        return SancionResult(
            sancionBruta: sancionBruta,
            tope: sancionBruta,
            sancionConTope: sancionBruta,
            reduccion: input.primeraInfraccion ? Decimal(string: "0.50")! : 0,
            sancionReducida: sancionReducida,
            sancionFinal: sancionFinal,
            sancionMinima: sancionMinima,
            descripcion: desc
        )
    }

    // MARK: - Intereses de Mora (Art. 634-635)

    struct InteresMoraInput {
        var deuda: Decimal
        var diasMora: Int
        var uvt: Decimal = TaxData.uvt2026
    }

    struct InteresMoraResult {
        let deuda: Decimal
        let diasMora: Int
        let tasaEA: Decimal
        let interesDiario: Decimal
        let interesTotal: Decimal
        let totalAPagar: Decimal
        let periodoLabel: String
    }

    static func calcInteresMora(input: InteresMoraInput) -> InteresMoraResult {
        // Get current applicable rate
        let rateEntry = TaxData.interesMoraRates.last ?? TaxData.InteresMoraRate(
            desde: "2026-01-01", hasta: "2026-12-31",
            tasaEA: Decimal(string: "0.2567")!, label: "25.67% EA"
        )

        // Convert EA to daily rate: (1 + EA)^(1/365) - 1
        let eaDouble = rateEntry.tasaEA.doubleValue
        let dailyRate = pow(1 + eaDouble, 1.0 / 365.0) - 1.0
        let dailyRateDecimal = Decimal(dailyRate)

        let interesTotal = (input.deuda * dailyRateDecimal * Decimal(input.diasMora)).rounded
        let totalAPagar = input.deuda + interesTotal

        return InteresMoraResult(
            deuda: input.deuda,
            diasMora: input.diasMora,
            tasaEA: rateEntry.tasaEA,
            interesDiario: dailyRateDecimal,
            interesTotal: interesTotal,
            totalAPagar: totalAPagar,
            periodoLabel: rateEntry.label
        )
    }
}
