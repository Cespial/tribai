import Foundation

/// GMF (4x1000) Calculator — Art. 871, 879 ET
enum GMFCalculator {

    struct Input {
        var monto: Decimal
        var cuentaExenta: Bool = false
        var uvt: Decimal = TaxData.uvt2026
    }

    struct Result {
        let monto: Decimal
        let montoExento: Decimal
        let montoGravado: Decimal
        let gmf: Decimal
        let tasaEfectiva: Decimal
    }

    static func calculate(input: Input) -> Result {
        let montoExento = input.cuentaExenta ? TaxData.gmfExemptUVT * input.uvt : 0
        let montoGravado = max(0, input.monto - montoExento)
        let gmf = (montoGravado * TaxData.gmfRate).rounded
        let tasaEfectiva = input.monto > 0 ? gmf / input.monto : 0

        return Result(
            monto: input.monto,
            montoExento: montoExento,
            montoGravado: montoGravado,
            gmf: gmf,
            tasaEfectiva: tasaEfectiva.rounded(to: 6)
        )
    }
}
