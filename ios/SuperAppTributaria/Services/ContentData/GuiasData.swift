import Foundation

// MARK: - GuiasData — Guias Interactivas (Decision Trees)

enum GuiasData {

    // MARK: - Metadata

    static let lastUpdate = "2026-02-19"

    // MARK: - All Guides (7 entries)

    static let guias: [GuiaEducativa] = [

        // MARK: 1. Declarar Renta

        GuiaEducativa(
            id: "declarar-renta",
            titulo: "Debo declarar renta?",
            descripcion: "Verifica si cumples los topes para declarar renta como persona natural en el ano gravable 2025.",
            categoria: "renta",
            complejidad: "basica",
            nodos: [
                DecisionNode(
                    id: "residencia",
                    tipo: "pregunta",
                    texto: "Eres residente fiscal en Colombia? (Permanencia > 183 dias o familia/bienes en el pais)",
                    opciones: [
                        DecisionOption(label: "Si", nextNodeId: "patrimonio"),
                        DecisionOption(label: "No", nextNodeId: "no-residente"),
                    ],
                    recomendacion: nil,
                    enlaces: [],
                    ayudaRapida: "La residencia fiscal no depende de la nacionalidad, sino de tu permanencia o vinculos economicos/familiares."
                ),
                DecisionNode(
                    id: "patrimonio",
                    tipo: "pregunta",
                    texto: "Tu patrimonio bruto al 31 de dic de 2025 fue superior a 4.500 UVT ($224.095.500)?",
                    opciones: [
                        DecisionOption(label: "Si", nextNodeId: "resultado-declara"),
                        DecisionOption(label: "No", nextNodeId: "ingresos"),
                    ],
                    recomendacion: nil,
                    enlaces: [],
                    ayudaRapida: "Suma tus bienes (casa, carro, ahorros, acciones) sin restar las deudas que tengas sobre ellos."
                ),
                DecisionNode(
                    id: "ingresos",
                    tipo: "pregunta",
                    texto: "Tus ingresos brutos en 2025 fueron superiores a 1.400 UVT ($69.718.600)?",
                    opciones: [
                        DecisionOption(label: "Si", nextNodeId: "resultado-declara"),
                        DecisionOption(label: "No", nextNodeId: "tarjetas"),
                    ],
                    recomendacion: nil,
                    enlaces: [],
                    ayudaRapida: "Incluye salarios, honorarios, arriendos, rendimientos financieros y pensiones recibidos en el ano."
                ),
                DecisionNode(
                    id: "tarjetas",
                    tipo: "pregunta",
                    texto: "Tus consumos con tarjeta de credito superaron los 1.400 UVT ($69.718.600)?",
                    opciones: [
                        DecisionOption(label: "Si", nextNodeId: "resultado-declara"),
                        DecisionOption(label: "No", nextNodeId: "consignaciones"),
                    ],
                    recomendacion: nil,
                    enlaces: [],
                    ayudaRapida: "Suma todos los pagos realizados con tus tarjetas, incluso si son compras para terceros."
                ),
                DecisionNode(
                    id: "consignaciones",
                    tipo: "pregunta",
                    texto: "El valor total de tus consignaciones o inversiones supero los 1.400 UVT ($69.718.600)?",
                    opciones: [
                        DecisionOption(label: "Si", nextNodeId: "resultado-declara"),
                        DecisionOption(label: "No", nextNodeId: "resultado-no-declara"),
                    ],
                    recomendacion: nil,
                    enlaces: [],
                    ayudaRapida: "Cuenta todo el dinero que entro a tus cuentas bancarias, incluyendo prestamos o traslados."
                ),
                DecisionNode(
                    id: "no-residente",
                    tipo: "resultado",
                    texto: "Situacion de No Residente",
                    opciones: [],
                    recomendacion: "Los no residentes solo declaran si su patrimonio en Colombia o sus ingresos de fuente nacional no fueron objeto de retencion en la fuente (Art. 407 a 411 ET).",
                    enlaces: [(label: "Ver Estatuto Art. 9", href: "/explorador?art=9")],
                    ayudaRapida: nil
                ),
                DecisionNode(
                    id: "resultado-declara",
                    tipo: "resultado",
                    texto: "DEBES DECLARAR RENTA!",
                    opciones: [],
                    recomendacion: "Cumples con al menos uno de los topes legales. Recuerda que declarar no siempre significa pagar.",
                    enlaces: [(label: "Calendario Tributario", href: "/calendario")],
                    ayudaRapida: nil
                ),
                DecisionNode(
                    id: "resultado-no-declara",
                    tipo: "resultado",
                    texto: "No estas obligado a declarar",
                    opciones: [],
                    recomendacion: "No superas ninguno de los topes para el ano gravable 2025. Sin embargo, puedes declarar voluntariamente si te practicaron retenciones.",
                    enlaces: [],
                    ayudaRapida: nil
                ),
            ],
            nodoInicial: "residencia"
        ),

        // MARK: 2. SIMPLE vs Ordinario

        GuiaEducativa(
            id: "simple-vs-ordinario",
            titulo: "SIMPLE vs Ordinario: Cual me conviene?",
            descripcion: "Analiza si te conviene migrar al Regimen Simple de Tributacion o quedarte en Renta Ordinaria.",
            categoria: "general",
            complejidad: "intermedia",
            nodos: [
                DecisionNode(
                    id: "ingresos-tope",
                    tipo: "pregunta",
                    texto: "Tus ingresos brutos anuales son inferiores a 100.000 UVT ($5.237.400.000)?",
                    opciones: [
                        DecisionOption(label: "Si", nextNodeId: "tipo-actividad"),
                        DecisionOption(label: "No", nextNodeId: "ordinario-obligatorio"),
                    ],
                    recomendacion: nil,
                    enlaces: [],
                    ayudaRapida: "Este es el tope general para pertenecer al SIMPLE para la mayoria de actividades empresariales."
                ),
                DecisionNode(
                    id: "tipo-actividad",
                    tipo: "pregunta",
                    texto: "Tu actividad es de servicios profesionales (consultoria, profesiones liberales)?",
                    opciones: [
                        DecisionOption(label: "Si", nextNodeId: "tope-profesionales"),
                        DecisionOption(label: "No", nextNodeId: "costos-altos"),
                    ],
                    recomendacion: nil,
                    enlaces: [],
                    ayudaRapida: "Las profesiones liberales tienen un tope de ingresos menor y tarifas diferentes en el SIMPLE."
                ),
                DecisionNode(
                    id: "tope-profesionales",
                    tipo: "pregunta",
                    texto: "Tus ingresos como profesional son inferiores a 12.000 UVT ($628.488.000)?",
                    opciones: [
                        DecisionOption(label: "Si", nextNodeId: "costos-altos"),
                        DecisionOption(label: "No", nextNodeId: "ordinario-mejor-prof"),
                    ],
                    recomendacion: nil,
                    enlaces: [],
                    ayudaRapida: "Si superas este tope como profesional, el SIMPLE deja de ser una opcion legal por sentencia de la Corte."
                ),
                DecisionNode(
                    id: "costos-altos",
                    tipo: "pregunta",
                    texto: "Tus costos y gastos reales superan el 70% de tus ingresos?",
                    opciones: [
                        DecisionOption(label: "Si", nextNodeId: "ordinario-mejor-costos"),
                        DecisionOption(label: "No", nextNodeId: "nomina-empleados"),
                    ],
                    recomendacion: nil,
                    enlaces: [],
                    ayudaRapida: "Como el SIMPLE paga sobre ingresos brutos, si tienes costos muy altos podrias terminar pagando mas impuesto."
                ),
                DecisionNode(
                    id: "nomina-empleados",
                    tipo: "pregunta",
                    texto: "Tienes empleados por nomina con aportes a pension?",
                    opciones: [
                        DecisionOption(label: "Si", nextNodeId: "simple-ideal"),
                        DecisionOption(label: "No", nextNodeId: "simple-conveniente"),
                    ],
                    recomendacion: nil,
                    enlaces: [],
                    ayudaRapida: "En el SIMPLE puedes descontar el 100% de tus aportes a pension de tus empleados del impuesto a pagar."
                ),
                DecisionNode(
                    id: "ordinario-obligatorio",
                    tipo: "resultado",
                    texto: "Regimen Ordinario Obligatorio",
                    opciones: [],
                    recomendacion: "Superas el tope maximo para el SIMPLE. Debes declarar bajo el regimen ordinario.",
                    enlaces: [],
                    ayudaRapida: nil
                ),
                DecisionNode(
                    id: "ordinario-mejor-prof",
                    tipo: "resultado",
                    texto: "Se recomienda Ordinario",
                    opciones: [],
                    recomendacion: "Los profesionales con ingresos > 12.000 UVT suelen tener una carga mayor en el SIMPLE tras la Sentencia C-540 de 2023.",
                    enlaces: [],
                    ayudaRapida: nil
                ),
                DecisionNode(
                    id: "ordinario-mejor-costos",
                    tipo: "resultado",
                    texto: "Mejor Ordinario (por costos)",
                    opciones: [],
                    recomendacion: "Dado que el SIMPLE grava ingresos brutos y no permite restar costos, con gastos > 70% es probable que la renta ordinaria sea mas barata.",
                    enlaces: [(label: "Calculadora SIMPLE", href: "/calculadoras/simple")],
                    ayudaRapida: nil
                ),
                DecisionNode(
                    id: "simple-ideal",
                    tipo: "resultado",
                    texto: "El SIMPLE es ideal para ti!",
                    opciones: [],
                    recomendacion: "Puedes descontar los aportes a pension de tus empleados y simplificar 7 impuestos en uno. Tu ahorro sera significativo.",
                    enlaces: [(label: "Calculadora SIMPLE", href: "/calculadoras/simple")],
                    ayudaRapida: nil
                ),
                DecisionNode(
                    id: "simple-conveniente",
                    tipo: "resultado",
                    texto: "SIMPLE es conveniente",
                    opciones: [],
                    recomendacion: "Aunque no tengas nomina, las tarifas bajas del SIMPLE sobre ingresos brutos suelen ser menores que la tarifa del ordinario sobre utilidad.",
                    enlaces: [],
                    ayudaRapida: nil
                ),
            ],
            nodoInicial: "ingresos-tope"
        ),

        // MARK: 3. Responsable de IVA

        GuiaEducativa(
            id: "responsable-iva",
            titulo: "Soy responsable de IVA?",
            descripcion: "Determina si debes inscribirte como responsable de IVA o puedes operar como no responsable.",
            categoria: "iva",
            complejidad: "basica",
            nodos: [
                DecisionNode(
                    id: "ingresos-3500",
                    tipo: "pregunta",
                    texto: "Tus ingresos brutos por actividades gravadas en 2024 o 2025 superaron los 3.500 UVT ($174.296.500)?",
                    opciones: [
                        DecisionOption(label: "Si", nextNodeId: "resultado-si-iva"),
                        DecisionOption(label: "No", nextNodeId: "establecimientos"),
                    ],
                    recomendacion: nil,
                    enlaces: [],
                    ayudaRapida: "Suma solo los ingresos que provienen de bienes o servicios que tienen IVA (la mayoria, salvo excepciones)."
                ),
                DecisionNode(
                    id: "establecimientos",
                    tipo: "pregunta",
                    texto: "Tienes mas de un establecimiento de comercio, oficina o local?",
                    opciones: [
                        DecisionOption(label: "Si", nextNodeId: "resultado-si-iva"),
                        DecisionOption(label: "No", nextNodeId: "franquicias"),
                    ],
                    recomendacion: nil,
                    enlaces: [],
                    ayudaRapida: "Tener dos locales abiertos al publico te obliga automaticamente a ser responsable de IVA."
                ),
                DecisionNode(
                    id: "franquicias",
                    tipo: "pregunta",
                    texto: "Desarrollas actividades bajo franquicia, marca o concesion?",
                    opciones: [
                        DecisionOption(label: "Si", nextNodeId: "resultado-si-iva"),
                        DecisionOption(label: "No", nextNodeId: "aduana"),
                    ],
                    recomendacion: nil,
                    enlaces: [],
                    ayudaRapida: "Si tu negocio es una franquicia (ej. Servientrega, cosecha, etc.), eres responsable de IVA."
                ),
                DecisionNode(
                    id: "aduana",
                    tipo: "pregunta",
                    texto: "Eres usuario aduanero?",
                    opciones: [
                        DecisionOption(label: "Si", nextNodeId: "resultado-si-iva"),
                        DecisionOption(label: "No", nextNodeId: "consignaciones-iva"),
                    ],
                    recomendacion: nil,
                    enlaces: [],
                    ayudaRapida: "Si realizas importaciones o exportaciones formales ante la DIAN, sueles ser responsable de IVA."
                ),
                DecisionNode(
                    id: "consignaciones-iva",
                    tipo: "pregunta",
                    texto: "Tus consignaciones bancarias en el ano superaron los 3.500 UVT?",
                    opciones: [
                        DecisionOption(label: "Si", nextNodeId: "resultado-si-iva"),
                        DecisionOption(label: "No", nextNodeId: "resultado-no-iva"),
                    ],
                    recomendacion: nil,
                    enlaces: [],
                    ayudaRapida: "Al igual que en renta, mover mas de $174 millones en tus cuentas te obliga a recaudar IVA."
                ),
                DecisionNode(
                    id: "resultado-si-iva",
                    tipo: "resultado",
                    texto: "Eres RESPONSABLE de IVA",
                    opciones: [],
                    recomendacion: "Debes inscribirte en el RUT como responsable de IVA, facturar electronicamente y presentar declaraciones bimestrales o cuatrimestrales.",
                    enlaces: [(label: "Ver Art. 437 ET", href: "/explorador?art=437")],
                    ayudaRapida: nil
                ),
                DecisionNode(
                    id: "resultado-no-iva",
                    tipo: "resultado",
                    texto: "No eres responsable de IVA",
                    opciones: [],
                    recomendacion: "Puedes operar como no responsable. Asegurate de no superar los topes en el transcurso del ano.",
                    enlaces: [],
                    ayudaRapida: nil
                ),
            ],
            nodoInicial: "ingresos-3500"
        ),

        // MARK: 4. Sanciones DIAN

        GuiaEducativa(
            id: "sanciones-dian",
            titulo: "Que sanciones aplican a mi caso?",
            descripcion: "Evalua las posibles sanciones por extemporaneidad o correccion.",
            categoria: "general",
            complejidad: "basica",
            nodos: [
                DecisionNode(
                    id: "tipo-falta",
                    tipo: "pregunta",
                    texto: "Cual es tu situacion actual?",
                    opciones: [
                        DecisionOption(label: "No presente la declaracion a tiempo", nextNodeId: "pago-previo"),
                        DecisionOption(label: "Debo corregir una declaracion ya presentada", nextNodeId: "aumenta-impuesto"),
                    ],
                    recomendacion: nil,
                    enlaces: [],
                    ayudaRapida: "Identifica si el error es por tiempo (presentar tarde) o por contenido (corregir datos)."
                ),
                DecisionNode(
                    id: "pago-previo",
                    tipo: "pregunta",
                    texto: "La declaracion arroja un impuesto a pagar?",
                    opciones: [
                        DecisionOption(label: "Si", nextNodeId: "extemporaneidad-con-pago"),
                        DecisionOption(label: "No", nextNodeId: "extemporaneidad-sin-pago"),
                    ],
                    recomendacion: nil,
                    enlaces: [],
                    ayudaRapida: "Si la declaracion da saldo a favor, la sancion suele calcularse sobre ingresos o patrimonio."
                ),
                DecisionNode(
                    id: "aumenta-impuesto",
                    tipo: "pregunta",
                    texto: "La correccion aumenta el impuesto o disminuye el saldo a favor?",
                    opciones: [
                        DecisionOption(label: "Si", nextNodeId: "sancion-correccion"),
                        DecisionOption(label: "No", nextNodeId: "sin-sancion-correccion"),
                    ],
                    recomendacion: nil,
                    enlaces: [],
                    ayudaRapida: "Corregir para pagar mas genera sancion; corregir para pagar menos no (pero requiere proceso especial)."
                ),
                DecisionNode(
                    id: "extemporaneidad-con-pago",
                    tipo: "resultado",
                    texto: "Sancion por Extemporaneidad",
                    opciones: [],
                    recomendacion: "5% del impuesto por cada mes o fraccion de retraso, sin exceder el 100%. Minimo $47.000 (10 UVT).",
                    enlaces: [(label: "Calculadora de Intereses", href: "/calculadoras/intereses-mora")],
                    ayudaRapida: nil
                ),
                DecisionNode(
                    id: "extemporaneidad-sin-pago",
                    tipo: "resultado",
                    texto: "Sancion sobre Ingresos o Patrimonio",
                    opciones: [],
                    recomendacion: "0.5% de los ingresos brutos por cada mes de retraso. Si no hay ingresos, 1% del patrimonio liquido.",
                    enlaces: [],
                    ayudaRapida: nil
                ),
                DecisionNode(
                    id: "sancion-correccion",
                    tipo: "resultado",
                    texto: "Sancion por Correccion",
                    opciones: [],
                    recomendacion: "10% del mayor valor a pagar o del menor saldo a favor, antes del emplazamiento para corregir.",
                    enlaces: [],
                    ayudaRapida: nil
                ),
                DecisionNode(
                    id: "sin-sancion-correccion",
                    tipo: "resultado",
                    texto: "Correccion sin sancion",
                    opciones: [],
                    recomendacion: "Si la correccion no varia el impuesto o es para aumentar el saldo a favor, no hay sancion (salvo casos especificos de procesos de fiscalizacion).",
                    enlaces: [],
                    ayudaRapida: nil
                ),
            ],
            nodoInicial: "tipo-falta"
        ),

        // MARK: 5. Retencion por Salarios

        GuiaEducativa(
            id: "retencion-salarios",
            titulo: "Como calculo mi retencion por salarios?",
            descripcion: "Entiende paso a paso como se calcula la retencion en la fuente sobre tus ingresos laborales.",
            categoria: "retencion",
            complejidad: "intermedia",
            nodos: [
                DecisionNode(
                    id: "tipo-vinculacion",
                    tipo: "pregunta",
                    texto: "Recibes tus ingresos como asalariado o como trabajador independiente?",
                    opciones: [
                        DecisionOption(label: "Asalariado (contrato laboral)", nextNodeId: "procedimiento"),
                        DecisionOption(label: "Independiente (prestacion de servicios)", nextNodeId: "resultado-independiente"),
                    ],
                    recomendacion: nil,
                    enlaces: [],
                    ayudaRapida: "Los asalariados tienen un sistema de depuracion mensual; los independientes pueden tener costos o tabla del 383."
                ),
                DecisionNode(
                    id: "resultado-independiente",
                    tipo: "resultado",
                    texto: "Retencion para independientes",
                    opciones: [],
                    recomendacion: "Como independiente, si tus ingresos del ano anterior superaron 3.300 UVT te aplica la tabla del Art. 383 ET. De lo contrario, retencion ordinaria del 10% u 11%.",
                    enlaces: [
                        (label: "Calculadora de Retencion", href: "/calculadoras/retencion"),
                        (label: "Tablas de Retencion", href: "/tablas/retencion"),
                    ],
                    ayudaRapida: nil
                ),
                DecisionNode(
                    id: "procedimiento",
                    tipo: "pregunta",
                    texto: "Tu empleador aplica el Procedimiento 1 o el Procedimiento 2?",
                    opciones: [
                        DecisionOption(label: "Procedimiento 1 (depuracion mensual)", nextNodeId: "dependientes"),
                        DecisionOption(label: "Procedimiento 2 (porcentaje fijo semestral)", nextNodeId: "resultado-p2"),
                        DecisionOption(label: "No se cual me aplica", nextNodeId: "dependientes"),
                    ],
                    recomendacion: nil,
                    enlaces: [],
                    ayudaRapida: "El P1 es mensual fijo; el P2 usa un porcentaje que cambia cada 6 meses (en junio y diciembre)."
                ),
                DecisionNode(
                    id: "dependientes",
                    tipo: "pregunta",
                    texto: "Tienes personas a cargo (dependientes economicos)?",
                    opciones: [
                        DecisionOption(label: "Si, tengo dependientes", nextNodeId: "aportes-voluntarios"),
                        DecisionOption(label: "No tengo dependientes", nextNodeId: "resultado-p1-basico"),
                    ],
                    recomendacion: nil,
                    enlaces: [],
                    ayudaRapida: "Hijos menores de 18 (o hasta 23 si estudian), conyuge o padres sin ingresos propios."
                ),
                DecisionNode(
                    id: "aportes-voluntarios",
                    tipo: "pregunta",
                    texto: "Realizas aportes voluntarios a pension o cuentas AFC?",
                    opciones: [
                        DecisionOption(label: "Si, hago aportes voluntarios", nextNodeId: "resultado-p1-completo"),
                        DecisionOption(label: "No realizo aportes voluntarios", nextNodeId: "resultado-p1-basico"),
                    ],
                    recomendacion: nil,
                    enlaces: [],
                    ayudaRapida: "Ahorrar en fondos de pensiones voluntarias o cuentas de vivienda reduce tu base de retencion."
                ),
                DecisionNode(
                    id: "resultado-p1-basico",
                    tipo: "resultado",
                    texto: "Retencion por Procedimiento 1",
                    opciones: [],
                    recomendacion: "Tu empleador calcula la retencion mensualmente: toma tu ingreso laboral, resta aportes obligatorios a salud y pension, aplica deducciones y la renta exenta del 25%, y aplica la tabla del Art. 383 ET.",
                    enlaces: [
                        (label: "Calculadora Retencion Salarios", href: "/calculadoras/retencion-salarios"),
                        (label: "Calculadora de Retencion General", href: "/calculadoras/retencion"),
                    ],
                    ayudaRapida: nil
                ),
                DecisionNode(
                    id: "resultado-p1-completo",
                    tipo: "resultado",
                    texto: "Retencion P1 con beneficios tributarios",
                    opciones: [],
                    recomendacion: "Tienes varios beneficios que reducen tu retencion: deduccion por dependientes (hasta 72 UVT), aportes voluntarios a pension/AFC (renta exenta hasta 30%) y la renta exenta general del 25%. Recuerda que rentas exentas + deducciones no pueden superar el 40% del ingreso neto.",
                    enlaces: [
                        (label: "Calculadora Retencion Salarios", href: "/calculadoras/retencion-salarios"),
                        (label: "Tablas de Retencion", href: "/tablas/retencion"),
                    ],
                    ayudaRapida: nil
                ),
                DecisionNode(
                    id: "resultado-p2",
                    tipo: "resultado",
                    texto: "Retencion por Procedimiento 2",
                    opciones: [],
                    recomendacion: "Se aplica un porcentaje fijo calculado semestralmente. El porcentaje se determina dividiendo la retencion teorica de los 12 meses anteriores entre los pagos gravables del mismo periodo. Consulta con tu empleador el porcentaje vigente.",
                    enlaces: [
                        (label: "Calculadora Retencion Salarios", href: "/calculadoras/retencion-salarios"),
                        (label: "Calculadora de Retencion General", href: "/calculadoras/retencion"),
                    ],
                    ayudaRapida: nil
                ),
            ],
            nodoInicial: "tipo-vinculacion"
        ),

        // MARK: 6. Regimen de IVA

        GuiaEducativa(
            id: "regimen-iva",
            titulo: "Que regimen de IVA me aplica?",
            descripcion: "Determina si eres responsable de IVA, no responsable, o si te aplica el SIMPLE con IVA integrado.",
            categoria: "iva",
            complejidad: "intermedia",
            nodos: [
                DecisionNode(
                    id: "actividad-gravada",
                    tipo: "pregunta",
                    texto: "Vendes bienes o prestas servicios gravados con IVA?",
                    opciones: [
                        DecisionOption(label: "Si, vendo bienes/servicios gravados", nextNodeId: "tipo-persona"),
                        DecisionOption(label: "No, solo excluidos o exentos", nextNodeId: "resultado-no-responsable"),
                    ],
                    recomendacion: nil,
                    enlaces: [],
                    ayudaRapida: "La mayoria de bienes en Colombia tienen IVA del 19%. Algunos son exentos (tarifa 0) o excluidos."
                ),
                DecisionNode(
                    id: "resultado-no-responsable",
                    tipo: "resultado",
                    texto: "No eres responsable de IVA",
                    opciones: [],
                    recomendacion: "Si unicamente vendes bienes excluidos o exentos de IVA, no eres responsable de este impuesto.",
                    enlaces: [(label: "Calculadora de IVA", href: "/calculadoras/iva")],
                    ayudaRapida: nil
                ),
                DecisionNode(
                    id: "tipo-persona",
                    tipo: "pregunta",
                    texto: "Eres persona natural o persona juridica?",
                    opciones: [
                        DecisionOption(label: "Persona natural", nextNodeId: "ingresos-iva"),
                        DecisionOption(label: "Persona juridica", nextNodeId: "resultado-responsable-pj"),
                    ],
                    recomendacion: nil,
                    enlaces: [],
                    ayudaRapida: "Las empresas (SAS, Ltda, etc.) suelen ser responsables de IVA por el solo hecho de ser personas juridicas."
                ),
                DecisionNode(
                    id: "resultado-responsable-pj",
                    tipo: "resultado",
                    texto: "Eres responsable de IVA",
                    opciones: [],
                    recomendacion: "Todas las personas juridicas que vendan bienes o presten servicios gravados son responsables de IVA. Debes facturar con IVA y presentar declaracion bimestral o cuatrimestral.",
                    enlaces: [(label: "Calculadora de IVA", href: "/calculadoras/iva")],
                    ayudaRapida: nil
                ),
                DecisionNode(
                    id: "ingresos-iva",
                    tipo: "pregunta",
                    texto: "Tus ingresos brutos del ano anterior superaron 3.500 UVT ($174.296.500)?",
                    opciones: [
                        DecisionOption(label: "Si, los superaron", nextNodeId: "resultado-responsable-ingresos"),
                        DecisionOption(label: "No, fueron menores", nextNodeId: "varios-locales"),
                    ],
                    recomendacion: nil,
                    enlaces: [],
                    ayudaRapida: "Este es el tope de ingresos para personas naturales; superarlo te obliga a cobrar IVA."
                ),
                DecisionNode(
                    id: "resultado-responsable-ingresos",
                    tipo: "resultado",
                    texto: "Eres responsable de IVA por ingresos",
                    opciones: [],
                    recomendacion: "Al superar los 3.500 UVT de ingresos debes inscribirte como responsable de IVA.",
                    enlaces: [(label: "Calculadora de IVA", href: "/calculadoras/iva")],
                    ayudaRapida: nil
                ),
                DecisionNode(
                    id: "varios-locales",
                    tipo: "pregunta",
                    texto: "Tienes mas de un establecimiento de comercio u oficina?",
                    opciones: [
                        DecisionOption(label: "Si, tengo mas de uno", nextNodeId: "resultado-responsable-locales"),
                        DecisionOption(label: "No, solo uno o ninguno", nextNodeId: "en-simple"),
                    ],
                    recomendacion: nil,
                    enlaces: [],
                    ayudaRapida: "Incluso si ganas poco, tener dos locales te obliga a ser responsable de IVA."
                ),
                DecisionNode(
                    id: "resultado-responsable-locales",
                    tipo: "resultado",
                    texto: "Eres responsable de IVA por establecimientos",
                    opciones: [],
                    recomendacion: "Al tener mas de un establecimiento de comercio estas obligado como responsable de IVA.",
                    enlaces: [(label: "Calculadora de IVA", href: "/calculadoras/iva")],
                    ayudaRapida: nil
                ),
                DecisionNode(
                    id: "en-simple",
                    tipo: "pregunta",
                    texto: "Estas inscrito en el Regimen SIMPLE de Tributacion?",
                    opciones: [
                        DecisionOption(label: "Si, estoy en el SIMPLE", nextNodeId: "resultado-simple-iva"),
                        DecisionOption(label: "No", nextNodeId: "resultado-no-responsable-cumple"),
                    ],
                    recomendacion: nil,
                    enlaces: [],
                    ayudaRapida: "El SIMPLE simplifica el recaudo de IVA pero tiene reglas especiales para peluquerias y restaurantes."
                ),
                DecisionNode(
                    id: "resultado-simple-iva",
                    tipo: "resultado",
                    texto: "Regimen SIMPLE con IVA incluido",
                    opciones: [],
                    recomendacion: "En el SIMPLE, el IVA se integra en la tarifa unificada. No presentas declaracion de IVA por separado.",
                    enlaces: [
                        (label: "Calculadora SIMPLE", href: "/calculadoras/simple"),
                        (label: "Comparador de Regimenes", href: "/calculadoras/comparador-regimenes"),
                    ],
                    ayudaRapida: nil
                ),
                DecisionNode(
                    id: "resultado-no-responsable-cumple",
                    tipo: "resultado",
                    texto: "No eres responsable de IVA",
                    opciones: [],
                    recomendacion: "Cumples los requisitos del Art. 437 par. 3 ET para NO ser responsable. No debes cobrar IVA en tus ventas.",
                    enlaces: [(label: "Calculadora de IVA", href: "/calculadoras/iva")],
                    ayudaRapida: nil
                ),
            ],
            nodoInicial: "actividad-gravada"
        ),

        // MARK: 7. Impuesto al Patrimonio

        GuiaEducativa(
            id: "impuesto-patrimonio",
            titulo: "Debo pagar impuesto al patrimonio?",
            descripcion: "Determina si estas sujeto al impuesto al patrimonio segun tu patrimonio liquido y residencia fiscal.",
            categoria: "renta",
            complejidad: "basica",
            nodos: [
                DecisionNode(
                    id: "es-persona-natural",
                    tipo: "pregunta",
                    texto: "Eres persona natural?",
                    opciones: [
                        DecisionOption(label: "Si, soy persona natural", nextNodeId: "patrimonio-72k"),
                        DecisionOption(label: "No, soy persona juridica", nextNodeId: "resultado-no-aplica-pj"),
                    ],
                    recomendacion: nil,
                    enlaces: [],
                    ayudaRapida: "Este impuesto aplica principalmente a personas naturales y sucesiones iliquidas con altos patrimonios."
                ),
                DecisionNode(
                    id: "resultado-no-aplica-pj",
                    tipo: "resultado",
                    texto: "No aplica impuesto al patrimonio",
                    opciones: [],
                    recomendacion: "Las personas juridicas nacionales no son sujetas del impuesto al patrimonio. Si eres entidad extranjera con bienes en Colombia, consulta con un profesional.",
                    enlaces: [(label: "Calculadora de Patrimonio", href: "/calculadoras/patrimonio")],
                    ayudaRapida: nil
                ),
                DecisionNode(
                    id: "patrimonio-72k",
                    tipo: "pregunta",
                    texto: "Tu patrimonio liquido al 1 de enero supera las 72.000 UVT ($3.771 millones)?",
                    opciones: [
                        DecisionOption(label: "Si, supera 72.000 UVT", nextNodeId: "residencia-fiscal"),
                        DecisionOption(label: "No, es menor", nextNodeId: "resultado-no-aplica-tope"),
                    ],
                    recomendacion: nil,
                    enlaces: [],
                    ayudaRapida: "Patrimonio liquido = Bienes totales menos deudas totales."
                ),
                DecisionNode(
                    id: "resultado-no-aplica-tope",
                    tipo: "resultado",
                    texto: "No debes pagar impuesto al patrimonio",
                    opciones: [],
                    recomendacion: "Si tu patrimonio liquido no supera las 72.000 UVT, no estas sujeto al impuesto al patrimonio.",
                    enlaces: [
                        (label: "Calculadora de Patrimonio", href: "/calculadoras/patrimonio"),
                        (label: "Conversor de UVT", href: "/calculadoras/uvt"),
                    ],
                    ayudaRapida: nil
                ),
                DecisionNode(
                    id: "residencia-fiscal",
                    tipo: "pregunta",
                    texto: "Eres residente fiscal colombiano?",
                    opciones: [
                        DecisionOption(label: "Si, soy residente fiscal", nextNodeId: "resultado-debe-pagar-residente"),
                        DecisionOption(label: "No, soy no residente", nextNodeId: "resultado-debe-pagar-no-residente"),
                    ],
                    recomendacion: nil,
                    enlaces: [],
                    ayudaRapida: "Si eres residente, pagas sobre tus bienes en todo el mundo. Si no, solo sobre tus bienes en Colombia."
                ),
                DecisionNode(
                    id: "resultado-debe-pagar-residente",
                    tipo: "resultado",
                    texto: "Si, debes pagar impuesto al patrimonio",
                    opciones: [],
                    recomendacion: "Como residente fiscal con patrimonio liquido superior a 72.000 UVT, debes pagar sobre tu patrimonio mundial. Tarifa progresiva: 0.5% (72K-122K UVT), 1% (122K-239K UVT) y 1.5% (exceso de 239K UVT).",
                    enlaces: [(label: "Calculadora de Patrimonio", href: "/calculadoras/patrimonio")],
                    ayudaRapida: nil
                ),
                DecisionNode(
                    id: "resultado-debe-pagar-no-residente",
                    tipo: "resultado",
                    texto: "Debes pagar sobre patrimonio en Colombia",
                    opciones: [],
                    recomendacion: "Como no residente con patrimonio en Colombia superior a 72.000 UVT, debes pagar solo sobre los bienes que poseas en Colombia. Las tarifas son las mismas que para residentes.",
                    enlaces: [(label: "Calculadora de Patrimonio", href: "/calculadoras/patrimonio")],
                    ayudaRapida: nil
                ),
            ],
            nodoInicial: "es-persona-natural"
        ),
    ]
}
