import Testing
import Foundation
@testable import SuperAppTributaria

struct RAGMetadataTests {

    // MARK: - ConfidenceLevel

    @Test func confidenceLevelRawValues() {
        #expect(ConfidenceLevel.high.rawValue == "high")
        #expect(ConfidenceLevel.medium.rawValue == "medium")
        #expect(ConfidenceLevel.low.rawValue == "low")
    }

    @Test func confidenceLevelDecodesFromJSON() throws {
        let json = #"{"chunksRetrieved": 10, "confidenceLevel": "high"}"#
        let data = json.data(using: .utf8)!
        let decoded = try JSONDecoder().decode(RAGMetadata.self, from: data)
        #expect(decoded.confidenceLevel == .high)
        #expect(decoded.chunksRetrieved == 10)
    }

    // MARK: - Full Decode

    @Test func decodesFullMetadata() throws {
        let json = """
        {
            "chunksRetrieved": 20,
            "chunksAfterReranking": 10,
            "uniqueArticles": 5,
            "tokensUsed": 8000,
            "tokensBudget": 12000,
            "queryEnhanced": true,
            "hydeGenerated": true,
            "subQueriesCount": 2,
            "topScore": 0.85,
            "medianScore": 0.65,
            "dynamicThreshold": 0.28,
            "queryType": "factual",
            "namespacesSearched": ["", "doctrina"],
            "siblingChunksAdded": 3,
            "embeddingCacheHitRate": 0.75,
            "confidenceLevel": "medium",
            "evidenceQuality": 0.72,
            "namespaceContribution": {"": 5, "doctrina": 3},
            "contradictionFlags": false,
            "pipelineMs": 1094.5,
            "degradedMode": false
        }
        """
        let data = json.data(using: .utf8)!
        let decoded = try JSONDecoder().decode(RAGMetadata.self, from: data)

        #expect(decoded.chunksRetrieved == 20)
        #expect(decoded.chunksAfterReranking == 10)
        #expect(decoded.queryEnhanced == true)
        #expect(decoded.hydeGenerated == true)
        #expect(decoded.topScore == 0.85)
        #expect(decoded.queryType == "factual")
        #expect(decoded.namespacesSearched == ["", "doctrina"])
        #expect(decoded.confidenceLevel == .medium)
        #expect(decoded.evidenceQuality == 0.72)
        #expect(decoded.contradictionFlags == false)
        #expect(decoded.degradedMode == false)
    }

    // MARK: - Partial Decode (all optionals)

    @Test func decodesWithMinimalData() throws {
        let json = "{}"
        let data = json.data(using: .utf8)!
        let decoded = try JSONDecoder().decode(RAGMetadata.self, from: data)

        #expect(decoded.chunksRetrieved == nil)
        #expect(decoded.topScore == nil)
        #expect(decoded.confidenceLevel == nil)
        #expect(decoded.degradedMode == nil)
    }

    // MARK: - PipelineTimings

    @Test func decodesTimings() throws {
        let json = """
        {
            "timings": {
                "queryEnhancement": 150.5,
                "retrieval": 300.0,
                "reranking": 50.0,
                "contextAssembly": 25.0,
                "promptBuilding": 10.0,
                "totalPipeline": 535.5
            }
        }
        """
        let data = json.data(using: .utf8)!
        let decoded = try JSONDecoder().decode(RAGMetadata.self, from: data)

        #expect(decoded.timings?.queryEnhancement == 150.5)
        #expect(decoded.timings?.retrieval == 300.0)
        #expect(decoded.timings?.totalPipeline == 535.5)
    }

    // MARK: - Equatable

    @Test func emptyMetadatasAreEqual() throws {
        let json = "{}"
        let data = json.data(using: .utf8)!
        let a = try JSONDecoder().decode(RAGMetadata.self, from: data)
        let b = try JSONDecoder().decode(RAGMetadata.self, from: data)
        #expect(a == b)
    }
}
