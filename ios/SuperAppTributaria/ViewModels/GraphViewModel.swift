import Foundation
import SwiftUI

@MainActor
@Observable
final class GraphViewModel {
    // MARK: - Data

    private var allNodes: [GraphNode] = []
    private var allEdges: [GraphEdge] = []

    var filteredNodes: [GraphNode] = []
    var filteredEdges: [GraphEdge] = []

    // MARK: - Filters

    var selectedLibro: String? = nil
    var minDegree: Int = 1
    var maxVisibleNodes: Int = 220

    // MARK: - UI State

    var selectedNode: GraphNode? = nil
    var isLoaded: Bool = false

    // MARK: - Stats

    var totalNodes: Int { allNodes.count }
    var totalEdges: Int { allEdges.count }
    var visibleNodesCount: Int { filteredNodes.count }
    var visibleEdgesCount: Int { filteredEdges.count }

    // MARK: - Force Layout State

    var nodePositions: [String: CGPoint] = [:]
    var isSimulating: Bool = false
    private var simulationTask: Task<Void, Never>?

    // MARK: - Load

    func loadData() {
        guard let data = GraphData.load() else { return }
        allNodes = data.nodes
        allEdges = data.edges
        applyFilters()
        isLoaded = true
        runForceLayout()
    }

    // MARK: - Filters

    func applyFilters() {
        var nodes = allNodes

        // Filter by libro
        if let libro = selectedLibro {
            nodes = nodes.filter { $0.libro == libro }
        }

        // Filter by minimum degree
        if minDegree > 1 {
            nodes = nodes.filter { $0.degree >= minDegree }
        }

        // Sort by degree (most connected first), then cap
        nodes.sort { $0.degree > $1.degree }
        nodes = Array(nodes.prefix(maxVisibleNodes))

        filteredNodes = nodes

        // Only include edges where both endpoints are visible
        let visibleIds = Set(nodes.map(\.id))
        filteredEdges = allEdges.filter { visibleIds.contains($0.source) && visibleIds.contains($0.target) }
    }

    func setLibroFilter(_ libro: String?) {
        selectedLibro = libro
        applyFilters()
        runForceLayout()
    }

    func setMinDegree(_ degree: Int) {
        minDegree = degree
        applyFilters()
        runForceLayout()
    }

    func setMaxVisible(_ count: Int) {
        maxVisibleNodes = count
        applyFilters()
        runForceLayout()
    }

    // MARK: - Force-Directed Layout

    func runForceLayout() {
        simulationTask?.cancel()
        isSimulating = true

        let nodes = filteredNodes
        let edges = filteredEdges

        // Initialize positions in a circle
        let center = CGPoint(x: 500, y: 500)
        let radius: CGFloat = 400
        var positions: [String: CGPoint] = [:]
        for (i, node) in nodes.enumerated() {
            let angle = CGFloat(i) / CGFloat(nodes.count) * 2 * .pi
            positions[node.id] = CGPoint(
                x: center.x + radius * cos(angle),
                y: center.y + radius * sin(angle)
            )
        }

        // Build adjacency for faster lookup
        let nodeSet = Set(nodes.map(\.id))
        let adjacency = Dictionary(grouping: edges, by: \.source)
            .merging(Dictionary(grouping: edges, by: \.target)) { $0 + $1 }

        simulationTask = Task { [weak self] in
            // Run simulation iterations
            let iterations = 120
            let repulsionStrength: CGFloat = 8000
            let attractionStrength: CGFloat = 0.005
            let damping: CGFloat = 0.92
            let idealLength: CGFloat = 80

            var velocities: [String: CGPoint] = [:]
            for id in nodeSet {
                velocities[id] = .zero
            }

            for iteration in 0..<iterations {
                if Task.isCancelled { return }

                let temperature = CGFloat(iterations - iteration) / CGFloat(iterations)

                // Repulsion (all pairs — simplified with spatial bucketing for perf)
                let nodeIds = Array(nodeSet)
                for i in 0..<nodeIds.count {
                    for j in (i + 1)..<nodeIds.count {
                        let idA = nodeIds[i]
                        let idB = nodeIds[j]
                        guard let posA = positions[idA], let posB = positions[idB] else { continue }

                        let dx = posA.x - posB.x
                        let dy = posA.y - posB.y
                        let distSq = max(dx * dx + dy * dy, 1)
                        let dist = sqrt(distSq)
                        let force = repulsionStrength / distSq * temperature
                        let fx = dx / dist * force
                        let fy = dy / dist * force

                        velocities[idA]?.x += fx
                        velocities[idA]?.y += fy
                        velocities[idB]?.x -= fx
                        velocities[idB]?.y -= fy
                    }
                }

                // Attraction (along edges)
                for edge in edges {
                    guard let posS = positions[edge.source], let posT = positions[edge.target] else { continue }
                    let dx = posT.x - posS.x
                    let dy = posT.y - posS.y
                    let dist = max(sqrt(dx * dx + dy * dy), 1)
                    let displacement = dist - idealLength
                    let force = attractionStrength * displacement * temperature
                    let fx = dx / dist * force
                    let fy = dy / dist * force

                    velocities[edge.source]?.x += fx
                    velocities[edge.source]?.y += fy
                    velocities[edge.target]?.x -= fx
                    velocities[edge.target]?.y -= fy
                }

                // Center gravity
                for id in nodeIds {
                    guard let pos = positions[id] else { continue }
                    let dx = center.x - pos.x
                    let dy = center.y - pos.y
                    velocities[id]?.x += dx * 0.001 * temperature
                    velocities[id]?.y += dy * 0.001 * temperature
                }

                // Apply velocities with damping
                for id in nodeIds {
                    guard var vel = velocities[id], var pos = positions[id] else { continue }
                    vel.x *= damping
                    vel.y *= damping
                    let maxVel: CGFloat = 50 * temperature
                    vel.x = max(-maxVel, min(maxVel, vel.x))
                    vel.y = max(-maxVel, min(maxVel, vel.y))
                    pos.x += vel.x
                    pos.y += vel.y
                    positions[id] = pos
                    velocities[id] = vel
                }

                // Update UI every 10 iterations
                if iteration % 10 == 0 || iteration == iterations - 1 {
                    let currentPositions = positions
                    await MainActor.run { [weak self] in
                        self?.nodePositions = currentPositions
                    }
                }
            }

            await MainActor.run { [weak self] in
                self?.isSimulating = false
            }
        }
    }

    // MARK: - Node Sizing

    func nodeRadius(for node: GraphNode) -> CGFloat {
        3 + CGFloat(node.complexity) * 0.8
    }
}
