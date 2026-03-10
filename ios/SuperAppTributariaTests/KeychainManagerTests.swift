import Testing
import Foundation
@testable import SuperAppTributaria

struct KeychainManagerTests {

    // MARK: - KeychainError type tests

    @Test func keychainErrorDuplicateItem() {
        let error = KeychainManager.KeychainError.duplicateItem
        #expect(error is Error)
    }

    @Test func keychainErrorItemNotFound() {
        let error = KeychainManager.KeychainError.itemNotFound
        #expect(error is Error)
    }

    @Test func keychainErrorUnexpectedStatus() {
        let error = KeychainManager.KeychainError.unexpectedStatus(-25300)
        #expect(error is Error)
    }

    @Test func keychainErrorsAreDistinct() {
        let dup = KeychainManager.KeychainError.duplicateItem
        let notFound = KeychainManager.KeychainError.itemNotFound
        let unexpected = KeychainManager.KeychainError.unexpectedStatus(0)

        // Mirror-based check that all cases are different
        let dupMirror = String(describing: dup)
        let notFoundMirror = String(describing: notFound)
        let unexpectedMirror = String(describing: unexpected)

        #expect(dupMirror != notFoundMirror)
        #expect(dupMirror != unexpectedMirror)
        #expect(notFoundMirror != unexpectedMirror)
    }

    @Test func keychainErrorUnexpectedStatusCarriesCode() {
        let error = KeychainManager.KeychainError.unexpectedStatus(-25299)
        if case .unexpectedStatus(let code) = error {
            #expect(code == -25299)
        } else {
            #expect(Bool(false), "Expected unexpectedStatus case")
        }
    }
}
