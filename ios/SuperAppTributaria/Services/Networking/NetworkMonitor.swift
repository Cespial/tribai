import Foundation
import Network

@MainActor
@Observable
final class NetworkMonitor {
    private let monitor = NWPathMonitor()
    private let queue = DispatchQueue(label: "NetworkMonitor")

    var isConnected = true
    var connectionType: ConnectionType = .unknown

    init() {
        monitor.pathUpdateHandler = { [weak self] path in
            let isConnected = path.status == .satisfied
            let type = Self.getConnectionType(path)
            Task { @MainActor [weak self] in
                self?.isConnected = isConnected
                self?.connectionType = type
            }
        }
        monitor.start(queue: queue)
    }

    deinit {
        monitor.cancel()
    }

    private nonisolated static func getConnectionType(_ path: NWPath) -> ConnectionType {
        if path.usesInterfaceType(.wifi) { return .wifi }
        if path.usesInterfaceType(.cellular) { return .cellular }
        if path.usesInterfaceType(.wiredEthernet) { return .ethernet }
        return .unknown
    }
}

enum ConnectionType {
    case wifi
    case cellular
    case ethernet
    case unknown
}
