import Foundation

// MARK: - GlosarioData — Glosario Tributario Colombia

enum GlosarioData {

    // MARK: - Metadata

    static let lastUpdate = "2026-02-19"

    // MARK: - Available Letters (computed)

    static let availableLetters: [String] = {
        Array(Set(terminos.map { String($0.termino.prefix(1).uppercased()) })).sorted()
    }()

    // MARK: - All Terms (33 entries)

    static let terminos: [GlosarioTerm] = [
        GlosarioTerm(
            id: "uvt",
            termino: "UVT",
            definicion: "Unidad de Valor Tributario. Medida de valor que permite ajustar los valores contenidos en las disposiciones relativas a los impuestos y obligaciones tributarias.",
            articulos: ["868"],
            relacionados: ["Base gravable"]
        ),
        GlosarioTerm(
            id: "smlmv",
            termino: "SMLMV",
            definicion: "Salario Minimo Legal Mensual Vigente. Remuneracion minima que debe recibir un trabajador por su labor en Colombia. Para 2026: $1,750,905.",
            articulos: [],
            relacionados: ["IBC", "Auxilio de transporte"]
        ),
        GlosarioTerm(
            id: "renta-liquida-gravable",
            termino: "Renta liquida gravable",
            definicion: "Resultado de restar a los ingresos netos las deducciones y rentas exentas permitidas. Es la base sobre la cual se aplica la tarifa del impuesto de renta.",
            articulos: ["178", "241"],
            relacionados: ["Base gravable", "Deducciones"]
        ),
        GlosarioTerm(
            id: "base-gravable",
            termino: "Base gravable",
            definicion: "Valor monetario o unidad de medida sobre el cual se aplica la tarifa del impuesto para establecer el valor del tributo.",
            articulos: ["338"],
            relacionados: ["Renta liquida gravable", "Hecho generador"]
        ),
        GlosarioTerm(
            id: "hecho-generador",
            termino: "Hecho generador",
            definicion: "Presupuesto establecido por la ley para tipificar el tributo y cuya realizacion origina el nacimiento de la obligacion tributaria.",
            articulos: [],
            relacionados: ["Base gravable", "Sujeto pasivo"]
        ),
        GlosarioTerm(
            id: "sujeto-pasivo",
            termino: "Sujeto pasivo",
            definicion: "Persona natural o juridica obligada al cumplimiento de las obligaciones tributarias, ya sea en calidad de contribuyente o responsable.",
            articulos: [],
            relacionados: ["Contribuyente", "Responsable"]
        ),
        GlosarioTerm(
            id: "contribuyente",
            termino: "Contribuyente",
            definicion: "Persona natural o juridica respecto de quien se realiza el hecho generador de la obligacion tributaria.",
            articulos: ["2"],
            relacionados: ["Sujeto pasivo", "Declarante"]
        ),
        GlosarioTerm(
            id: "declarante",
            termino: "Declarante",
            definicion: "Persona obligada a presentar declaracion tributaria ante la DIAN.",
            articulos: ["591", "592"],
            relacionados: ["Contribuyente", "No declarante"]
        ),
        GlosarioTerm(
            id: "retencion-en-la-fuente",
            termino: "Retencion en la fuente",
            definicion: "Mecanismo de recaudo anticipado del impuesto, mediante el cual el pagador (agente retenedor) descuenta un porcentaje del pago y lo traslada a la DIAN.",
            articulos: ["367", "368"],
            relacionados: ["Agente retenedor", "Autorretencion"]
        ),
        GlosarioTerm(
            id: "agente-retenedor",
            termino: "Agente retenedor",
            definicion: "Persona natural o juridica obligada a practicar la retencion en la fuente sobre pagos o abonos en cuenta.",
            articulos: ["368"],
            relacionados: ["Retencion en la fuente"]
        ),
        GlosarioTerm(
            id: "autorretencion",
            termino: "Autorretencion",
            definicion: "Mecanismo por el cual el mismo beneficiario del pago se practica la retencion en la fuente.",
            articulos: ["366-1"],
            relacionados: ["Retencion en la fuente"]
        ),
        GlosarioTerm(
            id: "incrngo",
            termino: "INCRNGO",
            definicion: "Ingresos No Constitutivos de Renta ni Ganancia Ocasional. Ingresos que por disposicion legal se excluyen de la base gravable del impuesto de renta.",
            articulos: ["36-57-2"],
            relacionados: ["Renta exenta", "Deduccion"]
        ),
        GlosarioTerm(
            id: "renta-exenta",
            termino: "Renta exenta",
            definicion: "Ingresos que estan gravados a tarifa cero (0%), lo que significa que se incluyen en la depuracion pero no generan impuesto.",
            articulos: ["206", "207"],
            relacionados: ["INCRNGO", "Deduccion"]
        ),
        GlosarioTerm(
            id: "deduccion",
            termino: "Deduccion",
            definicion: "Gastos realizados durante el ano gravable que tienen relacion de causalidad, necesidad y proporcionalidad con la actividad productora de renta.",
            articulos: ["104", "105"],
            relacionados: ["Renta exenta", "Costos"]
        ),
        GlosarioTerm(
            id: "ganancia-ocasional",
            termino: "Ganancia ocasional",
            definicion: "Ingreso proveniente de actividades no habituales del contribuyente, como venta de activos fijos, herencias, loterias o donaciones.",
            articulos: ["299", "300"],
            relacionados: ["Renta ordinaria", "Activo fijo"]
        ),
        GlosarioTerm(
            id: "iva",
            termino: "IVA",
            definicion: "Impuesto al Valor Agregado. Impuesto indirecto que grava la venta de bienes, la prestacion de servicios y las importaciones.",
            articulos: ["420", "468"],
            relacionados: ["Excluido", "Exento"]
        ),
        GlosarioTerm(
            id: "bien-exento-de-iva",
            termino: "Bien exento de IVA",
            definicion: "Bien gravado a tarifa 0%. El responsable puede solicitar devolucion del IVA pagado en sus compras (descontable).",
            articulos: ["477"],
            relacionados: ["Bien excluido", "IVA descontable"]
        ),
        GlosarioTerm(
            id: "bien-excluido-de-iva",
            termino: "Bien excluido de IVA",
            definicion: "Bien que por ley no causa IVA. No genera derecho a IVA descontable.",
            articulos: ["424"],
            relacionados: ["Bien exento", "IVA"]
        ),
        GlosarioTerm(
            id: "gmf",
            termino: "GMF",
            definicion: "Gravamen a los Movimientos Financieros (4 por mil). Impuesto que grava las transacciones financieras realizadas por los usuarios del sistema.",
            articulos: ["871"],
            relacionados: ["4x1000"]
        ),
        GlosarioTerm(
            id: "ibc",
            termino: "IBC",
            definicion: "Ingreso Base de Cotizacion. Base sobre la cual se calculan los aportes a seguridad social (salud, pension, ARL).",
            articulos: [],
            relacionados: ["Seguridad social", "SMLMV"]
        ),
        GlosarioTerm(
            id: "parafiscales",
            termino: "Parafiscales",
            definicion: "Contribuciones obligatorias del empleador destinadas a SENA (2%), ICBF (3%) y Cajas de Compensacion Familiar (4%).",
            articulos: ["114-1"],
            relacionados: ["SENA", "ICBF", "CCF"]
        ),
        GlosarioTerm(
            id: "exoneracion-art.-114-1",
            termino: "Exoneracion Art. 114-1",
            definicion: "Empleadores de personas juridicas exonerados de aportes a salud (8.5%), SENA (2%) e ICBF (3%) por trabajadores que devenguen menos de 10 SMLMV.",
            articulos: ["114-1"],
            relacionados: ["Parafiscales", "Seguridad social"]
        ),
        GlosarioTerm(
            id: "sancion-por-extemporaneidad",
            termino: "Sancion por extemporaneidad",
            definicion: "Sancion por presentar declaraciones tributarias fuera del plazo legal. Se calcula como porcentaje mensual del impuesto o ingresos.",
            articulos: ["641", "642"],
            relacionados: ["Sancion minima", "Art. 640 reduccion"]
        ),
        GlosarioTerm(
            id: "beneficio-de-auditoria",
            termino: "Beneficio de auditoria",
            definicion: "Reduccion del periodo de firmeza de la declaracion de renta cuando el contribuyente incrementa su impuesto en cierto porcentaje respecto al ano anterior.",
            articulos: ["689-3"],
            relacionados: ["Firmeza", "Declaracion de renta"]
        ),
        GlosarioTerm(
            id: "anticipo-de-renta",
            termino: "Anticipo de renta",
            definicion: "Pago anticipado del impuesto de renta del periodo siguiente, calculado como porcentaje del impuesto del periodo actual.",
            articulos: ["807"],
            relacionados: ["Declaracion de renta", "Retencion en la fuente"]
        ),
        GlosarioTerm(
            id: "simple",
            termino: "SIMPLE",
            definicion: "Regimen Simple de Tributacion. Impuesto unificado que sustituye renta, IVA (para restaurantes), ICA e impuesto de consumo para ciertos contribuyentes.",
            articulos: ["903", "905", "908"],
            relacionados: ["Regimen ordinario"]
        ),
        GlosarioTerm(
            id: "normalizacion-tributaria",
            termino: "Normalizacion tributaria",
            definicion: "Impuesto complementario al patrimonio para activos omitidos o pasivos inexistentes. Tarifa 2026: 19% (Decreto 1474/2025).",
            articulos: [],
            relacionados: ["Patrimonio", "Activos omitidos"]
        ),
        GlosarioTerm(
            id: "renta-presuntiva",
            termino: "Renta presuntiva",
            definicion: "Renta minima del contribuyente calculada sobre su patrimonio liquido. Tarifa actual: 0% (desde 2021).",
            articulos: ["188", "189"],
            relacionados: ["Patrimonio liquido", "Renta ordinaria"]
        ),
        GlosarioTerm(
            id: "comparacion-patrimonial",
            termino: "Comparacion patrimonial",
            definicion: "Mecanismo de control por el cual la DIAN puede determinar como renta gravable los incrementos patrimoniales no justificados.",
            articulos: ["236", "237"],
            relacionados: ["Patrimonio liquido", "Renta liquida"]
        ),
        GlosarioTerm(
            id: "firmeza-de-la-declaracion",
            termino: "Firmeza de la declaracion",
            definicion: "Fecha a partir de la cual la declaracion tributaria queda en firme y no puede ser modificada por la DIAN. Regla general: 3 anos.",
            articulos: ["714"],
            relacionados: ["Beneficio de auditoria", "Correccion"]
        ),
        GlosarioTerm(
            id: "procedimiento-1",
            termino: "Procedimiento 1",
            definicion: "Metodo de retencion en la fuente por salarios que calcula la retencion mensualmente aplicando la tabla del Art. 383 sobre el ingreso depurado.",
            articulos: ["385", "383"],
            relacionados: ["Procedimiento 2", "Depuracion"]
        ),
        GlosarioTerm(
            id: "procedimiento-2",
            termino: "Procedimiento 2",
            definicion: "Metodo de retencion en la fuente por salarios que calcula un porcentaje fijo semestral basado en el promedio de pagos de los ultimos 12 meses.",
            articulos: ["386"],
            relacionados: ["Procedimiento 1"]
        ),
        GlosarioTerm(
            id: "depuracion",
            termino: "Depuracion",
            definicion: "Proceso de restar de los ingresos los conceptos permitidos (INCRNGO, deducciones, exentas) para obtener la base gravable.",
            articulos: ["388"],
            relacionados: ["Base gravable", "INCRNGO", "Deducciones"]
        ),
    ]
}
