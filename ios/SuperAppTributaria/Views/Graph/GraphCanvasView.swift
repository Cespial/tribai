import SwiftUI

struct GraphCanvasView: View {
    let nodes: [GraphNode]
    let edges: [GraphEdge]
    let positions: [String: CGPoint]
    let nodeRadius: (GraphNode) -> CGFloat
    let selectedNode: GraphNode?
    let onNodeTapped: (GraphNode) -> Void

    @State private var scale: CGFloat = 0.4
    @State private var offset: CGSize = .zero
    @State private var lastOffset: CGSize = .zero

    var body: some View {
        GeometryReader { geo in
            let centerOffset = CGSize(
                width: geo.size.width / 2 - 500 * scale + offset.width,
                height: geo.size.height / 2 - 500 * scale + offset.height
            )

            Canvas { context, size in
                // Apply transform
                context.translateBy(x: centerOffset.width, y: centerOffset.height)
                context.scaleBy(x: scale, y: scale)

                // Draw edges
                for edge in edges {
                    guard let from = positions[edge.source],
                          let to = positions[edge.target] else { continue }

                    var path = Path()
                    path.move(to: from)
                    path.addLine(to: to)
                    context.stroke(path, with: .color(.gray.opacity(0.2)), lineWidth: 0.7 / scale)
                }

                // Draw nodes
                for node in nodes {
                    guard let pos = positions[node.id] else { continue }

                    let radius = nodeRadius(node)
                    let isSelected = selectedNode?.id == node.id
                    let color = LibroColor.color(for: node.libro)

                    // Selection ring
                    if isSelected {
                        let ringRect = CGRect(
                            x: pos.x - radius - 3,
                            y: pos.y - radius - 3,
                            width: (radius + 3) * 2,
                            height: (radius + 3) * 2
                        )
                        context.fill(
                            Path(ellipseIn: ringRect),
                            with: .color(color.opacity(0.3))
                        )
                    }

                    // Node circle
                    let rect = CGRect(
                        x: pos.x - radius,
                        y: pos.y - radius,
                        width: radius * 2,
                        height: radius * 2
                    )
                    context.fill(Path(ellipseIn: rect), with: .color(color))

                    // Labels when zoomed in
                    if scale > 0.7 {
                        let text = Text(node.label)
                            .font(.system(size: max(8, 10 / scale)))
                            .foregroundStyle(Color.appForeground)
                        context.draw(
                            text,
                            at: CGPoint(x: pos.x, y: pos.y + radius + 8),
                            anchor: .top
                        )
                    }
                }
            }
            .gesture(
                SimultaneousGesture(
                    MagnificationGesture()
                        .onChanged { value in
                            scale = max(0.15, min(3.0, scale * value))
                        },
                    DragGesture()
                        .onChanged { value in
                            offset = CGSize(
                                width: lastOffset.width + value.translation.width,
                                height: lastOffset.height + value.translation.height
                            )
                        }
                        .onEnded { _ in
                            lastOffset = offset
                        }
                )
            )
            .onTapGesture { location in
                handleTap(at: location, in: geo.size, centerOffset: centerOffset)
            }
        }
    }

    private func handleTap(at location: CGPoint, in size: CGSize, centerOffset: CGSize) {
        // Transform screen coordinates to graph coordinates
        let graphX = (location.x - centerOffset.width) / scale
        let graphY = (location.y - centerOffset.height) / scale

        // Find nearest node within tap radius
        let tapRadius: CGFloat = 20 / scale
        var closest: GraphNode?
        var closestDist: CGFloat = .infinity

        for node in nodes {
            guard let pos = positions[node.id] else { continue }
            let dx = pos.x - graphX
            let dy = pos.y - graphY
            let dist = sqrt(dx * dx + dy * dy)
            if dist < tapRadius && dist < closestDist {
                closest = node
                closestDist = dist
            }
        }

        if let node = closest {
            onNodeTapped(node)
        }
    }
}
