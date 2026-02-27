import Foundation

/// Retencion en la Fuente — Art. 383, 392, 401 ET
enum RetencionCalculator {

    struct Input {
        var conceptoId: String
        var monto: Decimal
        var deduccionesSS: Decimal = 0  // Social security deductions (for salary)
        var uvt: Decimal = TaxData.uvt2026
    }

    struct Result {
        let concepto: String
        let monto: Decimal
        let baseGravable: Decimal
        let retencion: Decimal
        let tarifaAplicada: Decimal
        let articulo: String
        let isProgressive: Bool
    }

    static func calculate(input: Input) -> Result {
        guard let concepto = TaxData.retencionConceptos.first(where: { $0.id == input.conceptoId }) else {
            return Result(concepto: "Desconocido", monto: input.monto, baseGravable: 0, retencion: 0, tarifaAplicada: 0, articulo: "", isProgressive: false)
        }

        if concepto.isProgressive {
            return calculateSalaryRetention(input: input, concepto: concepto)
        } else {
            return calculateFixedRetention(input: input, concepto: concepto)
        }
    }

    private static func calculateSalaryRetention(input: Input, concepto: TaxData.RetencionConcepto) -> Result {
        // 1. Depurate base: monto - social security deductions
        let neto = max(0, input.monto - input.deduccionesSS)

        // 2. Convert to UVT
        let baseUVT = neto / input.uvt

        // 3. Apply progressive salary retention brackets
        let (impuestoUVT, _) = TaxData.applyBrackets(baseUVT, brackets: TaxData.retencionSalariosBrackets)

        // 4. Convert back to COP
        let retencionCOP = (impuestoUVT * input.uvt).rounded
        let tarifaEfectiva = neto > 0 ? retencionCOP / neto : 0

        return Result(
            concepto: concepto.concepto,
            monto: input.monto,
            baseGravable: neto,
            retencion: retencionCOP,
            tarifaAplicada: tarifaEfectiva.rounded(to: 4),
            articulo: concepto.articulo,
            isProgressive: true
        )
    }

    private static func calculateFixedRetention(input: Input, concepto: TaxData.RetencionConcepto) -> Result {
        guard let tarifa = concepto.tarifa else {
            return Result(concepto: concepto.concepto, monto: input.monto, baseGravable: 0, retencion: 0, tarifaAplicada: 0, articulo: concepto.articulo, isProgressive: false)
        }

        // Check minimum base
        let baseMinCOP = concepto.baseUVT * input.uvt
        let retencion: Decimal
        if input.monto >= baseMinCOP {
            retencion = (input.monto * tarifa).rounded
        } else {
            retencion = 0
        }

        return Result(
            concepto: concepto.concepto,
            monto: input.monto,
            baseGravable: input.monto,
            retencion: retencion,
            tarifaAplicada: tarifa,
            articulo: concepto.articulo,
            isProgressive: false
        )
    }
}
