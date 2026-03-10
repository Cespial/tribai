import Testing
import Foundation
@testable import SuperAppTributaria

struct GuiasDataTests {

    // MARK: - Guide Count

    @Test func guiasHas7Entries() {
        #expect(GuiasData.guias.count == 7)
    }

    // MARK: - IDs Unique

    @Test func allIdsAreUnique() {
        let ids = GuiasData.guias.map(\.id)
        #expect(ids.count == Set(ids).count)
    }

    // MARK: - Known Guides

    @Test func containsDeclararRenta() {
        let guia = GuiasData.guias.first { $0.id == "declarar-renta" }
        #expect(guia != nil)
        #expect(guia?.categoria == "renta")
        #expect(guia?.complejidad == "basica")
    }

    @Test func containsSIMPLEvsOrdinario() {
        let guia = GuiasData.guias.first { $0.id == "simple-vs-ordinario" }
        #expect(guia != nil)
        #expect(guia?.complejidad == "intermedia")
    }

    @Test func containsResponsableIVA() {
        let guia = GuiasData.guias.first { $0.id == "responsable-iva" }
        #expect(guia != nil)
    }

    // MARK: - Decision Tree Integrity

    @Test func allGuidesHaveNodoInicial() {
        for guia in GuiasData.guias {
            let initial = guia.nodo(byId: guia.nodoInicial)
            #expect(initial != nil, "\(guia.id) has invalid nodoInicial: \(guia.nodoInicial)")
        }
    }

    @Test func allGuideStartsWithPregunta() {
        for guia in GuiasData.guias {
            let initial = guia.nodo(byId: guia.nodoInicial)!
            #expect(initial.esPregunta, "\(guia.id) initial node is not a pregunta")
        }
    }

    @Test func allOptionTargetsExist() {
        for guia in GuiasData.guias {
            let nodeIds = Set(guia.nodos.map(\.id))
            for nodo in guia.nodos where nodo.esPregunta {
                for option in nodo.opciones {
                    #expect(nodeIds.contains(option.nextNodeId),
                           "\(guia.id): option '\(option.label)' in node '\(nodo.id)' points to missing node '\(option.nextNodeId)'")
                }
            }
        }
    }

    @Test func allResultNodesHaveRecomendacion() {
        for guia in GuiasData.guias {
            for nodo in guia.nodos where nodo.esResultado {
                #expect(nodo.recomendacion != nil,
                       "\(guia.id): result node '\(nodo.id)' has no recomendacion")
            }
        }
    }

    @Test func preguntaNodesHaveOptions() {
        for guia in GuiasData.guias {
            for nodo in guia.nodos where nodo.esPregunta {
                #expect(!nodo.opciones.isEmpty,
                       "\(guia.id): pregunta node '\(nodo.id)' has no opciones")
            }
        }
    }

    @Test func resultNodesHaveNoOptions() {
        for guia in GuiasData.guias {
            for nodo in guia.nodos where nodo.esResultado {
                #expect(nodo.opciones.isEmpty,
                       "\(guia.id): result node '\(nodo.id)' should have no opciones")
            }
        }
    }

    // MARK: - GuiaEducativa Helpers

    @Test func complejidadLabelBasica() {
        let guia = GuiasData.guias.first { $0.complejidad == "basica" }!
        #expect(guia.complejidadLabel == "Basica")
    }

    @Test func complejidadLabelIntermedia() {
        let guia = GuiasData.guias.first { $0.complejidad == "intermedia" }!
        #expect(guia.complejidadLabel == "Intermedia")
    }

    @Test func nodoByIdReturnsNilForUnknown() {
        let guia = GuiasData.guias[0]
        #expect(guia.nodo(byId: "nonexistent") == nil)
    }

    // MARK: - DecisionNode Helpers

    @Test func esPreguntaReturnsTrue() {
        let node = DecisionNode(
            id: "test",
            tipo: "pregunta",
            texto: "Q?",
            opciones: [DecisionOption(label: "Yes", nextNodeId: "a")],
            recomendacion: nil,
            enlaces: [],
            ayudaRapida: nil
        )
        #expect(node.esPregunta)
        #expect(!node.esResultado)
    }

    @Test func esResultadoReturnsTrue() {
        let node = DecisionNode(
            id: "test",
            tipo: "resultado",
            texto: "R",
            opciones: [],
            recomendacion: "Do X",
            enlaces: [],
            ayudaRapida: nil
        )
        #expect(node.esResultado)
        #expect(!node.esPregunta)
    }

    // MARK: - Metadata

    @Test func lastUpdateIsSet() {
        #expect(!GuiasData.lastUpdate.isEmpty)
    }
}
