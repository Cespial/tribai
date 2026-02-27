import Foundation

/// Patrimonio Calculator — Art. 292-2, 296-3 ET
enum PatrimonioCalculator {

    struct Input {
        var patrimonioBruto: Decimal
        var deudas: Decimal = 0
        var valorVivienda: Decimal = 0
        var otrasExclusiones: Decimal = 0
        var uvt: Decimal = TaxData.uvt2026
    }

    struct Result {
        let patrimonioLiquido: Decimal
        let exclusionVivienda: Decimal
        let baseGravable: Decimal
        let baseGravableUVT: Decimal
        let impuesto: Decimal
        let impuestoUVT: Decimal
        let tarifaEfectiva: Decimal
        let aplica: Bool
    }

    static func calculate(input: Input) -> Result {
        // 1. Net worth
        let patrimonioLiquido = max(0, input.patrimonioBruto - input.deudas)

        // 2. Housing exclusion (max 12,000 UVT)
        let maxExclusionVivienda = TaxData.patrimonioViviendaExclusionUVT * input.uvt
        let exclusionVivienda = min(input.valorVivienda, maxExclusionVivienda)

        // 3. Taxable base
        let baseGravable = max(0, patrimonioLiquido - exclusionVivienda - input.otrasExclusiones)
        let baseGravableUVT = baseGravable / input.uvt

        // 4. Progressive brackets
        var impuestoUVT: Decimal = 0
        let aplica = baseGravableUVT >= TaxData.patrimonioThresholdUVT

        if aplica {
            let (tax, _) = TaxData.applyBrackets(baseGravableUVT, brackets: TaxData.patrimonioBrackets)
            impuestoUVT = tax
        }

        let impuestoCOP = (impuestoUVT * input.uvt).rounded
        let tarifaEfectiva = patrimonioLiquido > 0 ? impuestoCOP / patrimonioLiquido : 0

        return Result(
            patrimonioLiquido: patrimonioLiquido,
            exclusionVivienda: exclusionVivienda,
            baseGravable: baseGravable,
            baseGravableUVT: baseGravableUVT.rounded(to: 2),
            impuesto: impuestoCOP,
            impuestoUVT: impuestoUVT.rounded(to: 2),
            tarifaEfectiva: tarifaEfectiva.rounded(to: 4),
            aplica: aplica
        )
    }

    // MARK: - Comparacion Patrimonial (Art. 236, 239)

    struct ComparacionInput {
        var patrimonioAnterior: Decimal
        var patrimonioActual: Decimal
        var rentaDeclarada: Decimal
        var gananciasOcasionales: Decimal = 0
    }

    struct ComparacionResult {
        let incrementoPatrimonial: Decimal
        let rentaJustificada: Decimal
        let rentaNoJustificada: Decimal
        let tieneRiesgo: Bool
    }

    static func calcComparacion(input: ComparacionInput) -> ComparacionResult {
        let incremento = max(0, input.patrimonioActual - input.patrimonioAnterior)
        let justificada = input.rentaDeclarada + input.gananciasOcasionales
        let noJustificada = max(0, incremento - justificada)

        return ComparacionResult(
            incrementoPatrimonial: incremento,
            rentaJustificada: justificada,
            rentaNoJustificada: noJustificada,
            tieneRiesgo: noJustificada > 0
        )
    }
}
