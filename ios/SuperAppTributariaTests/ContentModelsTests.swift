import Testing
import Foundation
@testable import SuperAppTributaria

struct ContentModelsTests {

    // MARK: - TipoContribuyente

    @Test func tipoContribuyenteAllCasesHas4() {
        #expect(TipoContribuyente.allCases.count == 4)
    }

    @Test func tipoContribuyenteLabels() {
        #expect(TipoContribuyente.todos.label == "Todos")
        #expect(TipoContribuyente.grandes.label == "Grandes")
        #expect(TipoContribuyente.juridicas.label == "Juridicas")
        #expect(TipoContribuyente.naturales.label == "Naturales")
    }

    @Test func tipoContribuyenteId() {
        #expect(TipoContribuyente.todos.id == "todos")
    }

    // MARK: - DeadlineStatus

    @Test func deadlineStatusLabels() {
        #expect(DeadlineStatus.vencido.label == "Vencido")
        #expect(DeadlineStatus.hoy.label == "Hoy")
        #expect(DeadlineStatus.proximo.label == "Proximo")
        #expect(DeadlineStatus.futuro.label == "Futuro")
    }

    // MARK: - CalendarDeadline

    @Test func calendarDeadlineFechaDateParsesISO() {
        let deadline = CalendarDeadline(
            id: "test", obligacion: "Renta", descripcion: "Test",
            tipoContribuyente: .todos, periodicidad: "anual",
            periodo: "2026", ultimoDigito: "1", fecha: "2026-08-12"
        )
        #expect(deadline.fechaDate != nil)
    }

    @Test func calendarDeadlineFechaDateNilForBadFormat() {
        let deadline = CalendarDeadline(
            id: "test", obligacion: "Renta", descripcion: "Test",
            tipoContribuyente: .todos, periodicidad: "anual",
            periodo: "2026", ultimoDigito: "1", fecha: "invalid"
        )
        #expect(deadline.fechaDate == nil)
    }

    @Test func calendarDeadlineMesNumeroExtractsMonth() {
        let deadline = CalendarDeadline(
            id: "test", obligacion: "Renta", descripcion: "Test",
            tipoContribuyente: .todos, periodicidad: "anual",
            periodo: "2026", ultimoDigito: "1", fecha: "2026-03-15"
        )
        #expect(deadline.mesNumero == 3)
    }

    @Test func calendarDeadlineMesNumeroNilForBadDate() {
        let deadline = CalendarDeadline(
            id: "test", obligacion: "Renta", descripcion: "Test",
            tipoContribuyente: .todos, periodicidad: "anual",
            periodo: "2026", ultimoDigito: "1", fecha: "bad"
        )
        #expect(deadline.mesNumero == nil)
    }

    // MARK: - RetencionConceptoCompleto — Categoria

    @Test func retencionConceptoCategoriaCompras() {
        let c = makeRetencion(id: "compras-generales")
        #expect(c.categoria == "Compras")
    }

    @Test func retencionConceptoCategoriaServicios() {
        let c = makeRetencion(id: "servicios-generales")
        #expect(c.categoria == "Servicios")
    }

    @Test func retencionConceptoCategoriaHonorarios() {
        let c = makeRetencion(id: "honorarios-prof")
        #expect(c.categoria == "Honorarios")
    }

    @Test func retencionConceptoCategoriaConsultorias() {
        let c = makeRetencion(id: "consultorias-prof")
        #expect(c.categoria == "Honorarios")
    }

    @Test func retencionConceptoCategoriaArrendamientos() {
        let c = makeRetencion(id: "arriendo-inmueble")
        #expect(c.categoria == "Arrendamientos")
    }

    @Test func retencionConceptoCategoriaRendimientos() {
        let c = makeRetencion(id: "rendimientos-financieros")
        #expect(c.categoria == "Rendimientos")
    }

    @Test func retencionConceptoCategoriaDividendos() {
        let c = makeRetencion(id: "dividendos-pn")
        #expect(c.categoria == "Dividendos")
    }

    @Test func retencionConceptoCategoriaLoterias() {
        let c = makeRetencion(id: "loterias-rifas")
        #expect(c.categoria == "Loterias")
    }

    @Test func retencionConceptoCategoriaActivos() {
        let c = makeRetencion(id: "activos-fijos")
        #expect(c.categoria == "Activos")
    }

    @Test func retencionConceptoCategoriaOtros() {
        let c = makeRetencion(id: "unknown-concept")
        #expect(c.categoria == "Otros")
    }

    // MARK: - DoctrinaTipoDoc

    @Test func doctrinaTipoDocLabels() {
        #expect(DoctrinaTipoDoc.concepto.label == "Concepto")
        #expect(DoctrinaTipoDoc.oficio.label == "Oficio")
        #expect(DoctrinaTipoDoc.doctrinaGeneral.label == "Doctrina General")
        #expect(DoctrinaTipoDoc.circular.label == "Circular")
    }

