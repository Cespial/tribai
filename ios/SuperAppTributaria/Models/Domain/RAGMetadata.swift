import Foundation

struct RAGMetadata: Codable, Equatable {
    // Retrieval stats
    let chunksRetrieved: Int?
    let chunksAfterReranking: Int?
    let uniqueArticles: Int?
    let tokensUsed: Int?
    let tokensBudget: Int?

    // Query processing
    let queryEnhanced: Bool?
    let hydeGenerated: Bool?
    let subQueriesCount: Int?

    // Scoring
    let topScore: Double?
    let medianScore: Double?
    let dynamicThreshold: Double?

    // Classification
    let queryType: String?
    let namespacesSearched: [String]?

    // Advanced features
    let siblingChunksAdded: Int?
    let embeddingCacheHitRate: Double?

    // Confidence & evidence
    let confidenceLevel: ConfidenceLevel?
    let evidenceQuality: Double?
    let namespaceContribution: [String: Int]?
    let contradictionFlags: Bool?

    // Performance timing
    let pipelineMs: Double?
    let timings: PipelineTimings?

    // Degraded mode
    let degradedMode: Bool?
    let degradedReason: String?
}

enum ConfidenceLevel: String, Codable {
    case high
    case medium
    case low
}

struct PipelineTimings: Codable, Equatable {
    let queryEnhancement: Double?
    let retrieval: Double?
    let reranking: Double?
    let contextAssembly: Double?
    let promptBuilding: Double?
    let totalPipeline: Double?
}
