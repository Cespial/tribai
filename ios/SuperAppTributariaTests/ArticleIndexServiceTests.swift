import Testing
import Foundation
@testable import SuperAppTributaria

struct ArticleIndexServiceTests {

    // MARK: - Data Integrity

    /// Verifies the bundled articles-index.enriched.json contains exactly 1,294 articles.
    /// This guards against accidental data loss or corruption in the resource file.
    @Test func articleIndexHas1294Articles() throws {
        // Locate the JSON relative to this test file's position in the source tree.
        // Test file:  <root>/SuperAppTributariaTests/ArticleIndexServiceTests.swift
        // JSON file:  <root>/SuperAppTributaria/Resources/articles-index.enriched.json
        let testFile = URL(fileURLWithPath: #filePath)
        let projectRoot = testFile
            .deletingLastPathComponent()   // SuperAppTributariaTests/
            .deletingLastPathComponent()   // project root
        let jsonURL = projectRoot
            .appendingPathComponent("SuperAppTributaria")
            .appendingPathComponent("Resources")
            .appendingPathComponent("articles-index.enriched.json")

        let data = try Data(contentsOf: jsonURL)
        let articles = try JSONDecoder().decode([ArticleIndexItem].self, from: data)
        #expect(articles.count == 1294, "Expected 1294 articles but found \(articles.count)")
    }
}