    @Test func doctrinaTipoDocAllCasesHas4() {
        #expect(DoctrinaTipoDoc.allCases.count == 4)
    }

    // MARK: - NovedadTipo

    @Test func novedadTipoAllCasesHas6() {
        #expect(NovedadTipo.allCases.count == 6)
    }

    @Test func novedadTipoLabels() {
        #expect(NovedadTipo.ley.label == "Ley")
        #expect(NovedadTipo.decreto.label == "Decreto")
        #expect(NovedadTipo.resolucion.label == "Resolucion")
    }

    // MARK: - NovedadImpacto

    @Test func novedadImpactoLabels() {
        #expect(NovedadImpacto.alto.label == "Alto")
        #expect(NovedadImpacto.medio.label == "Medio")
        #expect(NovedadImpacto.bajo.label == "Bajo")
    }

    // MARK: - IndicadorCategoria

    @Test func indicadorCategoriaLabels() {
        #expect(IndicadorCategoria.tributarios.label == "Tributarios")
        #expect(IndicadorCategoria.laborales.label == "Laborales")
        #expect(IndicadorCategoria.financieros.label == "Financieros")
        #expect(IndicadorCategoria.monetarios.label == "Monetarios")
    }

    // MARK: - DecisionNode

    @Test func decisionNodeEsPregunta() {
        let node = DecisionNode(
            id: "n1", tipo: "pregunta", texto: "Test?",
            opciones: [], recomendacion: nil, enlaces: [], ayudaRapida: nil
        )
        #expect(node.esPregunta)
        #expect(!node.esResultado)
    }

    @Test func decisionNodeEsResultado() {
        let node = DecisionNode(
            id: "n2", tipo: "resultado", texto: "Done.",
            opciones: [], recomendacion: "Do X", enlaces: [], ayudaRapida: nil
        )
        #expect(node.esResultado)
        #expect(!node.esPregunta)
    }

    // MARK: - GuiaEducativa

    @Test func guiaComplejidadLabel() {
        let guia = makeGuia(complejidad: "basica")
        #expect(guia.complejidadLabel == "Basica")
    }

    @Test func guiaComplejidadLabelIntermedia() {
        let guia = makeGuia(complejidad: "intermedia")
        #expect(guia.complejidadLabel == "Intermedia")
    }

    @Test func guiaComplejidadLabelAvanzada() {
        let guia = makeGuia(complejidad: "avanzada")
        #expect(guia.complejidadLabel == "Avanzada")
    }

    @Test func guiaComplejidadLabelUnknownCapitalizes() {
        let guia = makeGuia(complejidad: "custom")
        #expect(guia.complejidadLabel == "Custom")
    }

    @Test func guiaNodoByIdFindsNode() {
        let node = DecisionNode(id: "start", tipo: "pregunta", texto: "Q?", opciones: [], recomendacion: nil, enlaces: [], ayudaRapida: nil)
        let guia = GuiaEducativa(id: "g1", titulo: "Test", descripcion: "D", categoria: "renta", complejidad: "basica", nodos: [node], nodoInicial: "start")
        #expect(guia.nodo(byId: "start") != nil)
        #expect(guia.nodo(byId: "missing") == nil)
    }

    // MARK: - DashboardStats.TopArticle

    @Test func topArticleCountPrefersMods() {
        let a = DashboardStats.TopArticle(id: "1", slug: "art-1", titulo: "T", estado: "vigente", totalMods: 15, totalRefs: nil)
        #expect(a.count == 15)
    }

    @Test func topArticleCountFallsToRefs() {
        let a = DashboardStats.TopArticle(id: "2", slug: "art-2", titulo: "T", estado: "vigente", totalMods: nil, totalRefs: 8)
        #expect(a.count == 8)
    }

    @Test func topArticleCountDefaultsToZero() {
        let a = DashboardStats.TopArticle(id: "3", slug: "art-3", titulo: "T", estado: "vigente", totalMods: nil, totalRefs: nil)
        #expect(a.count == 0)
    }

    // MARK: - Helpers

    private func makeRetencion(id: String) -> RetencionConceptoCompleto {
        RetencionConceptoCompleto(
            id: id, concepto: "Test", baseMinUVT: 0, tarifa: 0,
            tarifaNoDeclarante: nil, articulo: "392", notas: nil,
            descripcion: nil, keywords: [], aplicaA: "ambos", linkCalculadora: nil
        )
    }

    private func makeGuia(complejidad: String) -> GuiaEducativa {
        GuiaEducativa(
            id: "g", titulo: "T", descripcion: "D", categoria: "renta",
            complejidad: complejidad, nodos: [], nodoInicial: "start"
        )
    }
}
