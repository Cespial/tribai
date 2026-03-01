import Foundation

// MARK: - DoctrinaCuradaData — 50 Conceptos, Oficios y Doctrina DIAN Curados

enum DoctrinaCuradaData {

    // MARK: - Metadata

    static let lastUpdate = "2026-02-19"

    // MARK: - Tipo Documento Names

    static let tipoDocumentoNames: [String] = DoctrinaTipoDoc.allCases.map { $0.label }

    // MARK: - All Items (50 entries)

    static let items: [DoctrinaCurada] = [

        // ── Impuesto sobre la Renta ──

        DoctrinaCurada(
            id: "doc-001",
            numero: "Concepto 000345 de 2025",
            fecha: "2025-03-15",
            tema: "Deduccion de intereses en prestamos entre vinculados economicos",
            pregunta: "Cual es el limite de deduccion de intereses pagados a vinculados economicos del exterior conforme a la regla de subcapitalizacion?",
            sintesis: """
                Se analiza el tratamiento de la deduccion de intereses bajo las reglas de \
                subcapitalizacion del articulo 118-1 del E.T. La norma limita la deduccion de \
                intereses netos al 30% del EBITDA fiscal cuando las deudas con vinculados superan \
                determinados umbrales.
                """,
            conclusionClave: """
                Los intereses netos deducibles no pueden exceder el 30% del EBITDA fiscal del \
                contribuyente. El exceso puede trasladarse a periodos siguientes hasta por 5 anos. \
                Esta regla aplica a deudas con vinculados economicos nacionales o del exterior.
                """,
            articulosET: ["118-1", "260-1", "260-2"],
            tipoDocumento: .concepto,
            descriptores: ["subcapitalizacion", "intereses", "vinculados economicos", "EBITDA"],
            vigente: true
        ),

        DoctrinaCurada(
            id: "doc-002",
            numero: "Oficio 001287 de 2024",
            fecha: "2024-11-20",
            tema: "Rentas exentas de la economia naranja",
            pregunta: "Siguen vigentes las rentas exentas para empresas de economia naranja tras la Ley 2277 de 2022?",
            sintesis: """
                Se aclara el alcance de las rentas exentas de que trata el articulo 235-2 numeral 1 \
                del E.T. para actividades de economia naranja. La Ley 2277 de 2022 mantuvo el \
                beneficio para quienes ya tenian aprobacion de sus proyectos antes del 31 de \
                diciembre de 2022.
                """,
            conclusionClave: """
                Las empresas con aprobacion de proyectos de economia naranja antes del 31 de \
                diciembre de 2022 conservan la renta exenta por 7 anos. No se aceptan nuevas \
                solicitudes tras la entrada en vigencia de la Ley 2277 de 2022.
                """,
            articulosET: ["235-2", "240"],
            tipoDocumento: .oficio,
            descriptores: ["economia naranja", "rentas exentas", "Ley 2277", "beneficios tributarios"],
            vigente: true
        ),

        DoctrinaCurada(
            id: "doc-003",
            numero: "Concepto 000891 de 2025",
            fecha: "2025-06-10",
            tema: "Residencia fiscal y dias de permanencia",
            pregunta: """
                Como se computan los dias de permanencia para establecer la residencia fiscal de \
                una persona natural conforme al articulo 10 del E.T.?
                """,
            sintesis: """
                Se analiza el criterio de permanencia de 183 dias calendarios para determinar la \
                residencia fiscal. Se aclara que los dias no necesitan ser continuos y que se \
                cuentan tanto los dias de entrada como de salida del territorio colombiano.
                """,
            conclusionClave: """
                Se es residente fiscal si se permanece continua o discontinuamente en Colombia por \
                183 dias o mas durante un periodo de 365 dias consecutivos. Los dias parciales \
                cuentan como dias completos. Este computo incluye dias de entrada y salida del pais.
                """,
            articulosET: ["10", "9", "24", "25"],
            tipoDocumento: .concepto,
            descriptores: ["residencia fiscal", "permanencia", "183 dias", "persona natural"],
            vigente: true
        ),

        DoctrinaCurada(
            id: "doc-004",
            numero: "Concepto General 002156 de 2023",
            fecha: "2023-09-28",
            tema: "Tratamiento fiscal de ganancias ocasionales por venta de inmuebles",
            pregunta: """
                Cual es el tratamiento de la ganancia ocasional derivada de la venta de un inmueble \
                que fue vivienda del contribuyente por mas de dos anos?
                """,
            sintesis: """
                Se explica que las primeras 7.500 UVT de la ganancia ocasional por venta de casa o \
                apartamento de habitacion estan exentas conforme al articulo 311-1 del E.T., siempre \
                que el inmueble haya sido la vivienda del contribuyente y se cumplan los requisitos \
                de permanencia.
                """,
            conclusionClave: """
                La ganancia ocasional exenta por venta de vivienda aplica sobre las primeras 7.500 \
                UVT siempre que: (i) sea casa o apartamento de habitacion, (ii) el contribuyente \
                haya vivido alli al menos dos anos, y (iii) se deposite el valor en cuenta AFC o se \
                reinvierta.
                """,
            articulosET: ["299", "300", "303-1", "311-1"],
            tipoDocumento: .doctrinaGeneral,
            descriptores: ["ganancias ocasionales", "venta inmueble", "vivienda", "exencion"],
            vigente: true
        ),

        DoctrinaCurada(
            id: "doc-005",
            numero: "Oficio 000456 de 2024",
            fecha: "2024-04-15",
            tema: "Deduccion por dependientes economicos en renta",
            pregunta: """
                Cuales son los requisitos para que proceda la deduccion por dependientes economicos \
                en la declaracion de renta de personas naturales?
                """,
            sintesis: """
                Se precisan los requisitos del articulo 387 numeral 10 del E.T. sobre la deduccion \
                por dependientes. Se aclara que la deduccion aplica hasta el 10% del ingreso bruto \
                con limite de 32 UVT mensuales y que los dependientes deben cumplir los criterios \
                del articulo 387.
                """,
            conclusionClave: """
                La deduccion por dependientes es hasta el 10% de los ingresos brutos con tope de \
                32 UVT mensuales. Califican como dependientes: hijos hasta 18 anos, hijos entre 18 \
                y 25 anos que estudien, hijos con discapacidad, conyuge o companero permanente \
                dependiente, padres o hermanos dependientes.
                """,
            articulosET: ["336", "387", "388"],
            tipoDocumento: .oficio,
            descriptores: ["dependientes", "deduccion", "renta personas naturales", "requisitos"],
            vigente: true
        ),

        // ── IVA ──

        DoctrinaCurada(
            id: "doc-006",
            numero: "Concepto 001123 de 2024",
            fecha: "2024-08-22",
            tema: "IVA en servicios digitales prestados desde el exterior",
            pregunta: """
                Cual es el mecanismo de recaudo del IVA en servicios digitales prestados desde el \
                exterior a favor de usuarios ubicados en Colombia?
                """,
            sintesis: """
                Se explica el mecanismo de recaudo del IVA para prestadores de servicios desde el \
                exterior, conforme al articulo 437-2 del E.T. Los prestadores del exterior con \
                ingresos significativos deben registrarse ante la DIAN y cobrar el IVA directamente.
                """,
            conclusionClave: """
                Los prestadores de servicios digitales desde el exterior deben inscribirse en el \
                RUT como responsables de IVA cuando superen 31.300 UVT de ingresos brutos en el \
                ano anterior. Deben facturar y declarar IVA bimestralmente.
                """,
            articulosET: ["420", "437-2", "476"],
            tipoDocumento: .concepto,
            descriptores: ["IVA", "servicios digitales", "exterior", "plataformas"],
            vigente: true
        ),

        DoctrinaCurada(
            id: "doc-007",
            numero: "Oficio 002345 de 2023",
            fecha: "2023-12-05",
            tema: "Bienes excluidos de IVA - Canasta familiar",
            pregunta: "Cuales productos de la canasta familiar estan excluidos del IVA conforme a la Ley 2277 de 2022?",
            sintesis: """
                Se actualiza el listado de bienes excluidos del IVA conforme al articulo 424 del \
                E.T. modificado por la Ley 2277 de 2022, enfatizando que la exclusion aplica \
                independientemente de la presentacion comercial del producto.
                """,
            conclusionClave: """
                Los bienes de la canasta basica familiar listados en el articulo 424 del E.T. estan \
                excluidos de IVA. Esta exclusion aplica en toda la cadena de comercializacion y no \
                genera derecho a devolucion o descuento de IVA pagado en insumos.
                """,
            articulosET: ["424", "425", "477"],
            tipoDocumento: .oficio,
            descriptores: ["excluidos", "canasta familiar", "alimentos", "Ley 2277"],
            vigente: true
        ),

        DoctrinaCurada(
            id: "doc-008",
            numero: "Concepto 000678 de 2025",
            fecha: "2025-04-30",
            tema: "Devolucion de IVA a turistas extranjeros",
            pregunta: """
                Cuales son los requisitos y el procedimiento para la devolucion del IVA pagado por \
                turistas extranjeros en compras realizadas en Colombia?
                """,
            sintesis: """
                Se explica el procedimiento de devolucion de IVA a turistas extranjeros conforme al \
                articulo 850 del E.T., incluyendo los montos minimos de compra, los establecimientos \
                autorizados y el tramite en aeropuertos internacionales.
                """,
            conclusionClave: """
                Los turistas extranjeros no residentes pueden solicitar la devolucion del IVA pagado \
                en compras superiores a 10 UVT realizadas en establecimientos autorizados, \
                presentando factura electronica, pasaporte y tarjeta de embarque al salir del pais.
                """,
            articulosET: ["481", "850", "851"],
            tipoDocumento: .concepto,
            descriptores: ["devolucion IVA", "turistas", "extranjeros", "compras"],
            vigente: true
        ),

        DoctrinaCurada(
            id: "doc-009",
            numero: "Concepto 001456 de 2024",
            fecha: "2024-06-18",
            tema: "Tratamiento del IVA en arrendamiento de inmuebles",
            pregunta: "El arrendamiento de inmuebles destinados a vivienda esta gravado con IVA?",
            sintesis: """
                Se aclara que el arrendamiento de inmuebles para vivienda esta excluido de IVA \
                conforme al articulo 476 numeral 15 del E.T. Sin embargo, el arrendamiento de \
                inmuebles para uso comercial si esta gravado con la tarifa general del 19%.
                """,
            conclusionClave: """
                El arrendamiento de inmuebles destinados a vivienda esta excluido de IVA. El \
                arrendamiento comercial esta gravado al 19%. La destinacion efectiva del inmueble \
                determina el tratamiento, no la clasificacion catastral.
                """,
            articulosET: ["420", "476"],
            tipoDocumento: .concepto,
            descriptores: ["arrendamiento", "inmuebles", "vivienda", "comercial", "IVA"],
            vigente: true
        ),

        // ── Retencion en la Fuente ──

        DoctrinaCurada(
            id: "doc-010",
            numero: "Concepto 000234 de 2025",
            fecha: "2025-02-14",
            tema: "Retencion en la fuente por pagos al exterior",
            pregunta: """
                Cual es la tarifa de retencion aplicable a pagos por servicios tecnicos, asistencia \
                tecnica y consultoria realizados a personas no residentes?
                """,
            sintesis: """
                Se analiza el regimen de retenciones aplicable a pagos al exterior por servicios \
                tecnicos y consultoria conforme al articulo 408 del E.T. La tarifa general es del \
                20% sobre el valor bruto del pago, sin perjuicio de tarifas reducidas por CDI.
                """,
            conclusionClave: """
                Los pagos al exterior por servicios tecnicos, asistencia tecnica y consultoria estan \
                sujetos a retencion del 20% (art. 408 E.T.). Si existe CDI vigente, puede aplicarse \
                tarifa reducida acreditando certificado de residencia fiscal del beneficiario.
                """,
            articulosET: ["406", "408", "414-1", "418"],
            tipoDocumento: .concepto,
            descriptores: ["retencion", "pagos exterior", "servicios tecnicos", "no residentes"],
            vigente: true
        ),

        DoctrinaCurada(
            id: "doc-011",
            numero: "Oficio 003456 de 2024",
            fecha: "2024-10-08",
            tema: "Retencion en la fuente por rendimientos financieros",
            pregunta: """
                Cual es la base y tarifa de retencion aplicable a los rendimientos financieros de \
                CDTs y cuentas de ahorro?
                """,
            sintesis: """
                Se precisan las reglas de retencion en la fuente sobre rendimientos financieros, \
                incluyendo CDTs, cuentas de ahorro y fiducias. La tarifa general es del 4% para \
                personas naturales residentes y del 7% para personas juridicas.
                """,
            conclusionClave: """
                La retencion por rendimientos financieros es: 4% para personas naturales declarantes, \
                7% para personas juridicas. Los primeros $2.100.000 mensuales (valor 2025) de \
                rendimientos de cuentas de ahorro estan exentos para personas naturales conforme al \
                numeral 4 del art. 408.
                """,
            articulosET: ["395", "396", "399", "400"],
            tipoDocumento: .oficio,
            descriptores: ["rendimientos financieros", "CDT", "retencion", "ahorro"],
            vigente: true
        ),

        DoctrinaCurada(
            id: "doc-012",
            numero: "Concepto 000789 de 2024",
            fecha: "2024-05-20",
            tema: "Base minima de retencion en compras",
            pregunta: """
                Cual es la base minima para practicar retencion en la fuente por concepto de compras \
                de bienes muebles e inmuebles?
                """,
            sintesis: """
                Se precisa que la base minima para retencion por compras es de 27 UVT conforme al \
                articulo 401 del E.T. Para compras de bienes raices la tarifa es del 1% sobre el \
                valor total. Para bienes muebles aplica el 2,5% sobre pagos o abonos en cuenta.
                """,
            conclusionClave: """
                Retencion en compras: bienes muebles 2,5% sobre base minima de 27 UVT; bienes \
                raices 1% sin base minima. Los grandes contribuyentes autorretenedores no estan \
                sujetos a retencion por parte de terceros.
                """,
            articulosET: ["401", "392", "518"],
            tipoDocumento: .concepto,
            descriptores: ["retencion compras", "base minima", "bienes muebles", "bienes raices"],
            vigente: true
        ),

        DoctrinaCurada(
            id: "doc-013",
            numero: "Concepto General 001567 de 2023",
            fecha: "2023-07-12",
            tema: "Procedimiento 1 y Procedimiento 2 de retencion laboral",
            pregunta: """
                Cuando debe aplicarse el Procedimiento 1 y cuando el Procedimiento 2 para calcular \
                la retencion en la fuente por pagos laborales?
                """,
            sintesis: """
                Se explican los dos procedimientos de retencion laboral del articulo 385 y 386 del \
                E.T. El Procedimiento 1 aplica la tabla mensual vigente. El Procedimiento 2 usa un \
                porcentaje fijo calculado semestralmente con base en los ingresos del semestre \
                anterior.
                """,
            conclusionClave: """
                Procedimiento 1: se aplica la tabla de retencion del art. 383 al ingreso mensual \
                depurado. Procedimiento 2: el empleador calcula un porcentaje fijo en junio y \
                diciembre que se aplica durante el semestre siguiente. El empleador puede elegir \
                libremente entre ambos.
                """,
            articulosET: ["383", "385", "386", "387", "388"],
            tipoDocumento: .doctrinaGeneral,
            descriptores: ["retencion laboral", "procedimiento 1", "procedimiento 2", "salarios"],
            vigente: true
        ),

        // ── Regimen SIMPLE ──

        DoctrinaCurada(
            id: "doc-014",
            numero: "Concepto 001890 de 2025",
            fecha: "2025-05-08",
            tema: "Requisitos de inscripcion en el SIMPLE",
            pregunta: """
                Cuales son los requisitos y limites de ingresos para optar por el Regimen Simple de \
                Tributacion (RST)?
                """,
            sintesis: """
                Se detallan los requisitos del articulo 905 del E.T. para inscribirse en el SIMPLE: \
                ser persona natural o juridica residente, tener ingresos brutos inferiores a 100.000 \
                UVT, estar al dia con obligaciones tributarias y no estar incurso en causales de \
                exclusion.
                """,
            conclusionClave: """
                Para pertenecer al SIMPLE: ingresos brutos anuales no superiores a 100.000 UVT, no \
                ser sociedad cuya participacion sea de entidades excluidas, estar al dia con \
                obligaciones tributarias, y no pertenecer a actividades excluidas (sector financiero, \
                seguros, grandes contribuyentes).
                """,
            articulosET: ["903", "905", "906"],
            tipoDocumento: .concepto,
            descriptores: ["SIMPLE", "RST", "requisitos", "inscripcion", "limites"],
            vigente: true
        ),

        DoctrinaCurada(
            id: "doc-015",
            numero: "Oficio 002678 de 2024",
            fecha: "2024-09-15",
            tema: "Tarifas consolidadas del SIMPLE",
            pregunta: "Como se determinan las tarifas del SIMPLE y cuales impuestos integra?",
            sintesis: """
                Se explica que el SIMPLE integra renta, ICA, impuesto al consumo (para \
                establecimientos de comida y bebidas) y el componente de ganancia ocasional. Las \
                tarifas son progresivas segun rango de ingresos y grupo de actividad economica \
                conforme al articulo 908 del E.T.
                """,
            conclusionClave: """
                El SIMPLE agrupa: renta, ICA e impuesto al consumo en una sola declaracion. Las \
                tarifas van desde 1,8% hasta 14,5% segun actividad e ingresos. El pago bimestral de \
                anticipos es obligatorio. El credito por aportes a pension de empleados se descuenta \
                de la obligacion.
                """,
            articulosET: ["903", "907", "908", "910", "911"],
            tipoDocumento: .oficio,
            descriptores: ["SIMPLE", "tarifas", "consolidada", "actividades economicas"],
            vigente: true
        ),

        DoctrinaCurada(
            id: "doc-016",
            numero: "Concepto 000567 de 2023",
            fecha: "2023-04-25",
            tema: "Exclusion del SIMPLE por exceder limites de ingresos",
            pregunta: """
                Que sucede si un contribuyente del SIMPLE excede el limite de 100.000 UVT de \
                ingresos durante el ano gravable?
                """,
            sintesis: """
                Se analiza la consecuencia de superar los limites de ingresos del SIMPLE. El \
                contribuyente debe retirarse del regimen al finalizar el ano gravable y declarar \
                bajo el regimen ordinario por el ano completo.
                """,
            conclusionClave: """
                Si un contribuyente del SIMPLE supera los 100.000 UVT en un ano, debe: (i) \
                continuar declarando como SIMPLE por ese ano, (ii) retirarse antes del 31 de enero \
                del ano siguiente, y (iii) tributar en el regimen ordinario desde el ano siguiente.
                """,
            articulosET: ["905", "906", "909"],
            tipoDocumento: .concepto,
            descriptores: ["SIMPLE", "exclusion", "limites ingresos", "retiro"],
            vigente: true
        ),

        // ── Precios de Transferencia ──

        DoctrinaCurada(
            id: "doc-017",
            numero: "Concepto 002345 de 2025",
            fecha: "2025-07-22",
            tema: "Obligacion de documentacion comprobatoria en precios de transferencia",
            pregunta: """
                Quienes estan obligados a presentar documentacion comprobatoria de precios de \
                transferencia y cuales son los umbrales?
                """,
            sintesis: """
                Se detallan los obligados a presentar documentacion comprobatoria conforme al \
                articulo 260-5 del E.T.: contribuyentes con operaciones con vinculados del exterior \
                o zonas francas que superen umbrales de patrimonio bruto (100.000 UVT) o ingresos \
                brutos (61.000 UVT).
                """,
            conclusionClave: """
                La documentacion comprobatoria es obligatoria cuando: patrimonio bruto supere \
                100.000 UVT O ingresos brutos superen 61.000 UVT, Y se tengan operaciones con \
                vinculados del exterior o personas en jurisdicciones no cooperantes. Se presenta con \
                la declaracion informativa anual.
                """,
            articulosET: ["260-1", "260-2", "260-4", "260-5"],
            tipoDocumento: .concepto,
            descriptores: ["precios de transferencia", "documentacion comprobatoria", "vinculados", "umbrales"],
            vigente: true
        ),

        DoctrinaCurada(
            id: "doc-018",
            numero: "Oficio 001234 de 2024",
            fecha: "2024-07-30",
            tema: "Metodos de precios de transferencia aceptados",
            pregunta: """
                Cuales son los metodos aceptados por la DIAN para determinar el precio o margen de \
                plena competencia?
                """,
            sintesis: """
                Se explican los seis metodos aceptados: Precio Comparable No Controlado, Precio de \
                Reventa, Costo Adicionado, Particion de Utilidades, Residual de Particion de \
                Utilidades y Margen Neto Transaccional, conforme al articulo 260-3 del E.T.
                """,
            conclusionClave: """
                El metodo del Precio Comparable No Controlado es preferente cuando exista informacion \
                comparable suficiente. El contribuyente debe seleccionar el metodo mas apropiado \
                dadas las circunstancias, documentando las razones de su eleccion.
                """,
            articulosET: ["260-2", "260-3"],
            tipoDocumento: .oficio,
            descriptores: ["precios de transferencia", "metodos", "plena competencia", "comparable"],
            vigente: true
        ),

        // ── Facturacion Electronica ──

        DoctrinaCurada(
            id: "doc-019",
            numero: "Concepto 001345 de 2025",
            fecha: "2025-09-05",
            tema: "Obligaciones de facturacion electronica",
            pregunta: """
                Quienes estan obligados a expedir factura electronica de venta y cuales son las \
                excepciones?
                """,
            sintesis: """
                Se detallan los obligados a facturar electronicamente conforme al articulo 615 y \
                616-1 del E.T. Todos los responsables de IVA e impuesto al consumo deben expedir \
                factura electronica, con excepciones para el regimen SIMPLE con ingresos menores a \
                3.500 UVT anuales.
                """,
            conclusionClave: """
                La factura electronica de venta con validacion previa es obligatoria para \
                responsables de IVA y del impuesto al consumo. Excepciones: operaciones menores a \
                5 UVT (con tiquete POS), bancos, transporte publico, y contribuyentes del SIMPLE \
                con ingresos inferiores a 3.500 UVT.
                """,
            articulosET: ["615", "616-1", "617", "618"],
            tipoDocumento: .concepto,
            descriptores: ["factura electronica", "obligados", "excepciones", "validacion previa"],
            vigente: true
        ),

        DoctrinaCurada(
            id: "doc-020",
            numero: "Oficio 003789 de 2024",
            fecha: "2024-12-10",
            tema: "Documento soporte en operaciones con no obligados a facturar",
            pregunta: """
                Cual es el documento soporte requerido cuando se realizan compras a personas no \
                obligadas a facturar?
                """,
            sintesis: """
                Se explica que conforme al articulo 771-2 del E.T. y la Resolucion 000167 de 2021, \
                el adquirente debe generar el Documento Soporte en Adquisiciones con No Obligados \
                (DSAN) para soportar costos y deducciones.
                """,
            conclusionClave: """
                El comprador debe generar el DSAN con validacion previa por la DIAN cuando adquiera \
                bienes o servicios de personas no obligadas a facturar. Sin este documento no procede \
                la deduccion del costo o gasto ni el IVA descontable.
                """,
            articulosET: ["616-1", "771-2", "771-5"],
            tipoDocumento: .oficio,
            descriptores: ["documento soporte", "no obligados", "facturacion", "DSAN"],
            vigente: true
        ),

        // ── Procedimiento Tributario ──

        DoctrinaCurada(
            id: "doc-021",
            numero: "Concepto 000234 de 2024",
            fecha: "2024-02-28",
            tema: "Sancion por extemporaneidad en declaraciones tributarias",
            pregunta: """
                Como se calcula la sancion por extemporaneidad cuando no hay impuesto a cargo ni \
                ingresos?
                """,
            sintesis: """
                Se analiza el articulo 641 del E.T. La sancion por extemporaneidad es el 5% del \
                total del impuesto a cargo por cada mes o fraccion de retraso. Cuando no hay \
                impuesto a cargo, se calcula el 0,5% de los ingresos brutos. Si no hay ingresos, \
                la sancion minima es de 10 UVT.
                """,
            conclusionClave: """
                Sancion por extemporaneidad: 5% del impuesto por cada mes de retraso (maximo 100%). \
                Sin impuesto a cargo: 0,5% de ingresos brutos (maximo 5%). Sin impuesto ni ingresos: \
                sancion minima de 10 UVT. La sancion se reduce al 50% si se presenta antes del \
                emplazamiento.
                """,
            articulosET: ["641", "642", "640"],
            tipoDocumento: .concepto,
            descriptores: ["sancion", "extemporaneidad", "declaraciones", "calculo"],
            vigente: true
        ),

        DoctrinaCurada(
            id: "doc-022",
            numero: "Concepto General 003456 de 2023",
            fecha: "2023-11-15",
            tema: "Firmeza de las declaraciones tributarias",
            pregunta: "En que plazo queda en firme una declaracion de renta ordinaria?",
            sintesis: """
                Se explica que conforme al articulo 714 del E.T., la declaracion de renta queda en \
                firme si dentro de los 3 anos siguientes al vencimiento del plazo para declarar (o \
                a la presentacion extemporanea) la DIAN no notifica requerimiento especial.
                """,
            conclusionClave: """
                La firmeza ordinaria es de 3 anos desde el vencimiento o la presentacion \
                extemporanea. Se extiende a 5 anos para declaraciones con perdidas fiscales, saldos \
                a favor y contribuyentes de precios de transferencia. 12 anos para operaciones con \
                paraisos fiscales.
                """,
            articulosET: ["714", "705", "706", "710"],
            tipoDocumento: .doctrinaGeneral,
            descriptores: ["firmeza", "declaraciones", "terminos", "caducidad"],
            vigente: true
        ),

        DoctrinaCurada(
            id: "doc-023",
            numero: "Oficio 004567 de 2025",
            fecha: "2025-08-20",
            tema: "Beneficio de auditoria en declaraciones de renta",
            pregunta: "En que consiste el beneficio de auditoria y cuales son los requisitos para acceder?",
            sintesis: """
                Se explica el beneficio de auditoria del articulo 689-3 del E.T. que permite la \
                firmeza anticipada de la declaracion en 6 o 12 meses si el contribuyente incrementa \
                su impuesto neto de renta respecto del periodo anterior en ciertos porcentajes.
                """,
            conclusionClave: """
                Firmeza en 6 meses: incremento del impuesto neto >= 30% respecto del periodo \
                anterior. Firmeza en 12 meses: incremento >= 20%. No aplica a declaraciones con \
                perdida, compensaciones o saldo a favor.
                """,
            articulosET: ["689-3"],
            tipoDocumento: .oficio,
            descriptores: ["beneficio de auditoria", "firmeza", "incremento impuesto", "6 meses"],
            vigente: true
        ),

        // ── Impuesto al Patrimonio ──

        DoctrinaCurada(
            id: "doc-024",
            numero: "Concepto 002567 de 2024",
            fecha: "2024-08-05",
            tema: "Base gravable del impuesto al patrimonio",
            pregunta: """
                Como se determina la base gravable del impuesto al patrimonio creado por la Ley \
                2277 de 2022?
                """,
            sintesis: """
                Se explica que la base gravable es el patrimonio liquido al 1 de enero de cada ano, \
                excluyendo los primeros 72.000 UVT, los bienes objeto de impuesto complementario de \
                normalizacion y las primeras 12.000 UVT de la vivienda de habitacion.
                """,
            conclusionClave: """
                Base gravable = Patrimonio liquido a enero 1 - 72.000 UVT (exclusion general) - \
                12.000 UVT (vivienda de habitacion). Tarifas progresivas: 0,5% (0-72.000 UVT \
                excedente), 1% (72.000-122.000), 1,5% (mas de 122.000). Se declara y paga anualmente.
                """,
            articulosET: ["292-3", "294-3", "295-3", "296-3"],
            tipoDocumento: .concepto,
            descriptores: ["patrimonio", "base gravable", "tarifas", "exclusiones"],
            vigente: true
        ),

        // ── Dividendos ──

        DoctrinaCurada(
            id: "doc-025",
            numero: "Concepto 001678 de 2025",
            fecha: "2025-04-12",
            tema: "Tributacion de dividendos para personas naturales residentes",
            pregunta: "Como tributan los dividendos recibidos por personas naturales residentes en Colombia?",
            sintesis: """
                Se explica la doble imposicion economica sobre dividendos: primero tributan a nivel \
                de la sociedad (tarifa general del 35%) y luego a nivel del accionista persona \
                natural con la tabla del articulo 242 del E.T. (tarifa del 0% a 20% sobre \
                dividendos gravados).
                """,
            conclusionClave: """
                Dividendos de utilidades gravadas a nivel societario: tarifa del 0% hasta 1.090 UVT \
                y 10% sobre el exceso. Dividendos no gravados: tarifa del articulo 242. Total carga \
                tributaria maxima puede ser del 41,18%. Para no residentes la retencion es del 20% \
                sobre la parte gravada.
                """,
            articulosET: ["49", "242", "242-1", "245", "246"],
            tipoDocumento: .concepto,
            descriptores: ["dividendos", "persona natural", "tarifa", "doble tributacion"],
            vigente: true
        ),

        // ── Zonas Francas ──

        DoctrinaCurada(
            id: "doc-026",
            numero: "Oficio 002890 de 2024",
            fecha: "2024-06-28",
            tema: "Tarifa de renta en zonas francas tras Ley 2277",
            pregunta: """
                Cual es la tarifa de renta aplicable a empresas ubicadas en zonas francas despues \
                de la Ley 2277 de 2022?
                """,
            sintesis: """
                Se aclara que la Ley 2277 mantuvo la tarifa del 20% para usuarios industriales de \
                zonas francas, condicionada a que cumplan requisitos de inversion, empleo y \
                exportacion. Para usuarios comerciales aplica la tarifa general del 35%.
                """,
            conclusionClave: """
                Usuarios industriales de bienes y servicios en zonas francas: tarifa del 20% si \
                cumplen plan de internacionalizacion con exportaciones >= 40% (gradualmente). \
                Usuarios comerciales: tarifa general del 35%. Nuevas zonas francas deben comprometer \
                metas de empleo e inversion.
                """,
            articulosET: ["240", "240-1"],
            tipoDocumento: .oficio,
            descriptores: ["zonas francas", "tarifa", "20%", "usuarios industriales", "Ley 2277"],
            vigente: true
        ),

        // ── Economia Digital ──

        DoctrinaCurada(
            id: "doc-027",
            numero: "Concepto 003456 de 2025",
            fecha: "2025-10-15",
            tema: "Tributacion de creadores de contenido digital",
            pregunta: """
                Como deben declarar los ingresos las personas naturales que obtienen rentas como \
                creadores de contenido en plataformas digitales?
                """,
            sintesis: """
                Se analiza el tratamiento tributario de ingresos obtenidos por YouTubers, streamers \
                y creadores de contenido. Los ingresos por publicidad, patrocinios y donaciones se \
                clasifican como rentas de trabajo o no laborales segun el caso.
                """,
            conclusionClave: """
                Los ingresos por creacion de contenido digital se clasifican como: (i) rentas de \
                trabajo si hay relacion laboral, (ii) rentas no laborales por honorarios si son \
                independientes. Los pagos del exterior se declaran como renta de fuente nacional si \
                el creador es residente fiscal colombiano.
                """,
            articulosET: ["103", "329", "330", "336", "340"],
            tipoDocumento: .concepto,
            descriptores: ["contenido digital", "creadores", "plataformas", "renta"],
            vigente: true
        ),

        DoctrinaCurada(
            id: "doc-028",
            numero: "Oficio 001567 de 2023",
            fecha: "2023-05-18",
            tema: "Retencion a pagos por plataformas de domicilios",
            pregunta: """
                Las plataformas de domicilios como Rappi deben practicar retencion en la fuente a \
                los repartidores (rappitenderos)?
                """,
            sintesis: """
                Se analiza si las plataformas tecnologicas de intermediacion actuan como agentes de \
                retencion respecto de los pagos a los trabajadores independientes (repartidores). La \
                DIAN concluye que si deben retener como agentes de retencion.
                """,
            conclusionClave: """
                Las plataformas de domicilios son agentes de retencion por los pagos a repartidores. \
                Tarifa aplicable: 4% por servicios generales si el repartidor es declarante, 6% si \
                es no declarante. Base: pagos o abonos que superen 4 UVT.
                """,
            articulosET: ["368", "392", "401"],
            tipoDocumento: .oficio,
            descriptores: ["plataformas", "domicilios", "retencion", "repartidores"],
            vigente: true
        ),

        // ── Beneficios Tributarios ──

        DoctrinaCurada(
            id: "doc-029",
            numero: "Concepto 000890 de 2024",
            fecha: "2024-03-22",
            tema: "Deduccion por inversiones en ciencia, tecnologia e innovacion",
            pregunta: """
                Subsiste la deduccion por inversiones en proyectos de ciencia, tecnologia e \
                innovacion despues de la Ley 2277?
                """,
            sintesis: """
                Se aclara que la Ley 2277 mantuvo los beneficios del articulo 256 del E.T. para \
                inversiones en proyectos calificados por Colciencias/Minciencias, pero con un limite \
                del 30% de la renta liquida.
                """,
            conclusionClave: """
                Deduccion del 100% + descuento tributario del 25% sobre inversiones en CTI aprobadas \
                por Minciencias. Limite: la deduccion y el descuento juntos no pueden exceder el 30% \
                de la renta liquida. Los excesos se pueden diferir a los 4 anos siguientes.
                """,
            articulosET: ["256", "258"],
            tipoDocumento: .concepto,
            descriptores: ["CTI", "ciencia", "tecnologia", "innovacion", "deduccion", "descuento"],
            vigente: true
        ),

        DoctrinaCurada(
            id: "doc-030",
            numero: "Oficio 002123 de 2025",
            fecha: "2025-06-20",
            tema: "Aportes voluntarios a fondos de pensiones como ingreso no constitutivo de renta",
            pregunta: """
                Cual es el tratamiento tributario de los aportes voluntarios a fondos de pensiones \
                obligatorias y cuentas AFC?
                """,
            sintesis: """
                Se explica que los aportes voluntarios a fondos de pensiones y AFC son ingresos no \
                constitutivos de renta ni ganancia ocasional hasta el 25% del ingreso laboral con \
                limite de 2.500 UVT anuales, conforme al articulo 126-1 del E.T.
                """,
            conclusionClave: """
                Aportes voluntarios a pensiones + AFC + AVC: exentos hasta 25% del ingreso laboral \
                con tope de 2.500 UVT anuales (sumados con rentas exentas del art. 206 num. 10). \
                Para la exencion, los aportes deben permanecer minimo 10 anos (pensiones) o 10 \
                anos/cumplir requisitos de vivienda (AFC).
                """,
            articulosET: ["126-1", "126-4", "206"],
            tipoDocumento: .oficio,
            descriptores: ["aportes voluntarios", "pensiones", "AFC", "exencion"],
            vigente: true
        ),

        // ── Impuestos Territoriales ──

        DoctrinaCurada(
            id: "doc-031",
            numero: "Concepto 001234 de 2023",
            fecha: "2023-08-30",
            tema: "Descuento del ICA en el impuesto de renta",
            pregunta: """
                El ICA efectivamente pagado se puede tomar como descuento tributario en la \
                declaracion de renta?
                """,
            sintesis: """
                Se confirma que conforme al articulo 115 del E.T. modificado por la Ley 2010 de \
                2019, el 50% del ICA efectivamente pagado en el ano gravable se puede tomar como \
                descuento tributario en la declaracion de renta.
                """,
            conclusionClave: """
                El 50% del ICA, avisos y tableros efectivamente pagado durante el ano gravable es \
                descuento tributario en renta. El otro 50% es deducible como gasto. No puede \
                tomarse simultaneamente el 100% como deduccion y como descuento.
                """,
            articulosET: ["115", "259"],
            tipoDocumento: .concepto,
            descriptores: ["ICA", "descuento tributario", "renta", "deduccion"],
            vigente: true
        ),

        // ── Obligaciones Formales ──

        DoctrinaCurada(
            id: "doc-032",
            numero: "Concepto 002678 de 2025",
            fecha: "2025-11-08",
            tema: "Informacion exogena ante la DIAN",
            pregunta: """
                Quienes estan obligados a presentar informacion exogena ante la DIAN y cuales son \
                los formatos principales?
                """,
            sintesis: """
                Se detallan los obligados a reportar informacion exogena conforme al articulo 631 \
                del E.T. y la resolucion anual de la DIAN. Incluye grandes contribuyentes, agentes \
                de retencion, entidades financieras y contribuyentes con ingresos superiores a \
                ciertos umbrales.
                """,
            conclusionClave: """
                Obligados a exogena: personas juridicas/naturales con ingresos brutos superiores a \
                la cuantia que fije la DIAN anualmente, agentes de retencion, entidades financieras. \
                Formatos principales: 1001 (pagos), 1003 (retenciones), 1005 (IVA descontable), \
                1006 (IVA generado), 1007 (ingresos).
                """,
            articulosET: ["631", "631-3", "651"],
            tipoDocumento: .concepto,
            descriptores: ["informacion exogena", "reportes", "formatos", "obligados"],
            vigente: true
        ),

        DoctrinaCurada(
            id: "doc-033",
            numero: "Oficio 003890 de 2024",
            fecha: "2024-11-30",
            tema: "Registro Unico Tributario (RUT) - Actualizacion de responsabilidades",
            pregunta: "Cuando debe actualizarse el RUT por cambio de responsabilidades tributarias?",
            sintesis: """
                Se recuerda que el RUT debe actualizarse dentro del mes siguiente a cualquier cambio \
                en las responsabilidades tributarias: pasar de no responsable a responsable de IVA, \
                inscripcion o retiro del SIMPLE, calificacion como gran contribuyente, entre otros.
                """,
            conclusionClave: """
                El RUT debe actualizarse en el mes siguiente al cambio. Sancion por no actualizar: \
                1 UVT por cada dia de retraso, hasta un maximo de 100 UVT. La actualizacion puede \
                hacerse virtualmente o en puntos de contacto de la DIAN.
                """,
            articulosET: ["555-2", "658-3"],
            tipoDocumento: .oficio,
            descriptores: ["RUT", "actualizacion", "responsabilidades", "sancion"],
            vigente: true
        ),

        // ── Convenios Internacionales ──

        DoctrinaCurada(
            id: "doc-034",
            numero: "Concepto 001890 de 2024",
            fecha: "2024-04-10",
            tema: "Aplicacion de CDI - Certificado de residencia fiscal",
            pregunta: """
                Que requisitos debe cumplir un certificado de residencia fiscal para aplicar \
                beneficios de un Convenio para Evitar la Doble Imposicion?
                """,
            sintesis: """
                Se detallan los requisitos del certificado de residencia fiscal para aplicar tarifas \
                reducidas de CDI: debe ser expedido por la autoridad competente del otro Estado, \
                tener vigencia para el periodo fiscal correspondiente y estar debidamente apostillado.
                """,
            conclusionClave: """
                El certificado debe: (i) ser emitido por la autoridad fiscal del Estado de \
                residencia, (ii) identificar al beneficiario, (iii) indicar la vigencia del periodo \
                fiscal, (iv) estar apostillado o legalizado. Sin certificado valido, se aplican las \
                tarifas domesticas colombianas.
                """,
            articulosET: ["18-1", "254", "408"],
            tipoDocumento: .concepto,
            descriptores: ["CDI", "certificado residencia", "doble imposicion", "apostilla"],
            vigente: true
        ),

        // ── Sanciones ──

        DoctrinaCurada(
            id: "doc-035",
            numero: "Concepto General 004567 de 2023",
            fecha: "2023-10-20",
            tema: "Principio de favorabilidad en sanciones tributarias",
            pregunta: "Aplica el principio de favorabilidad penal en la determinacion de sanciones tributarias?",
            sintesis: """
                Se analiza la aplicacion del principio de favorabilidad del articulo 640 del E.T. \
                que permite la reduccion de sanciones cuando el contribuyente subsana la \
                irregularidad voluntariamente antes del acto administrativo de la DIAN.
                """,
            conclusionClave: """
                Reduccion de sanciones (art. 640 E.T.): al 50% si se corrige antes del pliego de \
                cargos o emplazamiento; al 75% si se corrige despues del pliego pero antes de la \
                resolucion sancion. Las sanciones reducidas requieren pago y aceptacion de la \
                sancion.
                """,
            articulosET: ["640", "641", "642", "643", "644"],
            tipoDocumento: .doctrinaGeneral,
            descriptores: ["sanciones", "favorabilidad", "reduccion", "gradualidad"],
            vigente: true
        ),

        DoctrinaCurada(
            id: "doc-036",
            numero: "Oficio 001456 de 2025",
            fecha: "2025-03-30",
            tema: "Sancion por no enviar informacion o enviarla con errores",
            pregunta: """
                Cual es la sancion por no enviar informacion exogena o enviarla con errores conforme \
                al articulo 651 del E.T.?
                """,
            sintesis: """
                Se explica la sancion del articulo 651 del E.T.: hasta el 5% de las sumas respecto \
                de las cuales se omitio la informacion o se suministro en forma erronea. La sancion \
                tiene gradualidad segun el momento de correccion.
                """,
            conclusionClave: """
                Sancion art. 651: hasta 5% de las sumas omitidas/erroneas, con limite de 15.000 \
                UVT. Reduccion: al 20% si se corrige antes del pliego de cargos, al 50% despues del \
                pliego pero antes de la resolucion. Sancion minima: 10 UVT.
                """,
            articulosET: ["651", "640"],
            tipoDocumento: .oficio,
            descriptores: ["sancion", "informacion exogena", "errores", "omision"],
            vigente: true
        ),

        // ── Temas Especiales ──

        DoctrinaCurada(
            id: "doc-037",
            numero: "Concepto 003789 de 2025",
            fecha: "2025-12-01",
            tema: "Regimen de entidades controladas del exterior (ECE)",
            pregunta: """
                Como opera el regimen de Entidades Controladas del Exterior (ECE) para residentes \
                fiscales colombianos?
                """,
            sintesis: """
                Se explica el regimen ECE del articulo 882 al 893 del E.T. Los residentes \
                colombianos que controlen entidades del exterior deben declarar los ingresos pasivos \
                de dichas entidades en su declaracion de renta, incluso si no han sido distribuidos.
                """,
            conclusionClave: """
                Las rentas pasivas de ECE (intereses, regalias, dividendos, arrendamientos) se \
                gravan en cabeza del controlante colombiano en el ano en que se generan, sin esperar \
                su distribucion. Control: participacion directa o indirecta >= 10%.
                """,
            articulosET: ["882", "883", "884", "885", "886", "887", "893"],
            tipoDocumento: .concepto,
            descriptores: ["ECE", "entidades controladas", "rentas pasivas", "exterior"],
            vigente: true
        ),

        DoctrinaCurada(
            id: "doc-038",
            numero: "Oficio 002345 de 2025",
            fecha: "2025-05-15",
            tema: "Tratamiento de criptoactivos en declaracion de renta",
            pregunta: "Como se deben declarar las criptomonedas y tokens en la declaracion de renta?",
            sintesis: """
                Se establece que los criptoactivos deben declararse como activos intangibles en la \
                seccion de otros activos del formulario 210. La ganancia realizada por venta tributa \
                como renta ordinaria o ganancia ocasional segun el tiempo de tenencia.
                """,
            conclusionClave: """
                Los criptoactivos se declaran como activos al costo de adquisicion. Ganancia por \
                venta: renta ordinaria si se vendio dentro de los primeros 2 anos de tenencia, \
                ganancia ocasional despues de 2 anos. No hay regimen especial; aplican reglas \
                generales del E.T.
                """,
            articulosET: ["261", "267", "271", "300", "303-1"],
            tipoDocumento: .oficio,
            descriptores: ["criptoactivos", "bitcoin", "declaracion", "ganancia"],
            vigente: true
        ),

        DoctrinaCurada(
            id: "doc-039",
            numero: "Concepto 000123 de 2023",
            fecha: "2023-02-10",
            tema: "Compensacion de perdidas fiscales",
            pregunta: "En cuantos anos se pueden compensar las perdidas fiscales y existen limitaciones?",
            sintesis: """
                Se analiza la compensacion de perdidas fiscales conforme al articulo 147 del E.T. \
                Las perdidas fiscales pueden compensarse sin limite de tiempo contra rentas liquidas \
                ordinarias de periodos gravables siguientes, sin exceder cada ano el limite del \
                articulo.
                """,
            conclusionClave: """
                Perdidas fiscales: sin limite temporal para su compensacion. Limite anual: hasta el \
                100% de la renta liquida del periodo. Las perdidas de periodos de consolidacion del \
                SIMPLE no se compensan en el ordinario. La firmeza de la declaracion con perdida es \
                de 5 anos.
                """,
            articulosET: ["147", "330", "714"],
            tipoDocumento: .concepto,
            descriptores: ["perdidas fiscales", "compensacion", "renta liquida", "limite"],
            vigente: true
        ),

        DoctrinaCurada(
            id: "doc-040",
            numero: "Oficio 004123 de 2024",
            fecha: "2024-12-20",
            tema: "Renta presuntiva tras Ley 2277",
            pregunta: "Cual es la tarifa de renta presuntiva vigente despues de la Ley 2277 de 2022?",
            sintesis: """
                Se confirma que la Ley 2010 de 2019 redujo gradualmente la renta presuntiva hasta \
                llegar a 0% a partir del ano gravable 2021. La Ley 2277 de 2022 no modifico esta \
                disposicion, por lo que la tarifa de renta presuntiva continua en 0%.
                """,
            conclusionClave: """
                La tarifa de renta presuntiva es del 0% desde el ano gravable 2021 (art. 188 E.T. \
                modificado por Ley 2010). La Ley 2277 no la restablecio. Los contribuyentes ya no \
                deben comparar la renta presuntiva con la renta liquida para determinar la base \
                gravable.
                """,
            articulosET: ["188", "189"],
            tipoDocumento: .oficio,
            descriptores: ["renta presuntiva", "tarifa", "0%", "Ley 2010"],
            vigente: true
        ),

        DoctrinaCurada(
            id: "doc-041",
            numero: "Concepto 002890 de 2025",
            fecha: "2025-08-25",
            tema: "Impuesto de timbre en operaciones con cuantia superior a 6.000 UVT",
            pregunta: "Cuando se causa el impuesto de timbre y cual es su tarifa actual?",
            sintesis: """
                Se analiza el impuesto de timbre del articulo 519 del E.T. Actualmente la tarifa es \
                del 0% para la mayoria de documentos, excepto los otorgados o aceptados en el \
                exterior que tengan efectos en Colombia (tarifa del 1,5%).
                """,
            conclusionClave: """
                Impuesto de timbre: tarifa general del 0% desde 2010. Excepcion: documentos \
                otorgados en el exterior con efectos en Colombia mantienen tarifa del 1,5% cuando \
                la cuantia supere 6.000 UVT. Aplica sobre contratos, escrituras y documentos \
                privados con cuantia determinada.
                """,
            articulosET: ["519", "520", "521", "530"],
            tipoDocumento: .concepto,
            descriptores: ["timbre", "documentos", "exterior", "tarifa"],
            vigente: true
        ),

        DoctrinaCurada(
            id: "doc-042",
            numero: "Concepto 001234 de 2025",
            fecha: "2025-01-28",
            tema: "Deduccion de gastos en el exterior",
            pregunta: "Cuales son los limites para la deduccion de gastos realizados en el exterior?",
            sintesis: """
                Se explica el articulo 122 del E.T. que limita la deduccion de gastos en el \
                exterior al 15% de la renta liquida. Este limite no aplica cuando existe CDI \
                vigente, o cuando los gastos se originan en pagos a vinculados del exterior \
                debidamente documentados en precios de transferencia.
                """,
            conclusionClave: """
                Gastos en el exterior: deducibles hasta el 15% de la renta liquida (art. 122). \
                Excepciones al limite: (i) pagos bajo CDI vigente, (ii) costos y gastos por compra \
                de mercancias, (iii) comisiones por compra o venta de mercancias, (iv) intereses \
                sobre deudas documentadas.
                """,
            articulosET: ["121", "122", "123", "124"],
            tipoDocumento: .concepto,
            descriptores: ["gastos exterior", "deduccion", "15%", "limite"],
            vigente: true
        ),

        DoctrinaCurada(
            id: "doc-043",
            numero: "Oficio 003567 de 2023",
            fecha: "2023-06-22",
            tema: "Descuentos tributarios acumulables en renta",
            pregunta: """
                Los descuentos tributarios del articulo 255 y 256 del E.T. se pueden acumular en \
                una misma declaracion de renta?
                """,
            sintesis: """
                Se analiza si los descuentos por inversiones ambientales (art. 255), CTI (art. 256), \
                ICA (art. 115) y donaciones (art. 257) pueden acumularse. El limite conjunto es que \
                los descuentos no excedan el valor del impuesto basico de renta.
                """,
            conclusionClave: """
                Los descuentos tributarios son acumulables pero: (i) no pueden exceder el impuesto \
                basico de renta, (ii) el descuento de CTI tiene sublimite del 30% de la renta \
                liquida, (iii) el exceso de descuento puede trasladarse a los 4 periodos siguientes.
                """,
            articulosET: ["254", "255", "256", "257", "258", "259"],
            tipoDocumento: .oficio,
            descriptores: ["descuentos tributarios", "acumulacion", "limites", "CTI", "ICA"],
            vigente: true
        ),

        DoctrinaCurada(
            id: "doc-044",
            numero: "Concepto 002345 de 2024",
            fecha: "2024-09-30",
            tema: "Obligacion de declarar para personas naturales no residentes",
            pregunta: "Cuando esta obligada a declarar renta en Colombia una persona natural no residente?",
            sintesis: """
                Se analizan los umbrales de declaracion para no residentes conforme al articulo 592 \
                del E.T. Los no residentes deben declarar cuando obtengan ingresos de fuente \
                nacional que superen los montos establecidos o cuando se les hayan practicado \
                retenciones.
                """,
            conclusionClave: """
                No residentes deben declarar si: (i) obtienen ingresos de fuente nacional gravados, \
                (ii) tienen patrimonio en Colombia superior a 4.500 UVT, (iii) realizan movimientos \
                financieros superiores a 45.000 UVT, (iv) se les practicaron retenciones. La \
                declaracion se presenta en formulario 110.
                """,
            articulosET: ["9", "592", "594-1", "596"],
            tipoDocumento: .concepto,
            descriptores: ["no residentes", "declarar", "obligacion", "fuente nacional"],
            vigente: true
        ),

        DoctrinaCurada(
            id: "doc-045",
            numero: "Circular 018 de 2025",
            fecha: "2025-10-30",
            tema: "Lineamientos sobre el impuesto saludable a bebidas azucaradas",
            pregunta: """
                Como opera el impuesto saludable a bebidas azucaradas y ultraprocesados a partir \
                de 2024?
                """,
            sintesis: """
                Se emiten lineamientos sobre la aplicacion del impuesto saludable creado por la Ley \
                2277 de 2022. El impuesto grava bebidas azucaradas y alimentos ultraprocesados con \
                tarifas progresivas que se incrementan anualmente.
                """,
            conclusionClave: """
                Impuesto saludable: tarifa ad valorem sobre el precio de venta para ultraprocesados \
                (10% en 2023, 15% en 2024, 20% en 2025) y tarifa especifica por contenido de azucar \
                para bebidas. El productor o importador es el responsable.
                """,
            articulosET: [],
            tipoDocumento: .circular,
            descriptores: ["impuesto saludable", "bebidas azucaradas", "ultraprocesados", "tarifa"],
            vigente: true
        ),

        DoctrinaCurada(
            id: "doc-046",
            numero: "Concepto 004567 de 2024",
            fecha: "2024-10-15",
            tema: "Tasa minima de tributacion para personas juridicas",
            pregunta: "Como funciona la tasa minima de tributacion (TMT) del 15% para sociedades?",
            sintesis: """
                Se explica la tasa minima de tributacion creada por la Ley 2277 de 2022 que busca \
                asegurar que las personas juridicas tributen al menos el 15% de su utilidad antes de \
                impuestos, sumando renta, descuentos y beneficios tributarios.
                """,
            conclusionClave: """
                Si la tasa efectiva de tributacion (TET = impuesto a cargo / utilidad contable antes \
                de impuestos) es menor al 15%, se debe liquidar un impuesto adicional por la \
                diferencia. Se excluyen: entidades del regimen tributario especial, zonas francas, y \
                hoteles con tarifa diferencial.
                """,
            articulosET: ["240"],
            tipoDocumento: .concepto,
            descriptores: ["tasa minima", "15%", "persona juridica", "TET"],
            vigente: true
        ),

        DoctrinaCurada(
            id: "doc-047",
            numero: "Oficio 002567 de 2025",
            fecha: "2025-07-08",
            tema: "Impuesto diferido y normas internacionales (NIIF) vs. E.T.",
            pregunta: """
                El impuesto diferido que surge de diferencias entre NIIF y el Estatuto Tributario \
                debe declararse?
                """,
            sintesis: """
                Se aclara que el impuesto diferido es un concepto exclusivamente contable (NIC 12) y \
                no tiene efecto fiscal. Las diferencias temporarias entre la base contable NIIF y la \
                base fiscal del E.T. no generan obligaciones tributarias adicionales.
                """,
            conclusionClave: """
                El impuesto diferido NO se declara ni paga ante la DIAN. La base gravable se \
                determina exclusivamente por las normas del E.T. (articulo 21-1). Las diferencias \
                NIIF/fiscal se concilian en el formato 2516 de conciliacion fiscal anual.
                """,
            articulosET: ["21-1", "772"],
            tipoDocumento: .oficio,
            descriptores: ["impuesto diferido", "NIIF", "conciliacion fiscal", "base gravable"],
            vigente: true
        ),

        DoctrinaCurada(
            id: "doc-048",
            numero: "Concepto 001567 de 2024",
            fecha: "2024-07-12",
            tema: "Facturacion electronica y procedencia de costos y deducciones",
            pregunta: """
                Se puede rechazar un costo o deduccion si la factura electronica no cumple con la \
                validacion previa de la DIAN?
                """,
            sintesis: """
                Se confirma que conforme al articulo 771-2 del E.T., para la procedencia de costos \
                y deducciones se requiere factura electronica con validacion previa. Sin este \
                soporte, la DIAN puede rechazar el costo o deduccion en un proceso de fiscalizacion.
                """,
            conclusionClave: """
                Sin factura electronica validada NO proceden costos ni deducciones (art. 771-2). \
                Excepciones: (i) operaciones con no obligados a facturar (se usa DSAN), (ii) \
                importaciones (declaracion de importacion), (iii) contratos con el Estado (pagos \
                soportados con documentos del contrato).
                """,
            articulosET: ["617", "771-2", "771-5"],
            tipoDocumento: .concepto,
            descriptores: ["factura electronica", "costos", "deducciones", "validacion previa"],
            vigente: true
        ),

        DoctrinaCurada(
            id: "doc-049",
            numero: "Concepto 003890 de 2023",
            fecha: "2023-11-28",
            tema: "Deduccion de regalias pagadas por explotacion de recursos naturales",
            pregunta: """
                Las regalias pagadas por la explotacion de recursos naturales no renovables son \
                deducibles en renta?
                """,
            sintesis: """
                Se analiza la deducibilidad de las regalias pagadas al Estado por explotacion minera \
                y petrolera. Conforme al articulo 116 del E.T., los impuestos, tasas y \
                contribuciones efectivamente pagados son deducibles, y las regalias tienen \
                naturaleza de contraprestacion economica.
                """,
            conclusionClave: """
                Las regalias pagadas por explotacion de recursos naturales son deducibles como costo \
                de produccion en el ano de su pago efectivo. No se consideran impuesto sino \
                contraprestacion economica, por lo que se deducen por la via del articulo 107 \
                (necesidad, proporcionalidad y relacion de causalidad).
                """,
            articulosET: ["107", "116"],
            tipoDocumento: .concepto,
            descriptores: ["regalias", "mineria", "petroleo", "deduccion", "recursos naturales"],
            vigente: true
        ),

        DoctrinaCurada(
            id: "doc-050",
            numero: "Oficio 001890 de 2025",
            fecha: "2025-04-25",
            tema: "Obligaciones tributarias de entidades sin animo de lucro (ESAL)",
            pregunta: """
                Las entidades sin animo de lucro del Regimen Tributario Especial (RTE) deben \
                declarar renta?
                """,
            sintesis: """
                Se detallan las obligaciones de las ESAL en el RTE conforme a los articulos 356 a \
                364 del E.T. Las ESAL calificadas deben presentar declaracion de renta, memoria \
                economica y asegurar que su excedente fiscal sea reinvertido en el objeto social.
                """,
            conclusionClave: """
                Las ESAL del RTE: tarifa del 20% sobre el beneficio neto no reinvertido. Si \
                reinvierten el 100% en el objeto social, la tarifa efectiva es 0%. Deben presentar \
                declaracion de renta, informacion exogena y mantener la calificacion ante la DIAN \
                actualizandola cada 3 anos.
                """,
            articulosET: ["19", "356", "357", "358", "359", "364"],
            tipoDocumento: .oficio,
            descriptores: ["ESAL", "regimen especial", "sin animo de lucro", "reinversion"],
            vigente: true
        ),
    ]
}
