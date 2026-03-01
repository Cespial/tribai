import Foundation

@MainActor
@Observable
final class GuiasViewModel {

    // MARK: - State

    var selectedGuia: GuiaEducativa?
    var currentNodeId: String?
    var history: [String] = []

    // MARK: - Computed

    var currentNode: DecisionNode? {
        guard let guia = selectedGuia, let nodeId = currentNodeId else { return nil }
        return guia.nodo(byId: nodeId)
    }

    var canGoBack: Bool {
        !history.isEmpty
    }

    /// Estimated progress through the decision tree (0.0 ... 1.0).
    /// Uses current step depth relative to the total node count as a heuristic.
    var progress: Double {
        guard let guia = selectedGuia, !guia.nodos.isEmpty else { return 0 }
        let currentStep = Double(history.count + 1)
        let totalNodes = Double(guia.nodos.count)
        return min(currentStep / totalNodes, 1.0)
    }

    // MARK: - Actions

    func startGuia(_ guia: GuiaEducativa) {
        selectedGuia = guia
        currentNodeId = guia.nodoInicial
        history = []
    }

    func selectOption(nextNodeId: String) {
        guard let currentId = currentNodeId else { return }
        guard selectedGuia?.nodo(byId: nextNodeId) != nil else { return }
        history.append(currentId)
        currentNodeId = nextNodeId
    }

    func goBack() {
        guard let previousId = history.popLast() else { return }
        currentNodeId = previousId
    }

    func reset() {
        guard let guia = selectedGuia else { return }
        currentNodeId = guia.nodoInicial
        history = []
    }
}
