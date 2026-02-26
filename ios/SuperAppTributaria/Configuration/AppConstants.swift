import Foundation

enum AppConstants {
    enum Chat {
        static let maxMessages = 50
        static let maxMessageLength = 5000
        static let maxConversations = 30
        static let maxMessagesPerConversation = 80
        static let conversationTitleMaxLength = 72
    }

    enum RateLimit {
        static let maxRequests = 20
        static let windowSeconds: TimeInterval = 60
        static let baseBackoffSeconds: TimeInterval = 2
        static let maxBackoffSeconds: TimeInterval = 60
    }

    enum Health {
        static let pollingInterval: TimeInterval = 300 // 5 minutes
    }

    enum Tax2026 {
        static let uvt = "$52,374"
        static let smlmv = "$1,750,905"
        static let auxilioTransporte = "$249,095"
    }

    static let suggestedQuestions = [
        "Debo declarar renta por ingresos de 2025?",
        "Cómo calculo retención en la fuente por salarios?",
        "Qué sanción aplica por declarar extemporáneo?",
        "Muéstreme el artículo del ET sobre ganancias ocasionales.",
    ]

    enum TypingLabels {
        static let searching = "Buscando en el Estatuto Tributario..."
        static let analyzing = "Analizando artículos relevantes..."
        static let drafting = "Redactando respuesta jurídica..."

        static let searchDelay: TimeInterval = 0
        static let analyzeDelay: TimeInterval = 1.5
        static let draftDelay: TimeInterval = 3.5
    }
}
