import Foundation

// MARK: - NovedadesData — Novedades Normativas Colombia

enum NovedadesData {

    // MARK: - Metadata

    static let lastUpdate = "2026-02-19"

    // MARK: - Tipo Names (for filters)

    static let tipoNames: [String] = NovedadTipo.allCases.map { $0.label }

    // MARK: - All Items (28 entries, sorted by fecha descending)

    static let items: [NovedadNormativa] = [

        // ── 2026 ──

        NovedadNormativa(
            id: "nov-001",
            fecha: "2026-01-15",
            titulo: "Resolucion DIAN fija calendario tributario 2026",
            resumen: "La DIAN expide la resolucion con los plazos para declarar y pagar las obligaciones tributarias del ano gravable 2025. Se establecen fechas para renta, IVA, retencion en la fuente, SIMPLE, patrimonio y demas impuestos nacionales.",
            tipo: .resolucion,
            fuente: "DIAN",
            numero: "000012 de 2026",
            impacto: .alto,
            articulosET: ["574", "579", "580", "811"],
            tags: ["calendario tributario", "plazos", "vencimientos", "2026"],
            queSignificaParaTi: "Si manejas varios clientes, esta resolucion redefine tus fechas limite de presentacion y pago durante 2026.",
            accionRecomendada: "Cruza hoy tus NIT con el calendario y exporta recordatorios para los proximos 30 dias.",
            detalleCompleto: "La resolucion define secuencias de vencimiento por ultimo digito y consolida plazos para obligaciones nacionales. El incumplimiento genera sancion e intereses."
        ),

        NovedadNormativa(
            id: "nov-002",
            fecha: "2026-01-10",
            titulo: "Resolucion DIAN fija valor de la UVT para 2026",
            resumen: "La DIAN fija el valor de la Unidad de Valor Tributario (UVT) en $49.799 para el ano 2026, con base en la variacion del IPC certificada por el DANE. Este valor actualiza umbrales, tarifas, deducciones y sanciones del Estatuto Tributario.",
            tipo: .resolucion,
            fuente: "DIAN",
            numero: "000005 de 2026",
            impacto: .alto,
            articulosET: ["868"],
            tags: ["UVT", "unidad de valor tributario", "actualizacion", "2026"],
            queSignificaParaTi: "Todos los calculos en UVT cambian de inmediato: topes para declarar, sanciones, deducciones y tarifas referenciadas.",
            accionRecomendada: "Actualiza tus plantillas y simulaciones con el nuevo valor UVT antes de presentar declaraciones.",
            detalleCompleto: "La actualizacion de UVT impacta transversalmente formularios, sanciones minimas y comparaciones historicas entre anos gravables."
        ),

        NovedadNormativa(
            id: "nov-003",
            fecha: "2026-01-03",
            titulo: "Decreto fija salario minimo 2026 en $1.750.905",
            resumen: "El Gobierno Nacional fija el salario minimo mensual legal vigente (SMLMV) para 2026 en $1.750.905 y el auxilio de transporte en $249.095. Estos valores impactan bases de retencion, aportes a seguridad social y el calculo de diversas obligaciones tributarias.",
            tipo: .decreto,
            fuente: "Ministerio del Trabajo",
            numero: "0025 de 2026",
            impacto: .alto,
            articulosET: [],
            tags: ["salario minimo", "SMLMV", "auxilio de transporte", "2026"],
            queSignificaParaTi: "Este cambio tiene efecto inmediato en planeacion tributaria, priorizacion de vencimientos y riesgo de sancion.",
            accionRecomendada: "Contrasta el texto oficial y valida si debes ajustar cronogramas, formatos o procedimientos internos.",
            detalleCompleto: "El Gobierno Nacional fija el salario minimo mensual legal vigente (SMLMV) para 2026 en $1.750.905 y el auxilio de transporte en $249.095. Estos valores impactan bases de retencion, aportes a seguridad social y el calculo de diversas obligaciones tributarias."
        ),

        // ── 2025 ──

        NovedadNormativa(
            id: "nov-004",
            fecha: "2025-12-28",
            titulo: "Decreto reglamentario de la reforma tributaria Ley 2277",
            resumen: "Se expide decreto reglamentario que ajusta procedimientos de retencion en la fuente, limites de deducciones y requisitos para el regimen SIMPLE, en desarrollo de la Ley 2277 de 2022.",
            tipo: .decreto,
            fuente: "MinHacienda",
            numero: "1474 de 2025",
            impacto: .alto,
            articulosET: ["383", "387", "388", "401", "903"],
            tags: ["reglamentario", "reforma tributaria", "retencion", "SIMPLE"],
            queSignificaParaTi: "Este cambio tiene efecto inmediato en planeacion tributaria, priorizacion de vencimientos y riesgo de sancion.",
            accionRecomendada: "Contrasta el texto oficial y valida si debes ajustar cronogramas, formatos o procedimientos internos.",
            detalleCompleto: "Se expide decreto reglamentario que ajusta procedimientos de retencion en la fuente, limites de deducciones y requisitos para el regimen SIMPLE, en desarrollo de la Ley 2277 de 2022."
        ),

        NovedadNormativa(
            id: "nov-005",
            fecha: "2025-11-15",
            titulo: "Resolucion DIAN sobre facturacion electronica de venta",
            resumen: "La DIAN actualiza los requisitos tecnicos y de validacion para la factura electronica de venta, documento soporte en operaciones con no obligados y notas de ajuste, con plazo de implementacion hasta marzo 2026.",
            tipo: .resolucion,
            fuente: "DIAN",
            numero: "000165 de 2025",
            impacto: .medio,
            articulosET: ["615", "616-1", "617"],
            tags: ["factura electronica", "documento soporte", "validacion previa"],
            queSignificaParaTi: "Debes ajustar tus validaciones tecnicas y flujos de emision para evitar rechazo de documentos por parte de la DIAN.",
            accionRecomendada: "Revisa proveedor tecnologico y realiza pruebas de validacion antes del plazo de implementacion.",
            detalleCompleto: "Se actualizan reglas de factura electronica, documento soporte y notas de ajuste, con exigencias operativas para equipos contables y de sistemas."
        ),

        NovedadNormativa(
            id: "nov-006",
            fecha: "2025-10-20",
            titulo: "Circular DIAN sobre tratamiento de criptoactivos",
            resumen: "La DIAN emite circular con lineamientos sobre la declaracion de criptoactivos como activos en la declaracion de renta, su valoracion y el tratamiento de ganancias realizadas.",
            tipo: .circular,
            fuente: "DIAN",
            numero: "015 de 2025",
            impacto: .medio,
            articulosET: ["261", "267", "300"],
            tags: ["criptoactivos", "activos virtuales", "declaracion de renta"],
            queSignificaParaTi: "Este cambio puede alterar procesos contables y soportes; conviene revisarlo antes del proximo cierre.",
            accionRecomendada: "Revisa impacto operativo en tus casos activos y documenta criterio aplicable.",
            detalleCompleto: "La DIAN emite circular con lineamientos sobre la declaracion de criptoactivos como activos en la declaracion de renta, su valoracion y el tratamiento de ganancias realizadas."
        ),

        NovedadNormativa(
            id: "nov-007",
            fecha: "2025-09-12",
            titulo: "Sentencia Corte Constitucional sobre impuesto al patrimonio",
            resumen: "La Corte Constitucional declara exequible el impuesto al patrimonio establecido en la Ley 2277 de 2022, rechazando demandas por presunta violacion al principio de no confiscatoriedad. Se confirman las tarifas progresivas del 0,5% al 1,5%.",
            tipo: .sentencia,
            fuente: "Corte Constitucional",
            numero: "C-389 de 2025",
            impacto: .alto,
            articulosET: ["292-3", "294-3", "295-3", "296-3"],
            tags: ["patrimonio", "constitucionalidad", "tarifas", "no confiscatoriedad"],
            queSignificaParaTi: "Se mantiene vigente la obligacion de liquidar impuesto al patrimonio para contribuyentes en el umbral aplicable.",
            accionRecomendada: "Recalcula base gravable con tus cierres mas recientes y agenda con antelacion el pago de la obligacion.",
            detalleCompleto: "La sentencia confirma constitucionalidad y continuidad del impuesto bajo esquema de tarifas progresivas."
        ),

        NovedadNormativa(
            id: "nov-008",
            fecha: "2025-08-05",
            titulo: "Concepto DIAN sobre renta de plataformas digitales",
            resumen: "La DIAN emite concepto general sobre el tratamiento tributario de ingresos obtenidos a traves de plataformas digitales de economia colaborativa, incluyendo aplicaciones de transporte y entregas.",
            tipo: .concepto,
            fuente: "DIAN",
            numero: "0758 de 2025",
            impacto: .medio,
            articulosET: ["24", "408", "437-2"],
            tags: ["economia digital", "plataformas", "retencion", "IVA"],
            queSignificaParaTi: "Este cambio puede alterar procesos contables y soportes; conviene revisarlo antes del proximo cierre.",
            accionRecomendada: "Revisa impacto operativo en tus casos activos y documenta criterio aplicable.",
            detalleCompleto: "La DIAN emite concepto general sobre el tratamiento tributario de ingresos obtenidos a traves de plataformas digitales de economia colaborativa, incluyendo aplicaciones de transporte y entregas."
        ),

        NovedadNormativa(
            id: "nov-028",
            fecha: "2025-07-15",
            titulo: "Decreto sobre reglamentacion ICA territorial",
            resumen: "El Gobierno Nacional expide lineamientos para la armonizacion del Impuesto de Industria y Comercio (ICA) a nivel territorial, buscando simplificar el cumplimiento para contribuyentes con presencia en multiples municipios.",
            tipo: .decreto,
            fuente: "MinHacienda",
            numero: "1120 de 2025",
            impacto: .medio,
            articulosET: ["115"],
            tags: ["ICA", "industria y comercio", "territorial", "armonizacion"],
            queSignificaParaTi: "Si operas en varios municipios, este decreto puede simplificar o redefinir la carga administrativa del ICA territorial.",
            accionRecomendada: "Mapea municipios con operacion activa y valida cambios de procedimiento con tu equipo fiscal.",
            detalleCompleto: "La reglamentacion apunta a armonizar criterios territoriales del ICA para facilitar cumplimiento en presencia multi-ciudad."
        ),

        NovedadNormativa(
            id: "nov-009",
            fecha: "2025-06-30",
            titulo: "Decreto sobre precios de transferencia 2025",
            resumen: "Se reglamentan los plazos y condiciones para la presentacion de la documentacion comprobatoria, declaracion informativa y el informe pais por pais en materia de precios de transferencia para el ano gravable 2024.",
            tipo: .decreto,
            fuente: "MinHacienda",
            numero: "0892 de 2025",
            impacto: .medio,
            articulosET: ["260-1", "260-2", "260-4", "260-5", "260-9"],
            tags: ["precios de transferencia", "vinculados economicos", "informe pais por pais"],
            queSignificaParaTi: "Este cambio puede alterar procesos contables y soportes; conviene revisarlo antes del proximo cierre.",
            accionRecomendada: "Contrasta el texto oficial y valida si debes ajustar cronogramas, formatos o procedimientos internos.",
            detalleCompleto: "Se reglamentan los plazos y condiciones para la presentacion de la documentacion comprobatoria, declaracion informativa y el informe pais por pais en materia de precios de transferencia para el ano gravable 2024."
        ),

        NovedadNormativa(
            id: "nov-010",
            fecha: "2025-04-15",
            titulo: "Resolucion DIAN implementa sistema de devolucion automatica",
            resumen: "La DIAN implementa un sistema automatizado para la devolucion y compensacion de saldos a favor en IVA y renta, reduciendo los tiempos de tramite a 15 dias habiles para contribuyentes que cumplan requisitos especificos.",
            tipo: .resolucion,
            fuente: "DIAN",
            numero: "000089 de 2025",
            impacto: .medio,
            articulosET: ["815", "816", "850", "854", "855"],
            tags: ["devoluciones", "saldos a favor", "compensacion", "IVA", "renta"],
            queSignificaParaTi: "Si tienes saldos a favor recurrentes, puedes reducir tiempos de caja al usar el nuevo esquema automatizado.",
            accionRecomendada: "Verifica requisitos de trazabilidad documental para acceder al tramite abreviado.",
            detalleCompleto: "El sistema de devolucion automatica busca disminuir tiempos de respuesta y priorizar contribuyentes con historial de cumplimiento."
        ),

        NovedadNormativa(
            id: "nov-025",
            fecha: "2025-03-20",
            titulo: "Concepto DIAN sobre retenciones en contratos de prestacion de servicios",
            resumen: "La DIAN aclara la base de retencion en la fuente aplicable a contratos de prestacion de servicios profesionales y de consultoria, diferenciando personas naturales declarantes y no declarantes de renta.",
            tipo: .concepto,
            fuente: "DIAN",
            numero: "0215 de 2025",
            impacto: .medio,
            articulosET: ["383", "392", "401"],
            tags: ["retencion", "servicios profesionales", "consultoria", "base de retencion"],
            queSignificaParaTi: "Cambia la forma practica de calcular retenciones en servicios profesionales segun condicion de declarante.",
            accionRecomendada: "Ajusta matrices de retencion y contratos para evitar diferencias en anticipos durante el periodo.",
            detalleCompleto: "La DIAN aclara bases y diferencias por perfil tributario, con implicaciones directas en flujo de caja."
        ),

        // ── 2024 ──

        NovedadNormativa(
            id: "nov-011",
            fecha: "2024-12-18",
            titulo: "Ley 2365 de 2024 - Licencia de paternidad",
            resumen: "Se amplian las licencias de paternidad y se establecen incentivos tributarios para empleadores que superen los periodos minimos. Modifica tratamiento de deducciones por pagos laborales.",
            tipo: .ley,
            fuente: "Congreso de la Republica",
            numero: "2365 de 2024",
            impacto: .bajo,
            articulosET: ["108", "387"],
            tags: ["licencia paternidad", "deducciones laborales", "incentivos"],
            queSignificaParaTi: "Es una actualizacion informativa util para mantener criterio tecnico y contexto normativo.",
            accionRecomendada: "Registra esta novedad como antecedente para analisis y sustentacion tributaria.",
            detalleCompleto: "Se amplian las licencias de paternidad y se establecen incentivos tributarios para empleadores que superen los periodos minimos. Modifica tratamiento de deducciones por pagos laborales."
        ),

        NovedadNormativa(
            id: "nov-012",
            fecha: "2024-10-25",
            titulo: "Decreto reglamentario del Regimen SIMPLE de Tributacion",
            resumen: "Se reglamentan aspectos del Regimen SIMPLE de Tributacion incluyendo la actualizacion de tarifas consolidadas, creditos tributarios por aportes a pension y requisitos de permanencia.",
            tipo: .decreto,
            fuente: "MinHacienda",
            numero: "1563 de 2024",
            impacto: .medio,
            articulosET: ["903", "904", "905", "906", "907", "908", "910", "911"],
            tags: ["SIMPLE", "regimen simple", "tarifas", "creditos tributarios"],
            queSignificaParaTi: "Este cambio puede alterar procesos contables y soportes; conviene revisarlo antes del proximo cierre.",
            accionRecomendada: "Contrasta el texto oficial y valida si debes ajustar cronogramas, formatos o procedimientos internos.",
            detalleCompleto: "Se reglamentan aspectos del Regimen SIMPLE de Tributacion incluyendo la actualizacion de tarifas consolidadas, creditos tributarios por aportes a pension y requisitos de permanencia."
        ),

        NovedadNormativa(
            id: "nov-013",
            fecha: "2024-09-08",
            titulo: "Sentencia sobre beneficios de convenios de doble imposicion",
            resumen: "El Consejo de Estado aclara el alcance de los beneficios del Convenio para Evitar la Doble Imposicion (CDI) con Espana, especialmente en materia de dividendos, intereses y regalias.",
            tipo: .sentencia,
            fuente: "Consejo de Estado",
            numero: "25892 de 2024",
            impacto: .medio,
            articulosET: ["18-1", "20-1", "245", "254"],
            tags: ["convenios", "doble imposicion", "CDI", "Espana", "dividendos"],
            queSignificaParaTi: "Este cambio puede alterar procesos contables y soportes; conviene revisarlo antes del proximo cierre.",
            accionRecomendada: "Registra esta novedad como antecedente para analisis y sustentacion tributaria.",
            detalleCompleto: "El Consejo de Estado aclara el alcance de los beneficios del Convenio para Evitar la Doble Imposicion (CDI) con Espana, especialmente en materia de dividendos, intereses y regalias."
        ),

        NovedadNormativa(
            id: "nov-014",
            fecha: "2024-07-20",
            titulo: "Circular DIAN sobre nomina electronica",
            resumen: "La DIAN emite lineamientos adicionales sobre la implementacion del documento soporte de pago de nomina electronica (DSPNE), incluyendo notas de ajuste y plazos para transmision.",
            tipo: .circular,
            fuente: "DIAN",
            numero: "008 de 2024",
            impacto: .medio,
            articulosET: ["107", "108", "383"],
            tags: ["nomina electronica", "DSPNE", "documento soporte", "deduccion"],
            queSignificaParaTi: "Este cambio puede alterar procesos contables y soportes; conviene revisarlo antes del proximo cierre.",
            accionRecomendada: "Revisa impacto operativo en tus casos activos y documenta criterio aplicable.",
            detalleCompleto: "La DIAN emite lineamientos adicionales sobre la implementacion del documento soporte de pago de nomina electronica (DSPNE), incluyendo notas de ajuste y plazos para transmision."
        ),

        NovedadNormativa(
            id: "nov-015",
            fecha: "2024-05-03",
            titulo: "Resolucion sobre habilitacion de facturador electronico",
            resumen: "La DIAN establece nuevos requisitos para la habilitacion como facturador electronico y actualiza el procedimiento de validacion previa, incluyendo requisitos de firma digital y envio al adquirente.",
            tipo: .resolucion,
            fuente: "DIAN",
            numero: "000042 de 2024",
            impacto: .bajo,
            articulosET: ["615", "616-1", "617", "618"],
            tags: ["facturacion electronica", "habilitacion", "validacion previa"],
            queSignificaParaTi: "Es una actualizacion informativa util para mantener criterio tecnico y contexto normativo.",
            accionRecomendada: "Contrasta el texto oficial y valida si debes ajustar cronogramas, formatos o procedimientos internos.",
            detalleCompleto: "La DIAN establece nuevos requisitos para la habilitacion como facturador electronico y actualiza el procedimiento de validacion previa, incluyendo requisitos de firma digital y envio al adquirente."
        ),

        NovedadNormativa(
            id: "nov-026",
            fecha: "2024-03-10",
            titulo: "Resolucion DIAN establece grupos de implementacion de nomina electronica",
            resumen: "La DIAN establece el calendario de implementacion obligatoria del documento soporte de pago de nomina electronica para empleadores segun su numero de empleados.",
            tipo: .resolucion,
            fuente: "DIAN",
            numero: "000028 de 2024",
            impacto: .medio,
            articulosET: ["107", "108"],
            tags: ["nomina electronica", "implementacion", "empleadores"],
            queSignificaParaTi: "Este cambio puede alterar procesos contables y soportes; conviene revisarlo antes del proximo cierre.",
            accionRecomendada: "Contrasta el texto oficial y valida si debes ajustar cronogramas, formatos o procedimientos internos.",
            detalleCompleto: "La DIAN establece el calendario de implementacion obligatoria del documento soporte de pago de nomina electronica para empleadores segun su numero de empleados."
        ),

        // ── 2023 ──

        NovedadNormativa(
            id: "nov-016",
            fecha: "2023-12-22",
            titulo: "Decreto de plazos tributarios 2024",
            resumen: "El Gobierno expide el decreto con los plazos para el cumplimiento de obligaciones tributarias del ano gravable 2023, incluyendo renta, IVA, retencion, patrimonio, SIMPLE y obligaciones informativas.",
            tipo: .decreto,
            fuente: "MinHacienda",
            numero: "2229 de 2023",
            impacto: .alto,
            articulosET: ["574", "579", "580", "811"],
            tags: ["plazos", "calendario tributario", "vencimientos", "2024"],
            queSignificaParaTi: "Este cambio tiene efecto inmediato en planeacion tributaria, priorizacion de vencimientos y riesgo de sancion.",
            accionRecomendada: "Contrasta el texto oficial y valida si debes ajustar cronogramas, formatos o procedimientos internos.",
            detalleCompleto: "El Gobierno expide el decreto con los plazos para el cumplimiento de obligaciones tributarias del ano gravable 2023, incluyendo renta, IVA, retencion, patrimonio, SIMPLE y obligaciones informativas."
        ),

        NovedadNormativa(
            id: "nov-017",
            fecha: "2023-08-15",
            titulo: "Concepto DIAN sobre residencia fiscal en teletrabajo internacional",
            resumen: "La DIAN emite concepto aclarando los criterios para determinar la residencia fiscal de personas que realizan teletrabajo desde Colombia para empleadores del exterior, incluyendo el conteo de dias de permanencia.",
            tipo: .concepto,
            fuente: "DIAN",
            numero: "0421 de 2023",
            impacto: .medio,
            articulosET: ["10", "9", "24"],
            tags: ["residencia fiscal", "teletrabajo", "no residentes", "permanencia"],
            queSignificaParaTi: "Este cambio puede alterar procesos contables y soportes; conviene revisarlo antes del proximo cierre.",
            accionRecomendada: "Revisa impacto operativo en tus casos activos y documenta criterio aplicable.",
            detalleCompleto: "La DIAN emite concepto aclarando los criterios para determinar la residencia fiscal de personas que realizan teletrabajo desde Colombia para empleadores del exterior, incluyendo el conteo de dias de permanencia."
        ),

        NovedadNormativa(
            id: "nov-018",
            fecha: "2023-06-10",
            titulo: "Sentencia Corte Constitucional sobre regalias de software",
            resumen: "La Corte se pronuncia sobre el tratamiento tributario de las regalias por licenciamiento de software, distinguiendo entre regalias y servicios tecnicos para efectos de retencion en la fuente.",
            tipo: .sentencia,
            fuente: "Corte Constitucional",
            numero: "C-256 de 2023",
            impacto: .bajo,
            articulosET: ["24", "406", "408", "411"],
            tags: ["software", "regalias", "servicios tecnicos", "retencion"],
            queSignificaParaTi: "Es una actualizacion informativa util para mantener criterio tecnico y contexto normativo.",
            accionRecomendada: "Registra esta novedad como antecedente para analisis y sustentacion tributaria.",
            detalleCompleto: "La Corte se pronuncia sobre el tratamiento tributario de las regalias por licenciamiento de software, distinguiendo entre regalias y servicios tecnicos para efectos de retencion en la fuente."
        ),

        NovedadNormativa(
            id: "nov-027",
            fecha: "2023-04-20",
            titulo: "Decreto reglamentario del impuesto al patrimonio Ley 2277",
            resumen: "Se reglamenta el impuesto al patrimonio creado por la Ley 2277 de 2022, incluyendo la determinacion de la base gravable, exclusiones, tarifas marginales y plazos de pago.",
            tipo: .decreto,
            fuente: "MinHacienda",
            numero: "0589 de 2023",
            impacto: .alto,
            articulosET: ["292-3", "294-3", "295-3", "296-3", "297-3"],
            tags: ["patrimonio", "base gravable", "tarifas marginales", "exclusiones"],
            queSignificaParaTi: "Este cambio tiene efecto inmediato en planeacion tributaria, priorizacion de vencimientos y riesgo de sancion.",
            accionRecomendada: "Contrasta el texto oficial y valida si debes ajustar cronogramas, formatos o procedimientos internos.",
            detalleCompleto: "Se reglamenta el impuesto al patrimonio creado por la Ley 2277 de 2022, incluyendo la determinacion de la base gravable, exclusiones, tarifas marginales y plazos de pago."
        ),

        // ── 2022 ──

        NovedadNormativa(
            id: "nov-019",
            fecha: "2022-12-13",
            titulo: "Ley 2277 de 2022 - Reforma Tributaria para la Igualdad",
            resumen: "Se aprueba la reforma tributaria mas significativa del gobierno Petro. Incluye: aumento de tarifa de renta para patrimonios altos, impuesto a ganancias ocasionales al 15%, limitacion de beneficios tributarios, impuesto a bebidas azucaradas y alimentos ultraprocesados, cambios en regimen SIMPLE, y ajustes al impuesto al patrimonio.",
            tipo: .ley,
            fuente: "Congreso de la Republica",
            numero: "2277 de 2022",
            impacto: .alto,
            articulosET: ["241", "242", "245", "292-3", "295-3", "303-1", "383", "388", "903", "904", "905", "906", "907", "908"],
            tags: ["reforma tributaria", "renta", "patrimonio", "ganancias ocasionales", "SIMPLE", "bebidas azucaradas"],
            queSignificaParaTi: "Este cambio tiene efecto inmediato en planeacion tributaria, priorizacion de vencimientos y riesgo de sancion.",
            accionRecomendada: "Registra esta novedad como antecedente para analisis y sustentacion tributaria.",
            detalleCompleto: "Se aprueba la reforma tributaria mas significativa del gobierno Petro. Incluye: aumento de tarifa de renta para patrimonios altos, impuesto a ganancias ocasionales al 15%, limitacion de beneficios tributarios, impuesto a bebidas azucaradas y alimentos ultraprocesados, cambios en regimen SIMPLE, y ajustes al impuesto al patrimonio."
        ),

        NovedadNormativa(
            id: "nov-020",
            fecha: "2022-11-30",
            titulo: "Circular DIAN sobre impuesto saludable a ultraprocesados",
            resumen: "La DIAN emite circular con los lineamientos para la aplicacion gradual del impuesto saludable a bebidas azucaradas y alimentos ultraprocesados a partir de noviembre de 2023.",
            tipo: .circular,
            fuente: "DIAN",
            numero: "022 de 2022",
            impacto: .medio,
            articulosET: [],
            tags: ["impuesto saludable", "bebidas azucaradas", "ultraprocesados"],
            queSignificaParaTi: "Este cambio puede alterar procesos contables y soportes; conviene revisarlo antes del proximo cierre.",
            accionRecomendada: "Revisa impacto operativo en tus casos activos y documenta criterio aplicable.",
            detalleCompleto: "La DIAN emite circular con los lineamientos para la aplicacion gradual del impuesto saludable a bebidas azucaradas y alimentos ultraprocesados a partir de noviembre de 2023."
        ),

        // ── 2021 ──

        NovedadNormativa(
            id: "nov-021",
            fecha: "2021-09-14",
            titulo: "Ley 2155 de 2021 - Ley de Inversion Social",
            resumen: "Se aprueba la ley de inversion social que establece la tarifa general de renta para personas juridicas en 35%, crea el impuesto de normalizacion tributaria, modifica el regimen SIMPLE e implementa el programa de ingreso solidario.",
            tipo: .ley,
            fuente: "Congreso de la Republica",
            numero: "2155 de 2021",
            impacto: .alto,
            articulosET: ["240", "241", "903", "905", "908"],
            tags: ["inversion social", "renta", "normalizacion", "SIMPLE", "tarifa"],
            queSignificaParaTi: "Este cambio tiene efecto inmediato en planeacion tributaria, priorizacion de vencimientos y riesgo de sancion.",
            accionRecomendada: "Registra esta novedad como antecedente para analisis y sustentacion tributaria.",
            detalleCompleto: "Se aprueba la ley de inversion social que establece la tarifa general de renta para personas juridicas en 35%, crea el impuesto de normalizacion tributaria, modifica el regimen SIMPLE e implementa el programa de ingreso solidario."
        ),

        NovedadNormativa(
            id: "nov-022",
            fecha: "2021-07-28",
            titulo: "Ley 2114 de 2021 - Licencia parental compartida",
            resumen: "Se establece la licencia parental compartida y la licencia parental flexible de tiempo parcial. Impacta las deducciones laborales y los calculos de retencion en la fuente por pagos laborales.",
            tipo: .ley,
            fuente: "Congreso de la Republica",
            numero: "2114 de 2021",
            impacto: .bajo,
            articulosET: ["108", "387"],
            tags: ["licencia parental", "deducciones laborales", "retencion"],
            queSignificaParaTi: "Es una actualizacion informativa util para mantener criterio tecnico y contexto normativo.",
            accionRecomendada: "Registra esta novedad como antecedente para analisis y sustentacion tributaria.",
            detalleCompleto: "Se establece la licencia parental compartida y la licencia parental flexible de tiempo parcial. Impacta las deducciones laborales y los calculos de retencion en la fuente por pagos laborales."
        ),

        // ── 2020 ──

        NovedadNormativa(
            id: "nov-024",
            fecha: "2020-06-01",
            titulo: "Decreto legislativo sobre plazos tributarios por COVID-19",
            resumen: "En el marco de la emergencia sanitaria, el Gobierno modifica los plazos para la presentacion de declaraciones tributarias y facilita el pago diferido de obligaciones. Se establecen beneficios temporales para sectores afectados.",
            tipo: .decreto,
            fuente: "MinHacienda",
            numero: "655 de 2020",
            impacto: .alto,
            articulosET: ["579", "580", "811", "814"],
            tags: ["COVID-19", "plazos", "emergencia sanitaria", "facilidades de pago"],
            queSignificaParaTi: "Este cambio tiene efecto inmediato en planeacion tributaria, priorizacion de vencimientos y riesgo de sancion.",
            accionRecomendada: "Contrasta el texto oficial y valida si debes ajustar cronogramas, formatos o procedimientos internos.",
            detalleCompleto: "En el marco de la emergencia sanitaria, el Gobierno modifica los plazos para la presentacion de declaraciones tributarias y facilita el pago diferido de obligaciones. Se establecen beneficios temporales para sectores afectados."
        ),

        // ── 2019 ──

        NovedadNormativa(
            id: "nov-023",
            fecha: "2019-12-27",
            titulo: "Ley 2010 de 2019 - Ley de Crecimiento Economico",
            resumen: "Se aprueba la ley de crecimiento economico que reduce la tarifa de renta a personas juridicas gradualmente, establece reglas sobre descuento del ICA en renta, modifica retenciones a dividendos y crea el regimen SIMPLE modernizado.",
            tipo: .ley,
            fuente: "Congreso de la Republica",
            numero: "2010 de 2019",
            impacto: .alto,
            articulosET: ["115", "240", "242", "242-1", "903", "904", "905", "906", "907", "908", "910", "911", "912"],
            tags: ["crecimiento economico", "tarifa renta", "ICA", "dividendos", "SIMPLE"],
            queSignificaParaTi: "Este cambio tiene efecto inmediato en planeacion tributaria, priorizacion de vencimientos y riesgo de sancion.",
            accionRecomendada: "Registra esta novedad como antecedente para analisis y sustentacion tributaria.",
            detalleCompleto: "Se aprueba la ley de crecimiento economico que reduce la tarifa de renta a personas juridicas gradualmente, establece reglas sobre descuento del ICA en renta, modifica retenciones a dividendos y crea el regimen SIMPLE modernizado."
        ),
    ]
}
